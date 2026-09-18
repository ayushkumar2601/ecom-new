import { AdminRepository } from './repository';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';
import { redis } from '../../config/redis';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async listUsers(filters: any) {
    return this.adminRepository.listUsers(filters);
  }

  async blockUser(id: number) {
    logger.info(`Admin blocked user ${id}`);
    return this.adminRepository.setBlockStatus(id, true);
  }

  async unblockUser(id: number) {
    logger.info(`Admin unblocked user ${id}`);
    return this.adminRepository.setBlockStatus(id, false);
  }

  async getOverviewAnalytics() {
    const cacheKey = 'admin:analytics:overview';
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info('CACHE_HIT: Admin overview analytics');
      return JSON.parse(cached);
    }
    logger.info('CACHE_MISS: Admin overview analytics');
    const data = await this.adminRepository.getOverviewAnalytics();
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
    return data;
  }

  async getVendorAnalytics(vendorId: number) {
    logger.info(`Admin fetched analytics for vendor ${vendorId}`);
    const data = await this.adminRepository.getVendorAnalytics(vendorId);
    if (!data) throw new ApiError(404, 'Vendor not found');
    return data;
  }

  async getRepeatCustomers(threshold: number) {
    logger.info(`Admin fetched repeat customers with threshold ${threshold}`);
    return this.adminRepository.getRepeatCustomers(threshold);
  }
}
