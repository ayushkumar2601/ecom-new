import { ProductRepository } from './repository';
import { CreateProductDTO, UpdateProductDTO, ProductQueryFilters } from './types';
import { ApiError } from '../../utils/ApiError';
import { UserRepository } from '../user/repository';
import { redis } from '../../config/redis';
import { logger } from '../../utils/logger';

export class ProductService {
  private productRepository: ProductRepository;
  private userRepository: UserRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
  }

  async createProduct(data: CreateProductDTO) {
    const vendor = await this.userRepository.findById(data.vendorId);
    if (!vendor) {
      throw new ApiError(404, 'Vendor not found');
    }
    if (vendor.role !== 'VENDOR') {
      throw new ApiError(403, 'User is not a vendor');
    }

    return this.productRepository.create(data);
  }

  async updateProduct(id: number, data: UpdateProductDTO) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const updated = await this.productRepository.update(id, data);
    await redis.del(`product:${id}`);
    return updated;
  }

  async deleteProduct(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const deleted = await this.productRepository.softDelete(id);
    await redis.del(`product:${id}`);
    return deleted;
  }

  async getProduct(id: number) {
    const cacheKey = `product:${id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      logger.info(`Cache hit for product ${id}`);
      return JSON.parse(cached);
    }

    logger.info(`Cache miss for product ${id}`);
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // TTL 30 minutes (1800 seconds)
    await redis.set(cacheKey, JSON.stringify(product), 'EX', 1800);
    return product;
  }

  async listProducts(filters: ProductQueryFilters) {
    return this.productRepository.list(filters);
  }
}
