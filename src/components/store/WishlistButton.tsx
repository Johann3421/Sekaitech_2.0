'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  className?: string
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadState() {
      try {
        const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`)
        if (!res.ok) return
        const data = await res.json()
        if (mounted && typeof data.wishlisted === 'boolean') {
          setWishlisted(data.wishlisted)
        }
      } catch {
        // Silent fallback: wishlist still works on explicit click.
      }
    }
    loadState()
    return () => {
      mounted = false
    }
  }, [productId])

  async function toggleWishlist() {
    if (loading) return
    setLoading(true)

    try {
      const method = wishlisted ? 'DELETE' : 'POST'
      const res = await fetch('/api/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar la lista de deseos')
      }

      setWishlisted(!wishlisted)
      toast.success(
        wishlisted
          ? 'Eliminado de tu lista de deseos'
          : 'Agregado a tu lista de deseos'
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ocurrió un error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWishlist()
      }}
      disabled={loading}
      className={cn(
        'p-2.5 rounded-xl transition-all border',
        wishlisted
          ? 'bg-danger-500/20 text-danger-400 border-danger-500/40 hover:bg-danger-500/30'
          : 'bg-void-800/60 text-ink-tertiary border-void-600/50 hover:text-danger-400 hover:border-danger-500/40 hover:bg-danger-500/10',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <motion.div
        animate={wishlisted ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          size={18}
          className={cn(wishlisted && 'fill-current')}
        />
      </motion.div>
    </motion.button>
  )
}
