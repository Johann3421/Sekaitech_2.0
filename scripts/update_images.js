/**
 * Updates all existing product images and banners in the database
 * from placehold.co placeholders to real Unsplash stock photos.
 *
 * Run with: node scripts/update_images.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const UNSPLASH_IMAGES = {
  'procesadores':     'photo-1591488320449-011701bb6704',
  'placas-madre':     'photo-1518770660439-4636190af475',
  'memorias-ram':     'photo-1562976540-1502c2145186',
  'tarjetas-graficas':'photo-1593640495253-23196b27a87f',
  'almacenamiento':   'photo-1587304862697-22bc6a6f3e41',
  'fuentes-de-poder': 'photo-1601472544049-91d6c22dc68b',
  'cases':            'photo-1587202372634-32705e3bf49c',
  'refrigeracion':    'photo-1624705002806-5d72df19c3ad',
  'monitores':        'photo-1593642632559-0c6d3fc62b89',
  'perifericos':      'photo-1618384887929-16ec33fab9ef',
  'laptops':          'photo-1496181133206-80ce9b88a853',
};

function getProductImage(slug) {
  const photoId = UNSPLASH_IMAGES[slug] ?? 'photo-1518770660439-4636190af475';
  return `https://images.unsplash.com/${photoId}?w=600&h=600&q=80&auto=format&fit=crop`;
}

async function main() {
  console.log('🖼️  Updating product images to Unsplash...');

  const products = await prisma.product.findMany({
    include: { category: true, images: true },
  });

  let updated = 0;
  for (const product of products) {
    if (!product.images.length) continue;
    const url = getProductImage(product.category.slug);
    await prisma.productImage.updateMany({
      where: { productId: product.id },
      data: { url },
    });
    updated++;
  }
  console.log(`✅ Updated images for ${updated} products`);

  // Update banners
  const banners = await prisma.banner.findMany();
  const bannerImages = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1920&h=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=400&q=80&auto=format&fit=crop',
  ];

  for (let i = 0; i < banners.length; i++) {
    const imageUrl = bannerImages[i] ?? bannerImages[0];
    await prisma.banner.update({
      where: { id: banners[i].id },
      data: { imageUrl },
    });
  }
  console.log(`✅ Updated ${banners.length} banners`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
