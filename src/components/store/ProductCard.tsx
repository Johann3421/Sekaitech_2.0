'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { Badge } from '@/components/ui/Badge'
import { WishlistButton } from '@/components/store/WishlistButton'
import { useCartStore } from '@/store/cart'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface ProductCardProduct {
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

interface ProductCardProps {
  product: ProductCardProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const imageUrl = product.images[0]?.url || '/placeholder-product.png'
  const imageAlt = product.images[0]?.alt || product.name
  const inStock = product.stock > 0
  const href = `/products/${product.slug}`

  function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (!inStock) {
      toast.error('Producto sin stock')
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku ?? product.slug.toUpperCase(),
      priceUSD: product.priceUSD,
      imageUrl: imageUrl,
      stock: product.stock,
      quantity: 1,
    })
    toast.success(`${product.name} agregado al carrito`)
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group relative bg-gradient-card border border-void-700 rounded-2xl overflow-hidden shadow-product',
        'hover:shadow-card-hover hover:border-cyber-500/30 transition-all duration-300',
        className
      )}
    >
      {/* Wishlist Button — z-20 sits above the stretched link overlay */}
      <WishlistButton productId={product.id} className="absolute top-3 right-3 z-20 bg-white/70 border-void-700" />

      {/* Featured Badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="premium">★ Destacado</Badge>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-void-800">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn(
            'object-contain p-4 transition-transform duration-500 group-hover:scale-105',
            !imageLoaded && 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-void-700" />
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyber-500 hover:bg-cyber-400 text-white text-xs font-display font-bold rounded-lg transition-colors"
          >
            <ShoppingCart size={14} />
            Agregar
          </button>
          {/* Eye: plain button with router.push — NO nested Link */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(href)
            }}
            className="p-2 bg-white/80 hover:bg-white text-ink-secondary hover:text-ink-primary rounded-lg border border-void-700 transition-colors"
            aria-label="Ver producto"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        {/* Brand */}
        {product.brand && (
          <span className="font-mono text-[11px] text-ink-tertiary uppercase tracking-wider">
            {product.brand.name}
          </span>
        )}

        {/* Name — stretched-link: the ::after pseudo-element fills the whole article */}
        <h3 className="text-sm font-medium text-ink-primary line-clamp-2 leading-snug group-hover:text-cyber-500 transition-colors">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:z-10 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        <PriceDisplay
          priceUSD={product.priceUSD}
          comparePriceUSD={product.comparePriceUSD}
          size="sm"
        />

        {/* Stock Indicator */}
        <div className="flex items-center gap-1.5 pt-1">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              inStock ? 'bg-volt-500' : 'bg-danger-400'
            )}
          />
          <span
            className={cn(
              'text-[11px] font-mono',
              inStock ? 'text-volt-500' : 'text-danger-400'
            )}
          >
            {inStock ? `En stock (${product.stock})` : 'Agotado'}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
