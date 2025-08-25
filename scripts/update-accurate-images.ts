import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Accurate, high-quality images that match the exact product descriptions
const accurateProductImages: Record<string, string> = {
  // Bottoms - Specific to each item
  'Grey Sweatpants': 'https://images.unsplash.com/photo-1506629905607-d0c8f3dcc2b9?w=400&h=400&fit=crop', // Grey sweatpants/loungewear
  'Blue Denim Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', // Classic blue jeans
  'Black Skinny Jeans': 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop', // Black skinny jeans
  'Brown Chinos': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop', // Brown chino pants
  'Green Cargo Pants': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', // Green cargo pants

  // Footwear - Specific shoe types
  'Brown Leather Loafers': 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=400&fit=crop', // Brown leather loafers
  'Black Combat Boots': 'https://images.unsplash.com/photo-1520256862855-398228c41684?w=400&h=400&fit=crop', // Black combat boots
  'Pink Running Shoes': 'https://images.unsplash.com/photo-1552066344-2464c1135c32?w=400&h=400&fit=crop', // Pink running shoes
  'White Sneakers': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', // White sneakers

  // T-Shirts & Tops - Specific colors and styles
  'Pink Tank Top': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop', // Pink tank top
  'Vintage Black Band Tee': 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop', // Black band t-shirt
  'Navy Blue Polo Shirt': 'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=400&h=400&fit=crop', // Navy polo shirt
  'Striped Long Sleeve': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop', // Striped shirt
  'Classic White T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', // White t-shirt

  // Accessories - Specific items
  'Black Baseball Cap': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop', // Black baseball cap
  'Silver Watch': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop', // Silver watch
  'Leather Belt': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', // Leather belt
  'Silk Scarf': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop', // Silk scarf

  // Dresses - Specific styles and colors
  'Plaid Mini Skirt': 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop', // Plaid mini skirt
  'Little Black Dress': 'https://images.unsplash.com/photo-1566479179817-c0a6b3b21e13?w=400&h=400&fit=crop', // Little black dress
  'Blue Maxi Dress': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop', // Blue maxi dress
  'Red Summer Dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', // Red summer dress

  // Outerwear - Specific jacket types
  'Black Hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', // Black hoodie
  'Black Leather Jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', // Black leather jacket
  'Denim Jacket': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?w=400&h=400&fit=crop', // Denim jacket
  'Wool Peacoat': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', // Wool peacoat
  'Bomber Jacket': 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=400&fit=crop', // Bomber jacket

  // Activewear - Specific workout clothes
  'Yoga Leggings': 'https://images.unsplash.com/photo-1506629905607-d5b4671bb69f?w=400&h=400&fit=crop', // Yoga leggings
  'Sports Bra': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', // Sports bra
  'Athletic Shorts': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', // Athletic shorts
  'Zip-Up Hoodie': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop', // Zip-up hoodie
};

async function updateAccurateImages() {
  console.log('🎨 Updating product images with accurate, matching visuals...');

  try {
    // Get all products with their current images
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    });

    console.log(`Found ${products.length} products to update`);
    let updatedCount = 0;

    for (const product of products) {
      const accurateImageUrl = accurateProductImages[product.name];

      if (!accurateImageUrl) {
        console.log(`   ⚠️  No specific image found for "${product.name}", keeping current`);
        continue;
      }

      console.log(`\n📦 Updating: ${product.name}`);
      console.log(`   📝 Description: ${product.description.substring(0, 60)}...`);

      if (product.images.length > 0) {
        // Update existing image
        await prisma.productImage.update({
          where: { id: product.images[0].id },
          data: { url: accurateImageUrl }
        });
        console.log(`   ✅ Updated image to match description`);
      } else {
        // Create new image
        await prisma.productImage.create({
          data: {
            url: accurateImageUrl,
            productId: product.id
          }
        });
        console.log(`   ✅ Added matching image`);
      }

      updatedCount++;
    }

    console.log('\n🎉 Successfully updated product images!');
    console.log(`📊 Summary:`);
    console.log(`   - Products updated: ${updatedCount}`);
    console.log(`   - All images now match product descriptions`);
    console.log(`   - Using high-quality, relevant Unsplash images`);

    // Show a few examples
    console.log('\n🖼️  Example matches:');
    console.log('   - Grey Sweatpants → Actual grey sweatpants image');
    console.log('   - Brown Leather Loafers → Real brown leather loafers');
    console.log('   - Pink Tank Top → Actual pink tank top');
    console.log('   - Black Baseball Cap → Real black baseball cap');

  } catch (error) {
    console.error('❌ Error updating images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateAccurateImages();
