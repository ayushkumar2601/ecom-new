import { Request, Response, NextFunction } from 'express';

interface Metrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  endpointFrequency: Record<string, number>;
}

export const appMetrics: Metrics = {
  requestCount: 0,
  errorCount: 0,
  totalResponseTime: 0,
  endpointFrequency: {}
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    appMetrics.requestCount++;
    
    // Endpoint frequency
    const route = req.route ? req.route.path : req.path;
    appMetrics.endpointFrequency[route] = (appMetrics.endpointFrequency[route] || 0) + 1;
    
    // Error count
    if (res.statusCode >= 400) {
      appMetrics.errorCount++;
    }

    // Response time
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e9 + diff[1]) / 1e6;
    appMetrics.totalResponseTime += timeInMs;
  });

  next();
};
