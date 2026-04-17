const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getAll = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
};

const getById = async (id) => {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!cat) throw new AppError('Category not found', 404);
  return cat;
};

const create = async (data) => {
  return prisma.category.create({ data });
};

const update = async (id, data) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError('Category not found', 404);
  return prisma.category.update({ where: { id }, data });
};

const remove = async (id) => {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!cat) throw new AppError('Category not found', 404);
  if (cat._count.products > 0) {
    throw new AppError('Cannot delete category with existing products', 400);
  }
  await prisma.category.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
