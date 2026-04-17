const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@warehouse.com' },
  });

  if (existingAdmin) {
    console.log('Seed data already exists. Skipping.');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@warehouse.com',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.create({
    data: {
      name: 'Staff User',
      email: 'staff@warehouse.com',
      password: staffPassword,
      role: 'staff',
    },
  });
  console.log('Staff user created:', staff.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics', description: 'Electronic devices and accessories' } }),
    prisma.category.create({ data: { name: 'Office Supplies', description: 'Stationery and office equipment' } }),
    prisma.category.create({ data: { name: 'Furniture', description: 'Office and warehouse furniture' } }),
    prisma.category.create({ data: { name: 'Tools', description: 'Hand and power tools' } }),
  ]);
  console.log('Categories created:', categories.length);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop Pro 15',
        sku: 'ELEC-001',
        description: 'High performance laptop',
        categoryId: categories[0].id,
        quantity: 25,
        unitPrice: 1299.99,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        sku: 'ELEC-002',
        description: 'Ergonomic wireless mouse',
        categoryId: categories[0].id,
        quantity: 5,
        unitPrice: 29.99,
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub',
        sku: 'ELEC-003',
        description: '7-in-1 USB-C hub',
        categoryId: categories[0].id,
        quantity: 3,
        unitPrice: 49.99,
      },
    }),
    prisma.product.create({
      data: {
        name: 'A4 Paper Ream',
        sku: 'OFFI-001',
        description: '500 sheets per ream',
        categoryId: categories[1].id,
        quantity: 200,
        unitPrice: 5.99,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ballpoint Pens Box',
        sku: 'OFFI-002',
        description: 'Box of 50 pens',
        categoryId: categories[1].id,
        quantity: 0,
        unitPrice: 8.99,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Office Chair',
        sku: 'FURN-001',
        description: 'Ergonomic adjustable chair',
        categoryId: categories[2].id,
        quantity: 10,
        unitPrice: 249.99,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Standing Desk',
        sku: 'FURN-002',
        description: 'Height adjustable standing desk',
        categoryId: categories[2].id,
        quantity: 4,
        unitPrice: 499.99,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Power Drill',
        sku: 'TOOL-001',
        description: '18V cordless drill',
        categoryId: categories[3].id,
        quantity: 8,
        unitPrice: 79.99,
      },
    }),
  ]);
  console.log('Products created:', products.length);

  // Create some transactions
  await Promise.all([
    prisma.inventoryTransaction.create({
      data: {
        productId: products[0].id,
        transactionType: 'IN',
        quantity: 25,
        note: 'Initial stock',
        createdBy: admin.id,
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        productId: products[1].id,
        transactionType: 'IN',
        quantity: 10,
        note: 'Initial stock',
        createdBy: admin.id,
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        productId: products[1].id,
        transactionType: 'OUT',
        quantity: 5,
        note: 'Sold to customer',
        createdBy: staff.id,
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        productId: products[3].id,
        transactionType: 'IN',
        quantity: 200,
        note: 'Bulk purchase',
        createdBy: admin.id,
      },
    }),
  ]);
  console.log('Transactions created');

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Default credentials:');
  console.log('  Admin: admin@warehouse.com / admin123');
  console.log('  Staff: staff@warehouse.com / staff123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
