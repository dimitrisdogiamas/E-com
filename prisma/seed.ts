import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nextbuy.com' },
    update: {},
    create: {
      email: 'admin@nextbuy.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  // Create test user
  const testUserPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@user.com' },
    update: {},
    create: {
      email: 'test@user.com',
      name: 'Test User',
      role: 'USER',
      password: testUserPassword,
    },
  });

  // Clear existing products to avoid duplicates
  console.log('🧹 Clearing existing data...');
  await prisma.review.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.wishListItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  // Sample products with reliable image URLs
  const products = [
    // Electronics
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced camera system and A17 Pro chip',
      price: 999.99,
      category: 'Electronics',
    },
    {
      name: 'MacBook Air M3',
      description: 'Ultra-thin laptop with M3 chip and all-day battery life',
      price: 1299.99,
      category: 'Electronics',
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling headphones',
      price: 349.99,
      category: 'Electronics',
    },
    {
      name: 'Samsung Galaxy Watch 6',
      description: 'Advanced smartwatch with health monitoring',
      price: 279.99,
      category: 'Electronics',
    },
    
    // Clothing
    {
      name: 'Nike Air Max 270',
      description: 'Comfortable running shoes with Max Air cushioning',
      price: 149.99,
      category: 'Clothing',
    },
    {
      name: 'Levi\'s 501 Original Jeans',
      description: 'Classic straight-fit jeans, the original since 1873',
      price: 89.99,
      category: 'Clothing',
    },
    {
      name: 'Adidas Ultraboost 22',
      description: 'Premium running shoes with responsive cushioning',
      price: 189.99,
      category: 'Clothing',
    },
    {
      name: 'Patagonia Better Sweater',
      description: 'Cozy fleece jacket made from recycled polyester',
      price: 119.99,
      category: 'Clothing',
    },

    // Home & Garden
    {
      name: 'Dyson V15 Detect',
      description: 'Powerful cordless vacuum with laser dust detection',
      price: 749.99,
      category: 'Home & Garden',
    },
    {
      name: 'Instant Pot Duo 7-in-1',
      description: 'Multi-use pressure cooker, slow cooker, rice cooker, and more',
      price: 99.99,
      category: 'Home & Garden',
    },
    {
      name: 'Philips Hue Smart Bulbs',
      description: 'Color-changing smart LED bulbs with app control',
      price: 149.99,
      category: 'Home & Garden',
    },
    {
      name: 'KitchenAid Stand Mixer',
      description: 'Professional-grade stand mixer for baking enthusiasts',
      price: 379.99,
      category: 'Home & Garden',
    },

    // Books & Media
    {
      name: 'The Psychology of Money',
      description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel',
      price: 16.99,
      category: 'Books',
    },
    {
      name: 'Atomic Habits',
      description: 'An Easy & Proven Way to Build Good Habits by James Clear',
      price: 18.99,
      category: 'Books',
    },

    // Sports & Outdoors
    {
      name: 'YETI Rambler Tumbler',
      description: 'Double-wall vacuum insulated tumbler with MagSlider lid',
      price: 39.99,
      category: 'Sports & Outdoors',
    },
    {
      name: 'Hydro Flask Water Bottle',
      description: 'Insulated stainless steel water bottle, 32oz',
      price: 44.99,
      category: 'Sports & Outdoors',
    }
  ];

  // Create products
  const createdProducts = [];
  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product,
    });
    createdProducts.push(createdProduct);
  }

  console.log(`✅ ${createdProducts.length} products seeded successfully`);

  // Create product images for each product
  const imageUrls = [
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium.jpg?w=500',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606.jpg?w=500',
    'https://m.media-amazon.com/images/I/61+btfctMpL._AC_SX425_.jpg',
    'https://m.media-amazon.com/images/I/71cGGUOakpL._AC_SX425_.jpg',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/awjogtdnqxniqqk0wpgf/air-max-270-shoes-KkLcGR.png',
    'https://lsco.scene7.com/is/image/lsco/005010000-front-pdp?fmt=jpeg&qlt=70,1&op_sharpen=0&resMode=sharp2&op_usm=0.8,1,10,0&fit=crop,0&wid=750&hei=1000',
    'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',
    'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw193c9b22/images/hi-res/25542_NENA.jpg',
    'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/447887-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=960',
    'https://m.media-amazon.com/images/I/71W8dNlRGsL._AC_SX425_.jpg',
    'https://assets.philips.com/is/image/philipsconsumer/046677548483_01-RTP?$jpglarge$&wid=960',
    'https://m.media-amazon.com/images/I/81QU4YpnxkL._AC_SX425_.jpg',
    'https://m.media-amazon.com/images/I/81cpDaCJJCL._AC_UY327_FMwebp_QL65_.jpg',
    'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UY327_FMwebp_QL65_.jpg',
    'https://www.yeti.com/dw/image/v2/BDBF_PRD/on/demandware.static/-/Sites-yeti-master-catalog/default/dw94cd99c9/images/drinkware/21071060000/21071060000_Rambler_20oz_Tumbler_Charcoal_1.jpg',
    'https://www.hydroflask.com/media/catalog/product/w/3/w32sw2-pacific_1.jpg'
  ];

  // Create images for products
  for (let i = 0; i < createdProducts.length && i < imageUrls.length; i++) {
    await prisma.productImage.create({
      data: {
        url: imageUrls[i],
        productId: createdProducts[i].id,
      },
    });
  }

  console.log('✅ Product images seeded successfully');

  // Create some sample reviews
  for (let i = 0; i < Math.min(5, createdProducts.length); i++) {
    await prisma.review.create({
      data: {
        rating: 5,
        comment: 'Excellent product! Highly recommended.',
        userId: testUser.id,
        productId: createdProducts[i].id,
      },
    });
  }

  console.log('✅ Reviews seeded successfully');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 