'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, AlertTriangle, Check, Package } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { useBuilderStore } from '@/store/builder'
import { cn } from '@/lib/utils'
import type { PCSlotType, BuilderProduct } from '@/types'

interface ComponentPickerProps {
  open: boolean
  onClose: () => void
  slot: PCSlotType
  label: string
}

interface ProductResult {
  id: string
  name: string
  slug: string
  priceUSD: number
  images: { url: string }[]
  sku: string
  stock: number
  compatibility: Record<string, unknown> | null
  brand?: { name: string } | null
}

export function ComponentPicker({ open, onClose, slot, label }: ComponentPickerProps) {
  const [products, setProducts] = useState<ProductResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const setSlot = useBuilderStore((s) => s.setSlot)
  const currentProduct = useBuilderStore((s) => s.slots[slot])
  const slots = useBuilderStore((s) => s.slots)
  const abortRef = useRef<AbortController | null>(null)

  const fetchProducts = useCallback(async () => {
    if (!open) return
    setLoading(true)
    setError(null)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const buildParam = encodeURIComponent(
        JSON.stringify(
          Object.fromEntries(
            Object.entries(slots)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, v!.id])
          )
        )
      )
      const res = await fetch(
        `/api/products?pcSlot=${slot}&build=${buildParam}`,
        { signal: controller.signal }
      )
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProducts(data.products ?? data ?? [])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('No se pudieron cargar los productos. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [open, slot, slots])

  useEffect(() => {
    if (open) {
      setSearch('')
      fetchProducts()
    }
    return () => abortRef.current?.abort()
  }, [open, fetchProducts])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(p: ProductResult) {
    const builderProduct: BuilderProduct = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceUSD: p.priceUSD,
      imageUrl: p.images?.[0]?.url,
      sku: p.sku,
      stock: p.stock,
      compatibility: p.compatibility as any,
    }
    setSlot(slot, builderProduct)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Seleccionar ${label}`} size="xl">
      <div className="flex flex-col h-full">
        {/* Search bar */}
        <div className="px-5 py-3 border-b border-void-700">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className="w-full bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 text-ink-primary font-mono rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition-all placeholder:text-ink-tertiary"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-cyber-400" />
              <span className="text-sm text-ink-secondary">Cargando productos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertTriangle size={28} className="text-danger-400" />
              <p className="text-sm text-danger-400">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchProducts}>
                Reintentar
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Package size={28} className="text-ink-tertiary" />
              <p className="text-sm text-ink-secondary">
                {search ? 'No se encontraron productos' : `No hay productos para ${label}`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {filtered.map((p, i) => {
                  const isSelected = currentProduct?.id === p.id
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, delay: i * 0.03 }}
                      className={cn(
                        'relative rounded-xl border p-3 transition-all duration-200 cursor-pointer',
                        isSelected
                          ? 'bg-cyber-500/10 border-cyber-500/50'
                          : 'bg-void-800 border-void-600 hover:border-void-500 hover:bg-void-800/80'
                      )}
                      onClick={() => handleSelect(p)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Image */}
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg bg-void-900 border border-void-600 overflow-hidden">
                          {p.images?.[0]?.url ? (
                            <Image
                              src={p.images[0].url}
                              alt={p.name}
                              fill
                              className="object-contain p-1"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package size={20} className="text-void-500" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans text-ink-primary leading-tight line-clamp-2">
                            {p.name}
                          </p>
                          {p.brand?.name && (
                            <span className="text-xs text-ink-tertiary font-mono">{p.brand.name}</span>
                          )}
                          <PriceDisplay priceUSD={p.priceUSD} size="sm" className="mt-1" />
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0 p-1 rounded-full bg-cyber-500 text-void-950">
                            <Check size={12} />
                          </div>
                        )}
                      </div>

                      {/* Stock / out of stock */}
                      {p.stock <= 0 && (
                        <Badge variant="incompatible" className="absolute top-2 right-2">
                          Agotado
                        </Badge>
                      )}
                      {p.stock > 0 && p.stock <= 3 && (
                        <Badge variant="warning" className="absolute top-2 right-2">
                          Quedan {p.stock}
                        </Badge>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
