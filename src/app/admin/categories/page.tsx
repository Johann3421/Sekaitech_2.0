import { prisma } from '@/lib/prisma'
import { Layers } from 'lucide-react'
import { CategoriesManager } from '@/components/admin/CategoriesManager'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-100 flex items-center gap-3">
          <Layers className="w-7 h-7 text-cyber-400" />
          Categorías
        </h1>
        <p className="text-ink-400 text-sm mt-1">
          Crea y modifica categorías para la tienda.
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  )
}
