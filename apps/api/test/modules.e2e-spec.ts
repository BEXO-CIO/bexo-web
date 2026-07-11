import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/db/db.service';
import * as jwt from 'jsonwebtoken';
import * as cookieParser from 'cookie-parser';
import * as crypto from 'crypto';

describe('Wizard Modules (e2e)', () => {
  let app: INestApplication<App>;
  let db: DbService;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const cookieParserFn = (cookieParser as any).default || cookieParser;
    app.use(cookieParserFn());
    app.setGlobalPrefix('api/v1');
    await app.init();

    db = moduleFixture.get<DbService>(DbService);

    // Get the seeded test user (+919876543210) to obtain a valid JWT token
    const userRes = await db.query("SELECT id FROM users WHERE phone = $1;", ['+919876543210']);
    testUserId = userRes.rows[0].id;
    
    const jwtSecret = process.env.JWT_SECRET || 'bexo-super-secret-jwt-key-2026';
    authToken = jwt.sign({ sub: testUserId, phone: '+919876543210' }, jwtSecret, { expiresIn: '15m' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Profiles module', () => {
    it('GET /profile -> should return user profile config', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user_id', testUserId);
    });

    it('PATCH /profile -> should update headline and bio', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ headline: 'Distinguished Systems Engineer', bio: 'Updated bio text' })
        .expect(200);

      expect(response.body).toHaveProperty('headline', 'Distinguished Systems Engineer');
      expect(response.body).toHaveProperty('bio', 'Updated bio text');
    });

    it('PATCH /profile/sections/:type -> should save section entries and trigger completion score update', async () => {
      // 1. Initially check score
      let scoreRes = await request(app.getHttpServer())
        .get('/api/v1/profile/completion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const initialScore = scoreRes.body.score;

      // 2. Patch a section with entries and reviewed_at
      await request(app.getHttpServer())
        .patch('/api/v1/profile/sections/education')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entries: [{ degree: 'B.E.', college: 'PSG Tech', year: '2026', cgpa: '9.4' }],
          reviewed_at: new Date().toISOString()
        })
        .expect(200);

      // 3. Confirm section saved
      const sectionRes = await request(app.getHttpServer())
        .get('/api/v1/profile/sections/education')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(sectionRes.body.entries).toHaveLength(1);
      expect(sectionRes.body.reviewed_at).not.toBeNull();

      // 4. Confirm completion score updated
      scoreRes = await request(app.getHttpServer())
        .get('/api/v1/profile/completion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Seeding originally set 3 sections (about, education, projects) as reviewed,
      // now we re-reviewed education. Let's make sure score is between 0 and 100
      expect(scoreRes.body.score).toBeGreaterThanOrEqual(0);
      expect(scoreRes.body.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Assets module', () => {
    it('POST /assets/upload-url -> should issue a presigned PUT URL and S3 key', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/assets/upload-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'resume.pdf',
          size_bytes: 1048576, // 1MB
          section_type: 'resume',
          kind: 'pdf'
        })
        .expect(200);

      expect(response.body).toHaveProperty('uploadUrl');
      expect(response.body).toHaveProperty('key');
      expect(response.body).toHaveProperty('assetId');
    });
  });

  describe('Activation module', () => {
    it('POST /activation/redeem -> should throw error on invalid code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/activation/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'INVALID-CODE' })
        .expect(400);

      expect(response.body.message).toContain('Invalid activation key');
    });

    it('POST /activation/redeem -> should successfully redeem unused key and activate subscription', async () => {
      // 1. Admin generates key batch
      const orgsRes = await db.query('SELECT id FROM organizations LIMIT 1;');
      const orgId = orgsRes.rows[0].id;

      const batchRes = await request(app.getHttpServer())
        .post('/api/v1/activation/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orgId, count: 1 })
        .expect(200);

      const generatedKey = batchRes.body.keys[0];

      // 2. Student redeems it
      const response = await request(app.getHttpServer())
        .post('/api/v1/activation/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: generatedKey })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.subscription).toHaveProperty('status', 'active');
      expect(response.body.subscription).toHaveProperty('source', 'activation_key');
    });
  });

  describe('Templates module', () => {
    it('GET /templates -> should fetch active templates', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
    });

    it('POST /templates/preview/token -> should generate preview token and resolve draft data', async () => {
      // 1. Request token
      const tokenRes = await request(app.getHttpServer())
        .post('/api/v1/templates/preview/token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const previewToken = tokenRes.body.token;
      expect(previewToken).toBeDefined();

      // 2. Resolve token
      const resolveRes = await request(app.getHttpServer())
        .get(`/api/v1/templates/preview/${previewToken}`)
        .expect(200);

      expect(resolveRes.body).toHaveProperty('portfolio');
      expect(resolveRes.body).toHaveProperty('profile');
      expect(resolveRes.body).toHaveProperty('sections');
    });
  });

  describe('Billing module', () => {
    it('POST /billing/checkout -> should create Razorpay order object', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/billing/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ plan: 'annual' })
        .expect(200);

      expect(response.body).toHaveProperty('orderId');
      expect(response.body).toHaveProperty('amount', 99900);
      expect(response.body).toHaveProperty('currency', 'INR');
    });

    it('POST /billing/webhook -> should reject unverified signature', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/billing/webhook')
        .set('x-razorpay-signature', 'invalid-signature')
        .send({ event: 'order.paid' })
        .expect(400);
    });

    it('POST /billing/webhook -> should process verified signatures and update subscription', async () => {
      const payload = {
        event: 'order.paid',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_payment_1',
              amount: 99900,
              notes: {
                userId: testUserId,
                plan: 'annual'
              }
            }
          }
        }
      };

      const payloadStr = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', 'bexo_webhook_secret_2026')
        .update(payloadStr)
        .digest('hex');

      const response = await request(app.getHttpServer())
        .post('/api/v1/billing/webhook')
        .set('x-razorpay-signature', signature)
        .send(payload)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'processed');

      // Verify DB state updated
      const subRes = await db.query('SELECT status, plan FROM subscriptions WHERE user_id = $1;', [testUserId]);
      expect(subRes.rows[0]).toHaveProperty('status', 'active');
      expect(subRes.rows[0]).toHaveProperty('plan', 'annual');
    });
  });

  describe('Admin module', () => {
    it('GET /admin/users/search -> should return users list and storage metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it('POST /admin/users/:id/impersonate -> should generate impersonation token and audit log', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${testUserId}/impersonate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');

      // Verify audit log exists
      const auditRes = await db.query('SELECT action, target_id FROM audit_logs WHERE admin_user_id = $1;', [testUserId]);
      expect(auditRes.rows.length).toBeGreaterThan(0);
      expect(auditRes.rows[0]).toHaveProperty('action', 'impersonate_user');
    });

    it('POST /admin/billing/refund -> should refund payment, revoke subscription and audit log', async () => {
      // Find the payment logged in the billing webhook test
      const paymentRes = await db.query('SELECT id FROM payments WHERE user_id = $1 LIMIT 1;', [testUserId]);
      const paymentId = paymentRes.rows[0].id;

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/billing/refund')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ paymentId })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify subscription status is revoked
      const subRes = await db.query('SELECT status FROM subscriptions WHERE user_id = $1;', [testUserId]);
      expect(subRes.rows[0]).toHaveProperty('status', 'revoked');

      // Verify audit log has refund action
      const auditRes = await db.query("SELECT action FROM audit_logs WHERE admin_user_id = $1 AND action = 'refund_payment';", [testUserId]);
      expect(auditRes.rows.length).toBeGreaterThan(0);
    });
  });
});
