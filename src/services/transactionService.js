const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getAll = async ({ productId, type, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (productId) where.productId = parseInt(productId);
  if (type) where.transactionType = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [transactions, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  return { transactions, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const tx = await prisma.inventoryTransaction.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      user: { select: { id: true, name: true } },
    },
  });
  if (!tx) throw new AppError('Transaction not found', 404);
  return tx;
};

const create = async ({ productId, transactionType, quantity, note, createdBy }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  // Calculate new quantity
  let newQuantity = product.quantity;
  if (transactionType === 'IN') {
    newQuantity += quantity;
  } else if (transactionType === 'OUT') {
    if (product.quantity < quantity) {
      throw new AppError(`Insufficient stock. Available: ${product.quantity}`, 400);
    }
    newQuantity -= quantity;
  } else if (transactionType === 'ADJUST') {
    newQuantity = quantity; // absolute value for adjustments
  }

  // Run in transaction
  const [transaction] = await prisma.$transaction([
    prisma.inventoryTransaction.create({
      data: { productId, transactionType, quantity, note, createdBy },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    }),
  ]);

  return transaction;
};

module.exports = { getAll, getById, create };
