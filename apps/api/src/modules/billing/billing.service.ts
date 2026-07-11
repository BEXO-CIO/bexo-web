import { Injectable, BadRequestException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  private razorpay: Razorpay;
  private webhookSecret: string;

  constructor(public readonly db: DbService) {
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'bexo_webhook_secret_2026';
    
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret',
    });
  }

  /**
   * Initializes a Razorpay order object for Checkout integration.
   */
  async createCheckoutOrder(userId: string, plan: 'annual' | 'lifetime') {
    let amount = 99900; // Annual ₹999 in paise
    if (plan === 'lifetime') {
      amount = 399900; // Lifetime ₹3,999 in paise
    }

    const receipt = `rcpt_${crypto.randomBytes(4).toString('hex')}`;

    try {
      const order = await this.razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt,
        notes: {
          userId,
          plan,
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        notes: order.notes,
      };
    } catch (err: any) {
      console.warn('[Razorpay API Warning] Failed to create live order, using fallback mock order:', err.message);
      // Fail-safe mock order parameters for local developer testing
      const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      return {
        orderId: mockOrderId,
        amount,
        currency: 'INR',
        notes: {
          userId,
          plan,
        },
        mock: true,
      };
    }
  }

  /**
   * Verifies the Razorpay webhook signature using HMAC-SHA256.
   */
  verifySignature(rawBody: string, signature: string): boolean {
    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return computedSignature === signature;
  }

  /**
   * Transactionally records the payment and provisions/updates the user subscription.
   */
  async processPaidWebhook(payload: any) {
    const payment = payload.payment?.entity;
    if (!payment) {
      throw new BadRequestException('Invalid payment entity in webhook payload.');
    }

    const notes = payment.notes || {};
    const userId = notes.userId;
    const plan = notes.plan;

    if (!userId || !plan) {
      console.warn('[Billing Webhook] Received paid event without userId/plan notes:', payment.id);
      return { success: false, reason: 'Missing metadata notes' };
    }

    const paymentId = payment.id;
    const amountInRupees = payment.amount / 100;

    await this.db.transaction(async (client) => {
      // 1. Insert a log entry into the payments table
      const paymentIdUuid = crypto.randomUUID();
      await client.query(
        `INSERT INTO payments (id, user_id, amount, razorpay_payment_id, status)
         VALUES ($1, $2, $3, $4, 'success');`,
        [paymentIdUuid, userId, amountInRupees, paymentId]
      );

      // 2. Calculate subscription expiry (null for lifetime, +1 year for annual)
      const expiresAt = new Date();
      if (plan === 'annual') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        // lifetime
        expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 years represents lifetime in standard DB dates
      }

      // 3. Update or insert user's subscription
      await client.query(
        `INSERT INTO subscriptions (user_id, source, plan, razorpay_sub_id, status, expires_at)
         VALUES ($1, 'purchase', $2, $3, 'active', $4)
         ON CONFLICT (user_id) 
         DO UPDATE SET source = 'purchase', plan = EXCLUDED.plan, razorpay_sub_id = EXCLUDED.razorpay_sub_id, status = 'active', expires_at = EXCLUDED.expires_at;`,
        [userId, plan, paymentId, expiresAt]
      );
    });

    console.log(`[Billing Webhook] Successfully processed payment ${paymentId} and activated ${plan} plan for user ${userId}`);
    return { success: true };
  }

  /**
   * Direct database query to revoke subscription (used by admin dashboard).
   */
  async revokeSubscription(userId: string) {
    await this.db.query(
      "UPDATE subscriptions SET status = 'revoked', expires_at = CURRENT_TIMESTAMP WHERE user_id = $1;",
      [userId]
    );
    return { success: true };
  }

  async getSubscriptionStatus(userId: string) {
    const res = await this.db.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 
         AND status = 'active' 
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) 
       LIMIT 1;`,
      [userId]
    );
    return {
      active: res.rows.length > 0,
      subscription: res.rows.length > 0 ? res.rows[0] : null,
    };
  }
}
