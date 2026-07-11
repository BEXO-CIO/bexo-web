import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { RedisService } from '../src/modules/auth/redis.service';
import { DbService } from '../src/db/db.service';
import * as argon2 from '@node-rs/argon2';
import * as cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let redis: RedisService;
  let db: DbService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const cookieParserFn = (cookieParser as any).default || cookieParser;
    app.use(cookieParserFn());
    app.setGlobalPrefix('api/v1');
    await app.init();

    redis = moduleFixture.get<RedisService>(RedisService);
    db = moduleFixture.get<DbService>(DbService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear test keys from Redis
    const client = redis.getClient();
    const keys = await client.keys('rl:otp:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    await client.del('otp:+919999999999');
    await client.del('otp:+918888888888');
  });

  describe('POST /api/v1/auth/phone/otp', () => {
    it('should successfully request an OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/phone/otp')
        .send({ phone: '+919999999999' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'OTP sent successfully.',
      });
    });

    it('should trigger rate-limiting after 3 requests within the window', async () => {
      const phone = '+918888888888';

      // First 3 requests succeed
      await request(app.getHttpServer())
        .post('/api/v1/auth/phone/otp')
        .send({ phone })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/phone/otp')
        .send({ phone })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/phone/otp')
        .send({ phone })
        .expect(200);

      // 4th request gets rate-limited (403 Forbidden)
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/phone/otp')
        .send({ phone })
        .expect(403);

      expect(response.body.message).toContain('Too many OTP requests');
    });
  });

  describe('POST /api/v1/auth/phone/otp/verify', () => {
    it('should verify the OTP and issue session tokens', async () => {
      const phone = '+919999999999';
      const otp = '123456';

      // 1. Manually set a mock OTP hash in Redis
      const otpHash = await argon2.hash(otp);
      await redis.set(`otp:${phone}`, otpHash, 300);

      // 2. Request verification
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/phone/otp/verify')
        .send({ phone, otp })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('phone', phone);
      expect(response.headers['set-cookie'][0]).toContain('jid=');
    });

    it('should fail verification if OTP is incorrect', async () => {
      const phone = '+919999999999';
      const otp = '123456';

      const otpHash = await argon2.hash(otp);
      await redis.set(`otp:${phone}`, otpHash, 300);

      await request(app.getHttpServer())
        .post('/api/v1/auth/phone/otp/verify')
        .send({ phone, otp: '000000' })
        .expect(400);
    });
  });
});
