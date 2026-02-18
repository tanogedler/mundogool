/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Sub-6', minAge: 4, maxAge: 6 } }),
    prisma.category.create({ data: { name: 'Sub-8', minAge: 6, maxAge: 8 } }),
    prisma.category.create({ data: { name: 'Sub-10', minAge: 8, maxAge: 10 } }),
    prisma.category.create({ data: { name: 'Sub-12', minAge: 10, maxAge: 12 } }),
    prisma.category.create({ data: { name: 'Sub-14', minAge: 12, maxAge: 14 } }),
    prisma.category.create({ data: { name: 'Sub-16', minAge: 14, maxAge: 16 } }),
    prisma.category.create({ data: { name: 'Sub-18', minAge: 16, maxAge: 18 } }),
  ]);

  // Create expense categories
  await Promise.all([
    prisma.expenseCategory.create({ data: { name: 'Equipment' } }),
    prisma.expenseCategory.create({ data: { name: 'Facilities' } }),
    prisma.expenseCategory.create({ data: { name: 'Transport' } }),
    prisma.expenseCategory.create({ data: { name: 'Administrative' } }),
    prisma.expenseCategory.create({ data: { name: 'Other' } }),
  ]);

  // Create default admin user
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@academy.com',
      role: 'admin',
      passwordHash: 'change_this_later',
    },
  });

  // Create settings
  await prisma.settings.create({
    data: {
      id: 'default',
      monthlyFeeUsd: 50,
      defaultCurrency: 'LOCAL',
      localCurrencyCode: 'VES',
    },
  });

  console.log('✅ Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });