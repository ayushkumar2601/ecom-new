import { prisma } from '../../config/prisma';
import { OrderQueryFilters } from './types';

import { redis } from '../../config/redis';

export class OrderRepository {
  async createOrderFromCart(customerId: number) {
    // 1. Load customer cart from Redis (outside tx, as Redis doesn't participate in Prisma tx)
    const cartData = await redis.get(`cart:${customerId}`);
    const cart = cartData ? JSON.parse(cartData) : null;

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty'); // Handled by service
    }

    // We use an interactive transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // Fetch products to validate
      const productIds = cart.items.map((i: any) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } }
      });
      const productMap = new Map(products.map(p => [p.id, p]));

      // 3. Validate stock & calculate total
      for (const item of cart.items) {
        const product = productMap.get(item.productId);
        if (!product || !product.isActive || product.stock < item.quantity) {
          throw new Error(`Product ${product?.name || item.productId} is out of stock or inactive`);
        }
        totalAmount += item.quantity * product.price;
      }

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          customerId,
          totalAmount,
          orderStatus: 'PENDING',
        },
      });

      // 5. Create Order Items and 7. Decrease Stock
      for (const item of cart.items) {
        const product = productMap.get(item.productId)!;
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            vendorId: product.vendorId,
            quantity: item.quantity,
            priceAtOrder: product.price,
            status: 'PENDING',
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 8. Empty Cart in Redis
      await redis.del(`cart:${customerId}`);

      return order;
    });
  }

  async findById(id: number, customerId: number) {
    return prisma.order.findFirst({
      where: { id, customerId },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });
  }

  async list(customerId: number, filters: OrderQueryFilters) {
    let { page = 1, limit = 10, status, from, to, sortBy, order } = filters;
    limit = Math.min(Number(limit) || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = { customerId };
    
    if (status) {
      where.orderStatus = status;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orderBy: any = {};
    const validSortFields = ['createdAt', 'totalAmount', 'orderStatus'];
    if (sortBy && validSortFields.includes(sortBy)) {
      orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async getIncomingVendorOrders(vendorId: number) {
    return prisma.orderItem.findMany({
      where: { vendorId },
      include: {
        order: { select: { id: true, orderStatus: true, createdAt: true, customer: { select: { name: true, email: true } } } },
        product: { select: { name: true, price: true } }
      },
      orderBy: { order: { createdAt: 'desc' } }
    });
  }

  async setOrderItemStatus(orderId: number, productId: number, vendorId: number, status: 'APPROVED' | 'REJECTED') {
    return prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findFirst({
        where: { orderId, productId, vendorId }
      });

      if (!item) {
        throw new Error('Order item not found or unauthorized');
      }

      await tx.orderItem.update({
        where: { id: item.id },
        data: { status }
      });

      // Recalculate order status
      const allItems = await tx.orderItem.findMany({
        where: { orderId }
      });

      const allPending = allItems.every(i => i.status === 'PENDING');
      const allApproved = allItems.every(i => i.status === 'APPROVED');
      const allRejected = allItems.every(i => i.status === 'REJECTED');

      let newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED' = 'PARTIALLY_APPROVED';
      if (allPending) newStatus = 'PENDING';
      else if (allApproved) newStatus = 'APPROVED';
      else if (allRejected) newStatus = 'REJECTED';

      await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: newStatus }
      });

      return { itemStatus: status, orderStatus: newStatus };
    });
  }
}
