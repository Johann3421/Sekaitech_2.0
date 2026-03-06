const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const CATEGORY_IMAGES = {
  procesadores: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=480&h=480&q=80&auto=format&fit=crop',
  'placas-madre': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=480&q=80&auto=format&fit=crop',
  'memorias-ram': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=480&h=480&q=80&auto=format&fit=crop',
  'tarjetas-graficas': 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=480&h=480&q=80&auto=format&fit=crop',
  almacenamiento: 'https://images.unsplash.com/photo-1587304862697-22bc6a6f3e41?w=480&h=480&q=80&auto=format&fit=crop',
  'fuentes-de-poder': 'https://images.unsplash.com/photo-1601472544049-91d6c22dc68b?w=480&h=480&q=80&auto=format&fit=crop',
  cases: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=480&h=480&q=80&auto=format&fit=crop',
  refrigeracion: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=480&h=480&q=80&auto=format&fit=crop',
  monitores: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=480&h=480&q=80&auto=format&fit=crop',
  perifericos: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=480&h=480&q=80&auto=format&fit=crop',
  laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&q=80&auto=format&fit=crop',
}

async function main() {
  const categories = await prisma.category.findMany({
    where: { slug: { in: Object.keys(CATEGORY_IMAGES) } },
    select: { id: true, slug: true },
  })

  for (const category of categories) {
    await prisma.category.update({
      where: { id: category.id },
      data: { image: CATEGORY_IMAGES[category.slug] },
    })
  }

  console.log(`Updated ${categories.length} categories with images`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
