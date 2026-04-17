const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const fs = require('fs');
const path = require('path');

const getAll = async ({ search, categoryId, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (categoryId) where.categoryId = parseInt(categoryId);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const create = async (data) => {
  return prisma.product.create({
    data,
    include: { category: { select: { id: true, name: true } } },
  });
};

const update = async (id, data) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);

  // Remove old image if new one is provided
  if (data.imagePath && product.imagePath && data.imagePath !== product.imagePath) {
    const oldPath = path.join(__dirname, '../../uploads', path.basename(product.imagePath));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  return prisma.product.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true } } },
  });
};

const remove = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);

  // Remove image if exists
  if (product.imagePath) {
    const imgPath = path.join(__dirname, '../../uploads', path.basename(product.imagePath));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  await prisma.inventoryTransaction.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
