import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const SALT_ROUNDS = 10;
  const createdBy = 'system';
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({
      where: {
        NOT: { role: 'ADMIN' },
      },
    });
  });

  const existingUsers = await prisma.user.findMany({
    select: { username: true },
  });
  const existingUsernames = new Set(existingUsers.map((u) => u.username));

  for (let i = 0; i < 100; i++) {
    const username = faker.internet.username().toLowerCase() + i;
    if (existingUsernames.has(username)) continue;

    const email = faker.internet.email().toLowerCase();
    const password = await bcrypt.hash('password123', SALT_ROUNDS);
    const salary = faker.number.int({ min: 3_000_000, max: 10_000_000 }); // gaji antara 3jt - 10jt

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        role: 'EMPLOYEE',
        salary,
        createdBy,
        createdAt: now,
        updatedAt: now,
        updatedBy: createdBy,
      },
    });

    await prisma.auditLog.create({
      data: {
        entity: 'User',
        entityId: user.id,
        action: 'CREATE',
        performedBy: createdBy,
        ipAddress: '127.0.0.1',
        requestId: 'seed-script',
        oldData: '',
        newData: {
          username: user.username,
          email: user.email,
          role: user.role,
          salary: user.salary,
        },
      },
    });
  }

  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!adminUser) {
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN',
        createdBy,
        createdAt: now,
        updatedAt: now,
        updatedBy: createdBy,
      },
    });

    await prisma.auditLog.create({
      data: {
        entity: 'User',
        entityId: admin.id,
        action: 'CREATE',
        performedBy: createdBy,
        ipAddress: '127.0.0.1',
        requestId: 'seed-script',
        oldData: '',
        newData: {
          username: admin.username,
          email: admin.email,
          role: admin.role,
          salary: admin.salary,
        },
      },
    });
  }

  console.log('✅ Seeder selesai: 100 employees dan 1 admin (jika belum ada) dibuat atau sudah ada.');
}

main()
  .catch((err) => {
    console.error('Seeder error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
