import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { redis } from '../../src/config/redis';

describe('Health & Metrics API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });

  it('GET /api/v1/health should return health status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBeUndefined(); // we didn't wrap this in ApiResponse
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/metrics should return metrics data', async () => {
    const res = await request(app).get('/api/v1/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memoryUsage');
    expect(res.body).toHaveProperty('cpuUsage');
    expect(res.body).toHaveProperty('requestCount');
  });
});
