import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('Creating test admin user...');

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@nextbuy.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@nextbuy.com');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        id: '60de91e8-035b-424a-abd5-68af393218ac', // Fixed ID from logs
        name: 'Admin User',
        email: 'admin@nextbuy.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@nextbuy.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
    console.log('User ID:', adminUser.id);

    // Create a regular test user too
    const regularUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'user@nextbuy.com',
        password: hashedPassword, // same password
        role: 'USER',
      },
    });

    console.log('✅ Regular user created successfully!');
    console.log('Email: user@nextbuy.com');
    console.log('Password: admin123');
    console.log('Role: USER');
    console.log('User ID:', regularUser.id);
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
