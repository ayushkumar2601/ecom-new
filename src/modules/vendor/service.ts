import { VendorRepository } from './repository';
import { logger } from '../../utils/logger';
import { redis } from '../../config/redis';

export class VendorService {
  private vendorRepository: VendorRepository;

  constructor() {
    this.vendorRepository = new VendorRepository();
  }

  async getPerformance(vendorId: number) {
    const cacheKey = `vendor:${vendorId}:analytics`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info(`CACHE_HIT: Vendor ${vendorId} performance analytics`);
      return JSON.parse(cached);
    }
    logger.info(`CACHE_MISS: Vendor ${vendorId} performance analytics`);
    const data = await this.vendorRepository.getPerformance(vendorId);
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
    return data;
  }
}
