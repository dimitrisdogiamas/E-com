import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');

    const hashedPassword = await bcryptjs.hash('testuser123', 10);

    const user = await prisma.user.upsert({
      where: { email: 'test@nextbuy.com' },
      update: {},
      create: {
        email: 'test@nextbuy.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
      },
    });

    console.log('Test user created:', user.email);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
