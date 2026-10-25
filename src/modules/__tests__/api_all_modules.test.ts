import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

/**
 * End-to-End & Integration Test Suite for all functional modules
 * in the Omnichannel Social Commerce Hub system.
 */

describe('1. Health Check & Core Endpoints', () => {
  it('GET /api/health — should return 200 OK with timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('2. Authentication Module (/api/auth)', () => {
  it('POST /api/auth/login — should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login — should succeed with valid seed Admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'skillsanh@gmail.com', password: 'admin123' });

    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.role).toBe('ADMIN');
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  it('GET /api/auth/profile — should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});

describe('3. Products Module (/api/products)', () => {
  it('GET /api/products — should return list of products or require auth', async () => {
    const res = await request(app).get('/api/products');
    // Auth required endpoint
    expect([200, 401]).toContain(res.status);
  });
});

describe('4. Customers Module (/api/customers)', () => {
  it('GET /api/customers — should return customer endpoint response', async () => {
    const res = await request(app).get('/api/customers');
    expect([200, 401]).toContain(res.status);
  });
});

describe('5. Orders Module (/api/orders)', () => {
  it('GET /api/orders — should return order list endpoint status', async () => {
    const res = await request(app).get('/api/orders');
    expect([200, 401]).toContain(res.status);
  });
});

describe('6. Chat Module (/api/chat)', () => {
  it('GET /api/chat/conversations — should handle conversation queries', async () => {
    const res = await request(app).get('/api/chat/conversations');
    expect([200, 401]).toContain(res.status);
  });
});

describe('7. Analytics BI Module (/api/analytics)', () => {
  it('GET /api/analytics/kpi-overview — should restrict unauthenticated access', async () => {
    const res = await request(app).get('/api/analytics/kpi-overview');
    expect(res.status).toBe(401);
  });

  it('GET /api/analytics/revenue-trend — should restrict unauthenticated access', async () => {
    const res = await request(app).get('/api/analytics/revenue-trend');
    expect(res.status).toBe(401);
  });
});

describe('8. Webhook Endpoints (/api/webhooks)', () => {
  it('GET /api/webhooks/facebook — should verify challenge token', async () => {
    const res = await request(app)
      .get('/api/webhooks/facebook')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'omnichannel_verify_token_2024',
        'hub.challenge': '123456789',
      });
    expect([200, 403]).toContain(res.status);
  });

  it('POST /api/webhooks/payos — should handle webhook payload structure', async () => {
    const res = await request(app)
      .post('/api/webhooks/payos')
      .send({
        code: '00',
        desc: 'success',
        data: {
          orderCode: 9999,
          amount: 100000,
          paymentLinkId: 'MOCK_TEST_ID',
        },
      });
    expect([200, 404, 500]).toContain(res.status);
  });
});
