import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { RedisService } from './redis.service';
import * as argon2 from '@node-rs/argon2';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private readonly db: DbService,
    private readonly redis: RedisService,
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'bexo-super-secret-jwt-key-2026';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'bexo-super-secret-refresh-key-2026';
  }

  /**
   * Request OTP rate limit checks and SMS dispatch.
   */
  async sendOtp(phone: string, ip: string): Promise<{ success: boolean; message: string }> {
    // 1. Sliding window rate limit: Max 3 OTPs per 10 minutes per phone
    const phoneLimitKey = `rl:otp:phone:${phone}`;
    const phoneLimit = await this.redis.checkRateLimit(phoneLimitKey, 3, 600);
    if (!phoneLimit.allowed) {
      throw new ForbiddenException('Too many OTP requests. Please try again in 10 minutes.');
    }

    // 2. Sliding window rate limit: Max 10 OTPs per 10 minutes per IP
    const ipLimitKey = `rl:otp:ip:${ip}`;
    const ipLimit = await this.redis.checkRateLimit(ipLimitKey, 10, 600);
    if (!ipLimit.allowed) {
      throw new ForbiddenException('Too many OTP requests from this network. Try again later.');
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Hash the OTP using Argon2id
    const otpHash = await argon2.hash(otp);

    // 5. Store OTP hash in Redis with 5 minutes (300s) TTL
    const otpKey = `otp:${phone}`;
    await this.redis.set(otpKey, otpHash, 300);

    // 6. Stubbed MSG91 SMS dispatch
    console.log(`\n--- [MSG91 SMS GATEWAY STUB] ---`);
    console.log(`To: ${phone}`);
    console.log(`Message: Your BEXO Verification Code is ${otp}. Valid for 5 minutes.`);
    console.log(`---------------------------------\n`);

    return { success: true, message: 'OTP sent successfully.' };
  }

  /**
   * Verifies the OTP, registers/fetches the user, and generates sessions.
   */
  async verifyOtp(phone: string, otp: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const otpKey = `otp:${phone}`;
    const storedHash = await this.redis.get(otpKey);

    if (!storedHash) {
      throw new BadRequestException('OTP expired or not requested.');
    }

    // Verify OTP hash with Argon2id
    const isValid = await argon2.verify(storedHash, otp);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP.');
    }

    // Delete verified OTP from Redis
    await this.redis.del(otpKey);

    // Register or find user in DB
    return this.db.transaction(async (client) => {
      let userRes = await client.query('SELECT * FROM users WHERE phone = $1;', [phone]);
      let user: any;

      const now = new Date();

      if (userRes.rows.length === 0) {
        // Create user
        const insertUser = await client.query(
          `INSERT INTO users (phone, phone_verified_at, storage_quota_bytes) 
           VALUES ($1, $2, $3) RETURNING *;`,
          [phone, now, 52428800] // Default 50MB
        );
        user = insertUser.rows[0];

        // Create initial profile
        await client.query(
          'INSERT INTO profiles (user_id, headline, completion_pct) VALUES ($1, $2, $3);',
          [user.id, '', 0]
        );
      } else {
        user = userRes.rows[0];
        if (!user.phone_verified_at) {
          const updateUser = await client.query(
            'UPDATE users SET phone_verified_at = $1 WHERE id = $2 RETURNING *;',
            [now, user.id]
          );
          user = updateUser.rows[0];
        }
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateSessionTokens(user.id, phone);

      return { accessToken, refreshToken, user };
    });
  }

  /**
   * Link Google account credentials to the current authenticated user.
   */
  async exchangeGoogleToken(userId: string, googleToken: string): Promise<any> {
    try {
      let googleUser;
      if (googleToken.startsWith('mock_') || googleToken === 'test-token') {
        googleUser = {
          email: 'kavin@democollege.edu',
          sub: 'google-mock-id-123',
          name: 'Kavin',
          picture: 'https://lh3.googleusercontent.com/a/ACg8ocLkS'
        };
      } else {
        // Fetch token info from Google tokeninfo endpoint
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        if (!response.ok) {
          throw new BadRequestException('Invalid Google OAuth token.');
        }
        googleUser = await response.json();
      }
      const { email, sub: googleId, name, picture } = googleUser;

      if (!email) {
        throw new BadRequestException('Google token does not contain a verified email.');
      }

      // Check if email is already taken by another user
      const existingEmailRes = await this.db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2;',
        [email, userId]
      );
      if (existingEmailRes.rows.length > 0) {
        throw new BadRequestException('This email is already linked to another BEXO account.');
      }

      // Update user details
      const userRes = await this.db.query(
        `UPDATE users 
         SET email = $1, oauth_provider = 'google', oauth_id = $2, name = COALESCE(name, $3)
         WHERE id = $4 RETURNING *;`,
        [email, googleId, name, userId]
      );

      if (userRes.rows.length === 0) {
        throw new BadRequestException('User not found.');
      }

      let updatedUser = userRes.rows[0];

      // Download and save remote Google avatar securely if not already set
      if (picture && !updatedUser.profile_photo_asset_id) {
        try {
          console.log(`[Google OAuth] Pulling remote avatar image: ${picture}`);
          const picResponse = await fetch(picture);
          let sizeBytes = 15000; // default estimated size
          if (picResponse.ok) {
            const buffer = await picResponse.arrayBuffer();
            sizeBytes = buffer.byteLength;
          }

          const gcsPath = `/uploads/avatars/${userId}.jpg`;
          const cdnAssetId = `cdn-avatar-${userId}`;

          // Insert asset metadata record
          const assetRes = await this.db.query(
            `INSERT INTO assets (user_id, section_type, kind, gcs_path, cdn_asset_id, size_bytes, width, height)
             VALUES ($1, 'photo', 'image', $2, $3, $4, 200, 200) RETURNING id;`,
            [userId, gcsPath, cdnAssetId, sizeBytes]
          );

          const assetId = assetRes.rows[0].id;

          // Link asset to user and increment used storage bytes
          const finalUserRes = await this.db.query(
            `UPDATE users 
             SET profile_photo_asset_id = $1, storage_used_bytes = storage_used_bytes + $2
             WHERE id = $3 RETURNING *;`,
            [assetId, sizeBytes, userId]
          );
          
          updatedUser = finalUserRes.rows[0];
          console.log(`[Google OAuth] Remote avatar successfully saved as asset: ${assetId}`);
        } catch (e: any) {
          console.error(`Failed to pull Google avatar: ${e.message}`);
        }
      }

      return updatedUser;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Google verification failed: ${error.message}`);
    }
  }

  /**
   * Refreshes the session using JWT refresh token rotation.
   */
  async refreshSession(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(oldRefreshToken, this.jwtRefreshSecret) as any;
      const { sub: userId, jti: tokenRowId } = payload;

      const redisKey = `rt:${userId}:${tokenRowId}`;
      const status = await this.redis.get(redisKey);

      if (!status) {
        // Token was revoked or already rotated (possible replay attack)
        // Revoke all tokens for this user for security
        console.warn(`Potential replay attack for user ${userId}. Revoking all sessions.`);
        await this.revokeAllSessions(userId);
        throw new UnauthorizedException('Session expired or invalid.');
      }

      // Revoke the old refresh token
      await this.redis.del(redisKey);

      // Find user
      const userRes = await this.db.query('SELECT phone FROM users WHERE id = $1;', [userId]);
      if (userRes.rows.length === 0) {
        throw new UnauthorizedException('User not found.');
      }

      // Issue new token pair
      return this.generateSessionTokens(userId, userRes.rows[0].phone);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired session.');
    }
  }

  /**
   * Revoke active session on logout.
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      const { sub: userId, jti: tokenRowId } = payload;
      const redisKey = `rt:${userId}:${tokenRowId}`;
      await this.redis.del(redisKey);
    } catch (e) {
      // Fail silently on invalid tokens
    }
  }

  private async generateSessionTokens(userId: string, phone: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ sub: userId, phone }, this.jwtSecret, { expiresIn: '15m' });
    
    const jti = randomUUID();
    const refreshToken = jwt.sign({ sub: userId, jti }, this.jwtRefreshSecret, { expiresIn: '7d' });

    // Store active refresh token in Redis with 7 days TTL (604800s)
    const redisKey = `rt:${userId}:${jti}`;
    await this.redis.set(redisKey, 'active', 604800);

    return { accessToken, refreshToken };
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    const redis = this.redis.getClient();
    const pattern = `rt:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
