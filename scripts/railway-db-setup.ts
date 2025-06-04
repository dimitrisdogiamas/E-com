import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupRailwayDatabase() {
  console.log('🚂 Setting up Railway database...');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if data exists
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();

    console.log(`Current data: ${userCount} users, ${productCount} products`);

    if (productCount === 0) {
      console.log('🌱 Seeding database with initial data...');
      // Create admin user
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@nextbuy.com' },
        update: {},
        create: {
          email: 'admin@nextbuy.com',
          name: 'Admin User',
          role: 'ADMIN',
          password: '$2b$10$YmZ6Z2Q2ZjJhZGE3YWQ3Y.XJ9qM9M8K7L3P4Q5R6S7T8U9V0W1X2Y3', // admin123
        },
      });

      // Create sample products
      const products = [
        {
          name: 'Classic White T-Shirt',
          description: 'Premium cotton white t-shirt',
          price: 25.99,
          stock: 100,
          category: 'Clothing',
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        },
        {
          name: 'Blue Denim Jeans',
          description: 'Comfortable blue denim jeans',
          price: 79.99,
          stock: 50,
          category: 'Clothing',
          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        },
        {
          name: 'Wireless Headphones',
          description: 'High-quality wireless headphones',
          price: 159.99,
          stock: 30,
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        },
      ];

      for (const product of products) {
        await prisma.product.create({ data: product });
      }

      console.log('✅ Database seeded successfully');
    }

    console.log('🎉 Railway database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRailwayDatabase(); 