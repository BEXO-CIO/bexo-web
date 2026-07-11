import { Injectable, BadRequestException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { PoolClient } from 'pg';

@Injectable()
export class AssetsService {
  constructor(private readonly db: DbService) {}

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
}
