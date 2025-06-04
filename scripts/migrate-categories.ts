import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCategories() {
  console.log('Starting category migration...');

  try {
    // Create main categories
    const categories = [
      { name: 'T-Shirts', description: 'Comfortable and stylish t-shirts', sortOrder: 1 },
      { name: 'Jeans', description: 'Classic and modern denim jeans', sortOrder: 2 },
      { name: 'Dresses', description: 'Elegant dresses for all occasions', sortOrder: 3 },
      { name: 'Hoodies', description: 'Warm and cozy hoodies', sortOrder: 4 },
      { name: 'Jackets', description: 'Stylish jackets and outerwear', sortOrder: 5 },
      { name: 'Accessories', description: 'Fashion accessories and extras', sortOrder: 6 },
    ];

    console.log('Creating categories...');
    const createdCategories = {};

    for (const categoryData of categories) {
      const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const category = await prisma.category.create({
        data: {
          ...categoryData,
          slug,
        },
      });
      createdCategories[categoryData.name] = category.id;
      console.log(`✓ Created category: ${categoryData.name} (${category.id})`);
    }

    // Get all products and their current categories
    console.log('\\nMigrating existing products...');
    const products = await prisma.product.findMany({
      select: { id: true, name: true, category: true },
    });

    let migratedCount = 0;
    
    for (const product of products) {
      // Map old category strings to new category IDs
      let categoryId = null;
      
      // Match based on old category string
      const oldCategory = product.category as any; // Since we're changing the schema
      if (typeof oldCategory === 'string') {
        // Find matching category
        for (const [catName, catId] of Object.entries(createdCategories)) {
          if (oldCategory.toLowerCase().includes(catName.toLowerCase().replace('-', ''))) {
            categoryId = catId as string;
            break;
          }
        }
        
        // Default to T-Shirts if no match found
        if (!categoryId) {
          categoryId = createdCategories['T-Shirts'];
        }
        
        // Note: We can't update the product here because the schema change hasn't been applied yet
        // This will need to be done after the Prisma migration
        console.log(`Product "${product.name}" (${oldCategory}) -> ${Object.keys(createdCategories).find(k => createdCategories[k] === categoryId)}`);
        migratedCount++;
      }
    }

    console.log(`\\n✓ Migration completed!`);
    console.log(`- Created ${categories.length} categories`);
    console.log(`- Mapped ${migratedCount} products`);
    console.log('\\nNext steps:');
    console.log('1. Run: npx prisma db push (to apply schema changes)');
    console.log('2. Run: npx ts-node scripts/update-product-categories.ts (to update product relations)');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategories(); 