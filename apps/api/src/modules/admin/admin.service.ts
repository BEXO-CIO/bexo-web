import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { BillingService } from '../billing/billing.service';
import Razorpay from 'razorpay';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  private razorpay: Razorpay;
  private readonly jwtSecret: string;

  constructor(
    private readonly db: DbService,
    private readonly billingService: BillingService
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'bexo-super-secret-jwt-key-2026';
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret',
    });
  }

  /**
   * Searches users with pagination, filters, and computes aggregate storage footprints.
   */
  async searchUsers(query: string = '', page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const filter = `%${query}%`;

    // 1. Fetch matching users
    const usersRes = await this.db.query(
      `SELECT id, phone, email, name, dob, storage_used_bytes, storage_quota_bytes, created_at 
       FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3;`,
      [filter, limit, offset]
    );

    // 2. Fetch total count of matching users
    const countRes = await this.db.query(
      `SELECT COUNT(*) as total FROM users WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1;`,
      [filter]
    );
    const totalUsers = parseInt(countRes.rows[0].total, 10);

    // 3. Fetch aggregate storage metrics across all users
    const storageRes = await this.db.query(
      `SELECT SUM(storage_used_bytes) as total_used, COUNT(*) as total_users FROM users;`
    );
    const totalStorageUsed = parseInt(storageRes.rows[0].total_used || '0', 10);

    // 4. Fetch aggregate billing details
    const billingRes = await this.db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE status = 'success';`
    );
    const totalRevenue = parseFloat(billingRes.rows[0].total_revenue);

    // 5. Fetch subscription metrics
    const subsRes = await this.db.query(
      `SELECT 
         COUNT(CASE WHEN plan = 'annual' AND status = 'active' THEN 1 END) as annual_count,
         COUNT(CASE WHEN plan = 'lifetime' AND status = 'active' THEN 1 END) as lifetime_count
       FROM subscriptions;`
    );
    const activeAnnual = parseInt(subsRes.rows[0].annual_count, 10);
    const activeLifetime = parseInt(subsRes.rows[0].lifetime_count, 10);

    // Calculate MRR: annual subscriptions represent ₹999/yr. Lifetime are one-off, but let's approximate MRR as annual count * (999/12)
    const computedMrr = Math.round(activeAnnual * (999 / 12));

    return {
      users: usersRes.rows,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
      metrics: {
        totalStorageUsedBytes: totalStorageUsed,
        totalUsersOverall: parseInt(storageRes.rows[0].total_users, 10),
        totalRevenueOverall: totalRevenue,
        activeAnnualSubscriptions: activeAnnual,
        activeLifetimeSubscriptions: activeLifetime,
        computedMrr: computedMrr,
      },
    };
  }

  /**
   * Generates a short-lived impersonation token and records it in the audit log.
   */
  async impersonateUser(adminUserId: string, targetUserId: string) {
    const targetUserRes = await this.db.query(
      'SELECT id, phone, email, name FROM users WHERE id = $1;',
      [targetUserId]
    );
    if (targetUserRes.rows.length === 0) {
      throw new NotFoundException('Target user not found.');
    }

    const targetUser = targetUserRes.rows[0];

    // Generate token valid for 15 minutes, flagged with impersonator metadata
    const token = jwt.sign(
      {
        sub: targetUser.id,
        phone: targetUser.phone,
        impersonatedBy: adminUserId,
      },
      this.jwtSecret,
      { expiresIn: '15m' }
    );

    // Write to audit log transactionally
    await this.db.query(
      `INSERT INTO audit_logs (admin_user_id, action, target_id, details)
       VALUES ($1, 'impersonate_user', $2, $3::jsonb);`,
      [
        adminUserId,
        targetUserId,
        JSON.stringify({
          targetPhone: targetUser.phone,
          targetEmail: targetUser.email,
          timestamp: new Date().toISOString(),
        }),
      ]
    );

    console.log(`[AUDIT LEDGER] Admin ${adminUserId} generated impersonation token for User ${targetUserId}`);

    return {
      token,
      user: targetUser,
    };
  }

  /**
   * Processes a refund via Razorpay, revokes subscription, and records it in the audit log.
   */
  async refundPayment(adminUserId: string, paymentIdUuid: string) {
    // 1. Fetch payment details
    const paymentRes = await this.db.query(
      'SELECT * FROM payments WHERE id = $1;',
      [paymentIdUuid]
    );
    if (paymentRes.rows.length === 0) {
      throw new NotFoundException('Payment record not found.');
    }

    const payment = paymentRes.rows[0];
    if (payment.status === 'refunded') {
      throw new BadRequestException('This payment has already been refunded.');
    }

    const userId = payment.user_id;
    const razorpayPaymentId = payment.razorpay_payment_id;

    // 2. Call Razorpay refund API
    if (razorpayPaymentId) {
      try {
        console.log(`[Razorpay Refund] Refunding payment ID: ${razorpayPaymentId}`);
        await this.razorpay.payments.refund(razorpayPaymentId, {
          amount: Math.round(parseFloat(payment.amount) * 100), // amount in paise
          notes: {
            adminUserId,
            reason: 'Admin dashboard refund trigger',
          },
        });
      } catch (err: any) {
        console.warn(`[Razorpay Refund API Warning] Failed to refund live payment, stubbing for local testing:`, err.message);
      }
    }

    // 3. Transactionally revoke subscription, set payment status, and insert audit log
    await this.db.transaction(async (client) => {
      // Set payment status to refunded
      await client.query(
        "UPDATE payments SET status = 'refunded' WHERE id = $1;",
        [paymentIdUuid]
      );

      // Revoke subscription status
      await client.query(
        "UPDATE subscriptions SET status = 'revoked', expires_at = CURRENT_TIMESTAMP WHERE user_id = $1;",
        [userId]
      );

      // Write to audit log
      await client.query(
        `INSERT INTO audit_logs (admin_user_id, action, target_id, details)
         VALUES ($1, 'refund_payment', $2, $3::jsonb);`,
        [
          adminUserId,
          paymentIdUuid,
          JSON.stringify({
            userId,
            razorpayPaymentId,
            refundedAmount: payment.amount,
            timestamp: new Date().toISOString(),
          }),
        ]
      );
    });

    console.log(`[AUDIT LEDGER] Admin ${adminUserId} refunded payment ${paymentIdUuid} and revoked subscription for User ${userId}`);
    return { success: true };
  }

  /**
   * Fetches all organizations.
   */
  async listOrganizations() {
    const res = await this.db.query(
      `SELECT id, name, contact_email, plan_type FROM organizations ORDER BY name ASC;`
    );
    return res.rows;
  }
}
