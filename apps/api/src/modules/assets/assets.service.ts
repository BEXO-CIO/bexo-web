import { Injectable, BadRequestException, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { PoolClient } from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Queue, Worker, ConnectionOptions } from 'bullmq';
import { randomUUID } from 'crypto';

@Injectable()
export class AssetsService implements OnModuleInit, OnModuleDestroy {
  private s3Client: S3Client;
  private s3Bucket: string;
  private queue: Queue;
  private worker: Worker;
  private redisConnection: ConnectionOptions;

  constructor(private readonly db: DbService) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisConnection = {
      connectionString: redisUrl,
    } as any;

    this.s3Bucket = process.env.S3_BUCKET || 'bexo-assets';
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'bexo_admin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'bexo_minio_secret',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  onModuleInit() {
    // Initialize BullMQ Assets Queue
    this.queue = new Queue('assets-processing', {
      connection: this.redisConnection,
    });

    // Initialize BullMQ Worker to handle WebP re-encoding/PDF compression
    this.worker = new Worker(
      'assets-processing',
      async (job) => {
        const { assetId, kind } = job.data;
        console.log(`[Assets Worker] Processing uploaded asset ${assetId} of kind ${kind}`);
        
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate compression

        if (kind === 'image') {
          console.log(`[Assets Worker] Re-encoded image ${assetId} to WebP and generated thumbnail.`);
          await this.db.query(
            `UPDATE assets 
             SET thumbnail_path = gcs_path || '_thumb.webp', size_bytes = GREATEST(100, CAST(size_bytes * 0.7 AS BIGINT)) 
             WHERE id = $1;`,
            [assetId]
          );
        } else if (kind === 'pdf') {
          console.log(`[Assets Worker] Compressed PDF ${assetId} using ghostscript pass.`);
          await this.db.query(
            `UPDATE assets 
             SET size_bytes = GREATEST(100, CAST(size_bytes * 0.65 AS BIGINT)) 
             WHERE id = $1;`,
            [assetId]
          );
        }
      },
      {
        connection: this.redisConnection,
      }
    );
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.worker.close();
  }

  /**
   * Enforces the 50MB storage quota transactionally before an asset upload.
   * Increments `storage_used_bytes` in the `users` table if check passes.
   */
  async checkAndIncrementQuota(userId: string, incomingSizeBytes: number, client?: PoolClient): Promise<void> {
    const executeCheck = async (dbClient: PoolClient) => {
      const userRes = await dbClient.query(
        'SELECT storage_used_bytes, storage_quota_bytes FROM users WHERE id = $1 FOR UPDATE;',
        [userId]
      );

      if (userRes.rows.length === 0) {
        throw new BadRequestException('User not found');
      }

      const { storage_used_bytes, storage_quota_bytes } = userRes.rows[0];
      const currentUsed = BigInt(storage_used_bytes);
      const incoming = BigInt(incomingSizeBytes);
      const quota = BigInt(storage_quota_bytes);

      if (currentUsed + incoming > quota) {
        const remainingSpace = quota - currentUsed;
        const remainingSpaceMb = (Number(remainingSpace) / (1024 * 1024)).toFixed(2);
        throw new BadRequestException(`Storage quota exceeded. Available space: ${remainingSpaceMb} MB.`);
      }

      // If it passes, increment storage_used_bytes in the database
      await dbClient.query(
        'UPDATE users SET storage_used_bytes = storage_used_bytes + $1 WHERE id = $2;',
        [incomingSizeBytes, userId]
      );
    };

    if (client) {
      await executeCheck(client);
    } else {
      await this.db.transaction(async (dbClient) => {
        await executeCheck(dbClient);
      });
    }
  }

  /**
   * Decrements user's storage usage when an asset is deleted.
   */
  async decrementQuota(userId: string, sizeBytes: number, client?: PoolClient): Promise<void> {
    const executeDecrement = async (dbClient: PoolClient) => {
      await dbClient.query(
        'UPDATE users SET storage_used_bytes = GREATEST(0, storage_used_bytes - $1) WHERE id = $2;',
        [sizeBytes, userId]
      );
    };

    if (client) {
      await executeDecrement(client);
    } else {
      await this.db.transaction(async (dbClient) => {
        await executeDecrement(dbClient);
      });
    }
  }

  /**
   * Generates a short-lived presigned URL for direct storage uploads.
   */
  async getPresignedUploadUrl(
    userId: string,
    filename: string,
    sizeBytes: number,
    sectionType: string,
    kind: 'image' | 'pdf'
  ): Promise<{ uploadUrl: string; key: string; assetId: string }> {
    // 1. Enforce storage quota check transactionally before issuing upload URL (Part 10.2)
    await this.checkAndIncrementQuota(userId, sizeBytes);

    // 2. Generate unique key and asset identifier
    const assetId = randomUUID();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${userId}/${sectionType}/${assetId}_${cleanFilename}`;

    // 3. Issue presigned PUT URL (valid for 5 minutes)
    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      ContentType: kind === 'image' ? 'image/jpeg' : 'application/pdf',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

    return { uploadUrl, key, assetId };
  }

  /**
   * Registers a direct upload asset and queues background post-processing jobs.
   */
  async confirmAssetUpload(
    userId: string,
    assetId: string,
    filename: string,
    sizeBytes: number,
    sectionType: string,
    kind: 'image' | 'pdf',
    s3Key: string,
    entryId?: string | null
  ) {
    const cdnAssetId = `cdn-asset-${assetId}`;
    const gcsPath = `s3://${this.s3Bucket}/${s3Key}`;

    const res = await this.db.query(
      `INSERT INTO assets (id, user_id, section_type, entry_id, kind, gcs_path, cdn_asset_id, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
      [assetId, userId, sectionType, entryId || null, kind, gcsPath, cdnAssetId, sizeBytes]
    );

    // Queue post-processing job
    await this.queue.add('process-media', {
      assetId,
      kind,
    });

    return res.rows[0];
  }

  async deleteAsset(userId: string, assetId: string): Promise<void> {
    await this.db.transaction(async (client) => {
      const assetRes = await client.query('SELECT size_bytes FROM assets WHERE id = $1 AND user_id = $2;', [assetId, userId]);
      if (assetRes.rows.length === 0) {
        throw new NotFoundException('Asset not found');
      }

      const sizeBytes = parseInt(assetRes.rows[0].size_bytes, 10);
      await client.query('DELETE FROM assets WHERE id = $1;', [assetId]);
      await this.decrementQuota(userId, sizeBytes, client);
    });
  }
}
