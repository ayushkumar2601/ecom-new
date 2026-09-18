import { prisma } from '../../config/prisma';
import { redis } from '../../config/redis';
import { appMetrics } from '../../middleware/metrics.middleware';
import os from 'os';

export class HealthService {
  async getHealth() {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e) {}

    try {
      if (redis.status === 'ready') {
        redisStatus = 'connected';
      }
    } catch (e) {}

    const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: dbStatus,
      redis: redisStatus,
      uptime: process.uptime()
    };
  }

  getMetrics() {
    const memoryUsage = process.memoryUsage();
    
    return {
      uptime: process.uptime(),
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      cpuUsage: process.cpuUsage(),
      system: {
        freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      },
      requestCount: appMetrics.requestCount,
      errorCount: appMetrics.errorCount,
      errorRate: appMetrics.requestCount > 0 ? (appMetrics.errorCount / appMetrics.requestCount).toFixed(4) : 0,
      avgResponseTimeMs: appMetrics.requestCount > 0 ? (appMetrics.totalResponseTime / appMetrics.requestCount).toFixed(2) : 0,
      endpointFrequency: appMetrics.endpointFrequency
    };
  }
}
