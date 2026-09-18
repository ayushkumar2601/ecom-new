import { prisma } from '../../config/prisma';
import { CreateProductDTO, UpdateProductDTO, ProductQueryFilters } from './types';
import { Prisma } from '@prisma/client';

export class ProductRepository {
  async create(data: CreateProductDTO) {
    return prisma.product.create({
      data,
    });
  }

  async findById(id: number) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateProductDTO) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: number) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async list(filters: ProductQueryFilters) {
    let { page = 1, limit = 20, search, category, vendorId, minPrice, maxPrice, sortBy, order, isActive } = filters;
    limit = Math.min(Number(limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true; // default
    }

    if (category) where.category = category;
    if (vendorId) where.vendorId = vendorId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    const validSortFields = ['price', 'createdAt', 'name'];
    if (sortBy && validSortFields.includes(sortBy)) {
      orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }
}
