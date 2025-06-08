import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
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

  // Clear existing data to avoid duplicates
  console.log('🧹 Clearing existing data...');
  await prisma.review.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.wishListItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.size.deleteMany({});
  await prisma.color.deleteMany({});

  // Create sizes
  console.log('👕 Creating sizes...');
  const sizes = [
    { name: 'XS' },
    { name: 'S' },
    { name: 'M' },
    { name: 'L' },
    { name: 'XL' },
    { name: 'XXL' },
  ];

  const createdSizes = [];
  for (const size of sizes) {
    const createdSize = await prisma.size.create({ data: size });
    createdSizes.push(createdSize);
  }

  console.log(`✅ ${createdSizes.length} sizes created`);

  // Create colors
  console.log('🎨 Creating colors...');
  const colors = [
    { name: 'Black', hexCode: '#000000' },
    { name: 'White', hexCode: '#FFFFFF' },
    { name: 'Blue', hexCode: '#0066CC' },
    { name: 'Red', hexCode: '#CC0000' },
    { name: 'Green', hexCode: '#00CC00' },
    { name: 'Gray', hexCode: '#666666' },
    { name: 'Navy', hexCode: '#003366' },
    { name: 'Pink', hexCode: '#FF69B4' },
    { name: 'Brown', hexCode: '#8B4513' },
  ];

  const createdColors = [];
  for (const color of colors) {
    const createdColor = await prisma.color.create({ data: color });
    createdColors.push(createdColor);
  }

  console.log(`✅ ${createdColors.length} colors created`);

  // Expanded product catalog with multiple categories
  const products = [
    // T-Shirts & Tops
    {
      name: 'Classic White T-Shirt',
      description:
        'Premium 100% cotton white t-shirt with perfect fit. Soft, breathable, and ideal for layering or wearing alone.',
      price: 25.99,
      category: 'T-Shirts',
    },
    {
      name: 'Vintage Black Band Tee',
      description:
        'Retro-style black t-shirt with distressed graphics. Made from soft cotton blend for ultimate comfort.',
      price: 32.99,
      category: 'T-Shirts',
    },
    {
      name: 'Striped Long Sleeve',
      description:
        'Navy and white striped long sleeve shirt, perfect for casual days and weekend outings.',
      price: 38.99,
      category: 'T-Shirts',
    },
    {
      name: 'Pink Tank Top',
      description:
        'Lightweight pink tank top perfect for summer, workouts, or layering. Moisture-wicking fabric.',
      price: 19.99,
      category: 'T-Shirts',
    },
    {
      name: 'Navy Blue Polo Shirt',
      description:
        'Classic navy polo shirt with collar and button placket. Professional yet comfortable.',
      price: 45.99,
      category: 'T-Shirts',
    },

    // Bottoms
    {
      name: 'Blue Denim Jeans',
      description:
        'Classic straight-fit blue jeans made from premium denim. Durable, comfortable, and timeless.',
      price: 79.99,
      category: 'Bottoms',
    },
    {
      name: 'Black Skinny Jeans',
      description:
        'Modern black skinny jeans with stretch fabric for comfort and style. Perfect for any occasion.',
      price: 69.99,
      category: 'Bottoms',
    },
    {
      name: 'Brown Chinos',
      description:
        'Smart casual brown chino pants with tailored fit. Versatile for work or weekend wear.',
      price: 54.99,
      category: 'Bottoms',
    },
    {
      name: 'Green Cargo Pants',
      description:
        'Utility-style green cargo pants with multiple pockets. Durable and functional design.',
      price: 69.99,
      category: 'Bottoms',
    },
    {
      name: 'Grey Sweatpants',
      description:
        'Ultra-comfortable grey sweatpants with soft fleece lining. Perfect for lounging and workouts.',
      price: 45.99,
      category: 'Bottoms',
    },

    // Outerwear
    {
      name: 'Black Leather Jacket',
      description:
        'Genuine leather jacket with classic biker styling. Premium quality with attention to detail.',
      price: 299.99,
      category: 'Outerwear',
    },
    {
      name: 'Black Hoodie',
      description:
        'Cozy black hoodie with front kangaroo pocket and drawstring hood. Soft cotton blend.',
      price: 59.99,
      category: 'Outerwear',
    },
    {
      name: 'Denim Jacket',
      description:
        'Classic blue denim jacket with authentic wash and vintage styling. A wardrobe essential.',
      price: 89.99,
      category: 'Outerwear',
    },
    {
      name: 'Wool Peacoat',
      description:
        'Elegant navy wool peacoat with double-breasted design. Perfect for formal winter occasions.',
      price: 189.99,
      category: 'Outerwear',
    },
    {
      name: 'Bomber Jacket',
      description:
        'Stylish olive green bomber jacket with ribbed cuffs and hem. Modern streetwear essential.',
      price: 79.99,
      category: 'Outerwear',
    },

    // Dresses & Skirts
    {
      name: 'Red Summer Dress',
      description:
        'Flowing red dress with floral print, perfect for summer gatherings and special occasions.',
      price: 89.99,
      category: 'Dresses',
    },
    {
      name: 'Little Black Dress',
      description:
        'Timeless black dress with elegant silhouette. Versatile for cocktail parties and formal events.',
      price: 109.99,
      category: 'Dresses',
    },
    {
      name: 'Blue Maxi Dress',
      description:
        'Bohemian-style blue maxi dress with flowing fabric and comfortable fit. Perfect for beach days.',
      price: 75.99,
      category: 'Dresses',
    },
    {
      name: 'Plaid Mini Skirt',
      description:
        'Cute plaid mini skirt with classic pattern. Great for casual outings and school looks.',
      price: 39.99,
      category: 'Dresses',
    },

    // Footwear
    {
      name: 'White Sneakers',
      description:
        'Clean white leather sneakers with classic design. Comfortable for all-day wear.',
      price: 89.99,
      category: 'Footwear',
    },
    {
      name: 'Black Combat Boots',
      description:
        'Durable black combat boots with lace-up design and chunky sole. Edgy and comfortable.',
      price: 119.99,
      category: 'Footwear',
    },
    {
      name: 'Brown Leather Loafers',
      description:
        'Classic brown leather loafers with elegant design. Perfect for business casual looks.',
      price: 129.99,
      category: 'Footwear',
    },
    {
      name: 'Pink Running Shoes',
      description:
        'Lightweight pink running shoes with breathable mesh and cushioned sole for comfort.',
      price: 99.99,
      category: 'Footwear',
    },

    // Accessories
    {
      name: 'Black Baseball Cap',
      description:
        'Classic black baseball cap with adjustable strap. Perfect for casual outfits and sun protection.',
      price: 24.99,
      category: 'Accessories',
    },
    {
      name: 'Leather Belt',
      description:
        'Premium brown leather belt with classic buckle. Essential accessory for any wardrobe.',
      price: 34.99,
      category: 'Accessories',
    },
    {
      name: 'Silk Scarf',
      description:
        'Luxurious silk scarf with elegant pattern. Perfect for adding sophistication to any outfit.',
      price: 49.99,
      category: 'Accessories',
    },
    {
      name: 'Silver Watch',
      description:
        'Elegant silver watch with minimalist design and leather strap. Timeless and sophisticated.',
      price: 159.99,
      category: 'Accessories',
    },

    // Activewear
    {
      name: 'Yoga Leggings',
      description:
        'High-waisted black yoga leggings with moisture-wicking fabric. Perfect for workouts and athleisure.',
      price: 49.99,
      category: 'Activewear',
    },
    {
      name: 'Sports Bra',
      description:
        'Supportive sports bra with breathable fabric and comfortable fit. Ideal for medium-impact activities.',
      price: 29.99,
      category: 'Activewear',
    },
    {
      name: 'Athletic Shorts',
      description:
        'Lightweight athletic shorts with built-in compression liner. Perfect for running and training.',
      price: 34.99,
      category: 'Activewear',
    },
    {
      name: 'Zip-Up Hoodie',
      description:
        'Athletic zip-up hoodie with moisture-wicking properties. Great for pre and post-workout wear.',
      price: 65.99,
      category: 'Activewear',
    },
  ];

  // Create products
  const createdProducts: any[] = [];
  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product,
    });
    createdProducts.push(createdProduct);
  }

  console.log(
    `✅ ${createdProducts.length} products seeded successfully across multiple categories`,
  );

  // High-quality fashion images from Unsplash
  const imageUrls = [
    // T-Shirts & Tops
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', // White T-shirt
    'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop', // Black band tee
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop', // Striped shirt
    'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400&h=400&fit=crop', // Pink tank top
    'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=400&h=400&fit=crop', // Navy polo
    // Bottoms
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', // Blue jeans
    'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop', // Black jeans
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop', // Brown chinos
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', // Cargo pants
    'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?w=400&h=400&fit=crop', // Grey sweatpants
    // Outerwear
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', // Leather jacket
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', // Black hoodie
    'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?w=400&h=400&fit=crop', // Denim jacket
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', // Wool coat
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=400&fit=crop', // Bomber jacket
    // Dresses
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', // Red dress
    'https://images.unsplash.com/photo-1566479179817-c0a6b3b21e13?w=400&h=400&fit=crop', // Black dress
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop', // Blue maxi
    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop', // Plaid skirt
    // Footwear
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', // White sneakers
    'https://images.unsplash.com/photo-1520256862855-398228c41684?w=400&h=400&fit=crop', // Combat boots
    'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=400&fit=crop', // Brown loafers
    'https://images.unsplash.com/photo-1552066344-2464c1135c32?w=400&h=400&fit=crop', // Pink running shoes
    // Accessories
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop', // Baseball cap
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', // Leather belt
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop', // Silk scarf
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop', // Silver watch
    // Activewear
    'https://images.unsplash.com/photo-1506629905607-d5b4671bb69f?w=400&h=400&fit=crop', // Yoga leggings
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', // Sports bra
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', // Athletic shorts
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop', // Zip-up hoodie
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

  // Create product variants (size/color combinations)
  console.log('🔗 Creating product variants...');
  const variantCount = [];
  for (const product of createdProducts) {
    // Create 2-3 variants per product with different size/color combinations
    const productVariants = [
      {
        sku: `${product.name.replace(/\s+/g, '').toUpperCase()}-M-BLACK`,
        productId: product.id,
        sizeId: createdSizes.find((s) => s.name === 'M')!.id,
        colorId: createdColors.find((c) => c.name === 'Black')!.id,
        stock: 50,
        price: product.price,
      },
      {
        sku: `${product.name.replace(/\s+/g, '').toUpperCase()}-L-BLUE`,
        productId: product.id,
        sizeId: createdSizes.find((s) => s.name === 'L')!.id,
        colorId: createdColors.find((c) => c.name === 'Blue')!.id,
        stock: 30,
        price: product.price,
      },
      {
        sku: `${product.name.replace(/\s+/g, '').toUpperCase()}-S-WHITE`,
        productId: product.id,
        sizeId: createdSizes.find((s) => s.name === 'S')!.id,
        colorId: createdColors.find((c) => c.name === 'White')!.id,
        stock: 40,
        price: product.price,
      },
    ];

    for (const variant of productVariants) {
      try {
        await prisma.productVariant.create({ data: variant });
        variantCount.push(variant);
      } catch {
        // Skip if SKU already exists
        console.log(`Skipping duplicate SKU: ${variant.sku}`);
      }
    }
  }

  console.log(`✅ ${variantCount.length} product variants created`);

  // Create some sample reviews
  for (let i = 0; i < Math.min(5, createdProducts.length); i++) {
    await prisma.review.create({
      data: {
        rating: Math.floor(Math.random() * 2) + 4, // Random rating 4 or 5
        comment:
          i === 0
            ? 'Excellent quality and perfect fit!'
            : i === 1
              ? 'Great value for money, highly recommended!'
              : i === 2
                ? 'Super comfortable and stylish!'
                : i === 3
                  ? 'Love this piece, exactly as described!'
                  : 'Amazing product, will buy again!',
        userId: testUser.id,
        productId: createdProducts[i].id,
      },
    });
  }

  console.log('✅ Reviews seeded successfully');
  console.log('✅ Reviews seeded successfully');
  console.log('🎉 Database seeding completed with expanded product catalog!');
  console.log('📊 Summary:');
  console.log(
    `   - ${createdProducts.length} products across multiple categories`,
  );
  console.log(`   - ${createdSizes.length} size options`);
  console.log(`   - ${createdColors.length} color options`);
  console.log(`   - ${variantCount.length} product variants`);
  console.log(`   - High-quality product images`);
  console.log(`   - Sample reviews and users`);
  console.log('🛍️ Your e-commerce store is ready!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
