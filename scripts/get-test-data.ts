import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function getTestData() {
  console.log('🔍 Fetching test data for stock management...\n');

  try {
    // 1. Get available product variants with stock info
    console.log('1️⃣ Available Product Variants:');
    const variants = await prisma.productVariant.findMany({
      take: 10, // Limit to first 10
      include: {
        product: {
          select: { name: true },
        },
        size: {
          select: { name: true },
        },
        color: {
          select: { name: true },
        },
      },
      orderBy: { stock: 'desc' }, // Show highest stock first
    });

    if (variants.length === 0) {
      console.log('   ❌ No variants found. Run seed script first:');
      console.log('   npx prisma db seed\n');
      return;
    }

    variants.forEach((variant, index) => {
      console.log(`   ${index + 1}. ID: ${variant.id}`);
      console.log(`      Product: ${variant.product.name}`);
      console.log(`      
        Size: ${variant.size.name}, Color: ${variant.color.name}`);
      console.log(`      SKU: ${variant.sku}`);
      console.log(`      Stock: ${variant.stock} units`);
      console.log(`      Price: €${variant.price || 'N/A'}\n`);
    });

    // 2. Get or create a test user
    console.log('2️⃣ Test User Information:');
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      console.log('   Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
          role: 'USER',
        },
      });
      console.log('   ✅ Test user created');
    }

    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}\n`);

    // 3. Generate JWT Token (manual process instructions)
    console.log('3️⃣ JWT Token Generation:');
    console.log('   To get a JWT token, you have two options:\n');
    console.log('   Option A - Use the API:');
    console.log('   ```bash');
    console.log('   curl -X POST http://localhost:4001/auth/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log(
      '     -d \'{"email": "test@example.com", "password": "password123"}\'',
    );
    console.log('   ```\n');

    console.log('   Option B - Use the Frontend:');
    console.log('   1. Go to http://localhost:3000/auth/login');
    console.log('   2. Login with: test@example.com / password123');
    console.log('   3. Open Developer Tools → Application → Local Storage');
    console.log('   4. Copy the token value\n');

    // 4. Generate test configuration
    console.log('4️⃣ Test Configuration:');
    const recommendedVariant = variants.find((v) => v.stock > 5) || variants[0];

    console.log('   Copy this configuration to test-stock-management.js:');
    console.log('   ```javascript');
    console.log('   const TEST_CONFIG = {');
    console.log(`     variantId: '${recommendedVariant.id}',`);
    console.log("     userToken: 'PASTE_YOUR_JWT_TOKEN_HERE',");
    console.log('     testQuantity: 2');
    console.log('   };');
    console.log('   ```\n');

    console.log('5️⃣ Recommended Variant for Testing:');
    console.log(`   Product: ${recommendedVariant.product.name}`);
    console.log(`   Variant ID: ${recommendedVariant.id}`);
    console.log(`   Stock: ${recommendedVariant.stock} units`);
    console.log(`   Reason: Has sufficient stock for testing\n`);
  } catch (error) {
    console.error('❌ Error fetching test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to create more test variants if needed
async function createMoreVariants() {
  console.log('🔧 Creating additional test variants...\n');

  try {
    const products = await prisma.product.findMany({ take: 3 });
    const sizes = await prisma.size.findMany();
    const colors = await prisma.color.findMany();

    if (products.length === 0 || sizes.length === 0 || colors.length === 0) {
      console.log(
        '   ❌ Need products, sizes, and colors. Run seed script first.',
      );
      return;
    }

    const newVariants = [];

    for (const product of products) {
      for (let i = 0; i < 2; i++) {
        // 2 variants per product
        const size = sizes[i % sizes.length];
        const color = colors[i % colors.length];
        const variantData = {
          sku: `${product.name.replace(/\s+/g, '').toUpperCase()}-${size.name}-${color.name}-TEST`,
          productId: product.id,
          sizeId: size.id,
          colorId: color.id,
          stock: Math.floor(Math.random() * 50) + 10, // 10-60 stock
          price: product.price,
        };

        try {
          const variant = await prisma.productVariant.create({
            data: variantData,
          });
          newVariants.push(variant);
          console.log(`
               ✅ Created variant: ${variant.sku} (Stock: ${variant.stock})`);
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(
              `   ⚠️  Variant ${variantData.sku} already exists, skipping...`,
            );
          }
        }
      }
    }

    console.log(`\n🎉 Created ${newVariants.length} new test variants!`);
  } catch (error) {
    console.error('❌ Error creating variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  const command = process.argv[2];
  if (command === 'create-variants') {
    createMoreVariants();
  } else {
    getTestData();
  }
}

export { getTestData, createMoreVariants };
