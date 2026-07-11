import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ActivationService {
  constructor(private readonly db: DbService) {}

  /**
   * Generates a batch of human-readable activation keys for a partner college.
   */
  async generateKeysBatch(orgId: string, count: number): Promise<{ batchId: string; keys: string[] }> {
    const orgRes = await this.db.query('SELECT name FROM organizations WHERE id = $1;', [orgId]);
    if (orgRes.rows.length === 0) {
      throw new NotFoundException('Organization not found');
    }

    const batchId = randomUUID();
    const keys: string[] = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days validity

    await this.db.transaction(async (client) => {
      for (let i = 0; i < count; i++) {
        // Human-readable code e.g., CBM-A1B2-C3D4
        const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `CBM-${segment1}-${segment2}`;

        await client.query(
          `INSERT INTO activation_keys (code, org_id, batch_id, status, expires_at)
           VALUES ($1, $2, $3, 'unused', $4);`,
          [code, orgId, batchId, expiresAt]
        );

        keys.push(code);
      }
    });

    return { batchId, keys };
  }

  /**
   * Validates and redeems a key for a student to activate their premium subscription.
   */
  async redeemKey(userId: string, code: string) {
    return this.db.transaction(async (client) => {
      const keyRes = await client.query(
        'SELECT * FROM activation_keys WHERE code = $1 FOR UPDATE;',
        [code]
      );

      if (keyRes.rows.length === 0) {
        throw new BadRequestException('Invalid activation key.');
      }

      const key = keyRes.rows[0];

      if (key.status !== 'unused') {
        throw new BadRequestException(`Activation key is already ${key.status}.`);
      }

      if (key.expires_at && new Date(key.expires_at) < new Date()) {
        await client.query("UPDATE activation_keys SET status = 'expired' WHERE id = $1;", [key.id]);
        throw new BadRequestException('Activation key has expired.');
      }

      // Mark key as redeemed
      const now = new Date();
      await client.query(
        `UPDATE activation_keys 
         SET status = 'redeemed', redeemed_by_user_id = $1, redeemed_at = $2 
         WHERE id = $3;`,
        [userId, now, key.id]
      );

      // Create subscription row (1 year from now)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const subRes = await client.query(
        `INSERT INTO subscriptions (user_id, source, plan, activation_key_id, status, expires_at)
         VALUES ($1, 'activation_key', 'annual', $2, 'active', $3) RETURNING *;`,
        [userId, key.id, expiresAt]
      );

      return {
        success: true,
        subscription: subRes.rows[0],
      };
    });
  }
}
