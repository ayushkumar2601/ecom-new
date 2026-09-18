import { prisma } from '../../config/prisma';

export class VendorRepository {
  async getPerformance(vendorId: number) {
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

    const revenueQuery = await prisma.$queryRaw<{revenue: number}[]>`
      SELECT SUM("quantity" * "priceAtOrder") as revenue
      FROM "OrderItem"
      WHERE "vendorId" = ${vendorId} AND "status" != 'REJECTED'
    `;

    const approvalRate = items > 0 ? (approvedItems / items) * 100 : 0;

    return {
      revenue: revenueQuery[0]?.revenue || 0,
      totalOrders: items,
      approvalRate,
      topProducts
    };
  }
}
