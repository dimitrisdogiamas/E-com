import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addVariants() {
  console.log('Adding basic sizes and colors...');

  try {
    // Create basic sizes
    const sizes = await Promise.all([
      prisma.size.upsert({
        where: { name: 'XS' },
        update: {},
        create: { name: 'XS' },
      }),
      prisma.size.upsert({
        where: { name: 'S' },
        update: {},
        create: { name: 'S' },
      }),
      prisma.size.upsert({
        where: { name: 'M' },
        update: {},
        create: { name: 'M' },
      }),
      prisma.size.upsert({
        where: { name: 'L' },
        update: {},
        create: { name: 'L' },
      }),
      prisma.size.upsert({
        where: { name: 'XL' },
        update: {},
        create: { name: 'XL' },
      }),
    ]);

    // Create basic colors
    const colors = await Promise.all([
      prisma.color.upsert({
        where: { name: 'Black' },
        update: {},
        create: { name: 'Black', hexCode: '#000000' },
      }),
      prisma.color.upsert({
        where: { name: 'White' },
        update: {},
        create: { name: 'White', hexCode: '#FFFFFF' },
      }),
      prisma.color.upsert({
        where: { name: 'Blue' },
        update: {},
        create: { name: 'Blue', hexCode: '#0066CC' },
      }),
      prisma.color.upsert({
        where: { name: 'Red' },
        update: {},
        create: { name: 'Red', hexCode: '#CC0000' },
      }),
    ]);

    console.log(
      '✅ Created sizes: ',
      sizes.map((s) => s.name),
    );
    console.log(
      '✅ Created colors:',
      colors.map((c) => c.name),
    );

    // Get first few products to add variants
    const products = await prisma.product.findMany({
      take: 5,
      include: { variants: true },
    });

    for (const product of products) {
      if (product.variants.length === 0) {
        // Add 2-3 variants per product
        const productVariants = [];
        // Add M + Black variant
        productVariants.push(
          prisma.productVariant.create({
            data: {
              sku: `${product.name.replace(/\s+/g, '').toUpperCase()}-M-BLACK`,
              productId: product.id,
              sizeId: sizes.find((s) => s.name === 'M')!.id,
              colorId: colors.find((c) => c.name === 'Black')!.id,
              stock: 50,
              price: product.price,
            },
          }),
        );

        // Add L + Blue variant
        productVariants.push(
          prisma.productVariant.create({
            data: {
              sku: `${product.name.replace(/\s+/g, '').toUpperCase()}-L-BLUE`,
              productId: product.id,
              sizeId: sizes.find((s) => s.name === 'L')!.id,
              colorId: colors.find((c) => c.name === 'Blue')!.id,
              stock: 30,
              price: product.price,
            },
          }),
        );

        const createdVariants = await Promise.all(productVariants);
        console.log(`
          ✅ Added ${createdVariants.length} variants for ${product.name}`);
      }
    }

    console.log('🎉 Variants added successfully!');
  } catch (error) {
    console.error('Error adding variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addVariants();
