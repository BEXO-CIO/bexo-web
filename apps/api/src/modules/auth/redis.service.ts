import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    console.log('Connecting to Redis:', redisUrl);
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
    });
    
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * Evaluates a sliding window rate limit using Redis.
   * Window size is in seconds. Limit is maximum allowed requests.
   * Returns a boolean indicating if request is allowed.
   */
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const clearBefore = now - (windowSeconds * 1000);

    const transaction = this.client.multi();
    transaction.zremrangebyscore(key, 0, clearBefore);
    transaction.zadd(key, now, now.toString());
    transaction.zcard(key);
    transaction.expire(key, windowSeconds);

    const results = await transaction.exec();
    if (!results) {
      return { allowed: true, remaining: limit };
    }

    const cardCount = results[2][1] as number;
    const allowed = cardCount <= limit;
    const remaining = Math.max(0, limit - cardCount);

    return { allowed, remaining };
  }
}
