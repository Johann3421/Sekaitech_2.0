import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { position: 'asc' },
    include: {
      _count: { select: { products: true } },
      products: {
        where: { published: true },
        include: { images: { orderBy: { position: 'asc' }, take: 1 } },
        take: 1,
      },
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      <div className="mb-8">
        <span className="font-mono text-xs text-cyber-400 mb-1 block">{'// CATEGORÍAS'}</span>
        <h1 className="font-display font-bold text-3xl lg:text-4xl text-ink-primary">Todas las Categorías</h1>
        <p className="text-ink-secondary mt-2">Explora componentes y tecnología por tipo de producto.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const preview = cat.image || cat.products[0]?.images[0]?.url || null
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-void-700 bg-white shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="relative h-40 w-full bg-void-900">
                {preview ? (
                  <Image
                    src={preview}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-void" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h2 className="font-display font-semibold text-white text-lg leading-tight">{cat.name}</h2>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-ink-secondary">{cat._count.products} productos</span>
                <span className="text-sm font-semibold text-cyber-500 group-hover:text-cyber-400">Ver categoría →</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
