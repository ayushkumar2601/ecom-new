import { Request, Response } from 'express';
import { HealthService } from './service';

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  getHealth = async (req: Request, res: Response) => {
    const health = await this.healthService.getHealth();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  };

  getMetrics = (req: Request, res: Response) => {
    const metrics = this.healthService.getMetrics();
    res.status(200).json(metrics);
  };
}
