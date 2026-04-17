const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const getAll = async () => {
  return prisma.user.findMany({ select: safeSelect, orderBy: { createdAt: 'desc' } });
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: safeSelect });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const update = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return prisma.user.update({
    where: { id },
    data,
    select: safeSelect,
  });
};

const remove = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  await prisma.user.delete({ where: { id } });
};

module.exports = { getAll, getById, update, remove };
