const prisma = require('../config/database');

const getStats = async (req, res, next) => {
  try {
    const LOW_STOCK_THRESHOLD = 10;

    const [
      totalProducts,
      totalCategories,
      lowStockItems,
      totalInventoryValue,
      recentTransactions,
      transactionSummary,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { quantity: { lte: LOW_STOCK_THRESHOLD } } }),
      prisma.product.aggregate({ _sum: { quantity: true } }),
      prisma.inventoryTransaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.inventoryTransaction.groupBy({
        by: ['transactionType'],
        _count: { id: true },
      }),
    ]);

    const lowStockProducts = await prisma.product.findMany({
      where: { quantity: { lte: LOW_STOCK_THRESHOLD } },
      include: { category: { select: { name: true } } },
      orderBy: { quantity: 'asc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        lowStockCount: lowStockItems,
        totalQuantity: totalInventoryValue._sum.quantity || 0,
        recentTransactions,
        lowStockProducts,
        transactionSummary,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
