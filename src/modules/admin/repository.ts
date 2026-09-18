import { prisma } from '../../config/prisma';

export class AdminRepository {
  async listUsers(filters: { page?: number; limit?: number; role?: string; isBlocked?: string; search?: string }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.isBlocked !== undefined) where.isBlocked = filters.isBlocked === 'true';
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBlocked: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total };
  }

  async setBlockStatus(id: number, isBlocked: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: { id: true, isBlocked: true }
    });
  }

  async getOverviewAnalytics() {
    const [salesResult, orderCount, userCount, productCount] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderStatus: { not: 'REJECTED' } }
      }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count()
    ]);

    return {
      totalSales: salesResult._sum.totalAmount || 0,
      totalOrders: orderCount,
      totalUsers: userCount,
      totalProducts: productCount
    };
  }

  async getVendorAnalytics(vendorId: number) {
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { name: true }
    });

    if (!vendor) return null;

    const [salesResult, items, approvedItems] = await Promise.all([
      prisma.orderItem.aggregate({
        _sum: {
          priceAtOrder: true,
        },
        where: { vendorId, status: { not: 'REJECTED' } }
      }),
      prisma.orderItem.count({ where: { vendorId } }),
      prisma.orderItem.count({ where: { vendorId, status: 'APPROVED' } })
    ]);

    // To get top products natively, we group by productId
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { vendorId, status: { not: 'REJECTED' } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProductIds = topProductsRaw.map(p => p.productId);
    const productsInfo = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true }
    });

    const topProducts = topProductsRaw.map(p => {
      const info = productsInfo.find(info => info.id === p.productId);
      return {
        productId: p.productId,
        name: info?.name || 'Unknown',
        totalSold: p._sum.quantity || 0
      };
    });

    // Approximation of total revenue from items (we don't have item level total in schema, so priceAtOrder * quantity isn't supported directly by aggregate _sum in prisma easily without raw, wait we DO have priceAtOrder. Revenue is sum(priceAtOrder * quantity). Let's use raw query for revenue to be exact).
    const revenueQuery = await prisma.$queryRaw<{revenue: number}[]>`
      SELECT SUM("quantity" * "priceAtOrder") as revenue
      FROM "OrderItem"
      WHERE "vendorId" = ${vendorId} AND "status" != 'REJECTED'
    `;

    const approvalRate = items > 0 ? (approvedItems / items) * 100 : 0;

    return {
      vendorId,
      vendorName: vendor.name,
      totalRevenue: revenueQuery[0]?.revenue || 0,
      totalOrders: items, // Approximating items count as 'orders involved' since we group by item. Or we can count distinct orderId.
      approvalRate,
      topProducts
    };
  }

  async getRepeatCustomers(threshold: number) {
    const repeatCustomersRaw = await prisma.order.groupBy({
      by: ['customerId'],
      _count: { id: true },
      having: {
        id: {
          _count: {
            gte: threshold
          }
        }
      }
    });

    const customerIds = repeatCustomersRaw.map(c => c.customerId);
    const customersInfo = await prisma.user.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true, email: true }
    });

    return repeatCustomersRaw.map(c => {
      const info = customersInfo.find(i => i.id === c.customerId);
      return {
        customerId: c.customerId,
        name: info?.name,
        email: info?.email,
        orderCount: c._count.id
      };
    });
  }
}
