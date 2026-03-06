'use client'

import { ProductCard } from '@/components/store/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { PackageSearch } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGridProduct {
  id: string
  name: string
  slug: string
  sku?: string
  priceUSD: number
  comparePriceUSD?: number | null
  images: { url: string; alt?: string | null }[]
  brand?: { name: string } | null
  stock: number
  featured?: boolean
  category?: { name: string } | null
}

interface ProductGridProps {
  products: ProductGridProduct[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  className,
}: ProductGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch size={48} className="text-ink-tertiary mb-4" />
        <h3 className="font-display font-bold text-lg text-ink-primary mb-2">
          No se encontraron productos
        </h3>
        <p className="text-sm text-ink-tertiary max-w-sm">
          Intenta ajustar los filtros o buscar con otros términos.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
