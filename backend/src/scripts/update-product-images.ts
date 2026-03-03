/**
 * update-product-images.ts
 *
 * Bulk-updates every product's mainImage (and any IMAGE attachment records)
 * to use the proper product images from the "products images" folder.
 *
 * Run once:  npx tsx src/scripts/update-product-images.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCT_IMAGES = [
  'images/products images/Aluminium grear.jpeg',
  'images/products images/Exaavator spare parts.jpeg',
  'images/products images/Exaavator.jpeg',
  'images/products images/Haky parts.jpeg',
  'images/products images/UMGS PARTS.jpeg',
  'images/products images/filter category demoy images.jpg',
  'images/products images/filter category deomy image 3.jpg',
  'images/products images/filter category deomy image.jpg',
  'images/products images/filter catogory deomy image 2.jpg',
  'images/products images/saprepartss.jpeg',
  'images/products images/spare parts.jpeg',
];

async function main() {
  // Fetch all product IDs in a stable order
  const products = await prisma.product.findMany({
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Updating images for ${products.length} products...`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const newImage = PRODUCT_IMAGES[i % PRODUCT_IMAGES.length];

    // 1. Update mainImage on the product
    await prisma.product.update({
      where: { id: product.id },
      data: { mainImage: newImage },
    });

    // 2. Delete old IMAGE attachments for this product
    await prisma.productAttachment.deleteMany({
      where: { productId: product.id, type: 'IMAGE' },
    });

    // 3. Insert a fresh IMAGE attachment with the correct path
    await prisma.productAttachment.create({
      data: {
        productId: product.id,
        type:      'IMAGE',
        fileUrl:   newImage,
        fileName:  newImage.split('/').pop() ?? 'product.jpg',
        size:      0,
        mimeType:  newImage.endsWith('.jpeg') || newImage.endsWith('.jpg')
                   ? 'image/jpeg'
                   : 'image/png',
      },
    });
  }

  console.log('✅  All product images updated successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
