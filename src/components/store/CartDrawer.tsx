'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalUSD } = useCartStore()
  const { cartDrawerOpen, setCartDrawerOpen } = useUIStore()

  const total = totalUSD()
  const hasItems = items.length > 0

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = cartDrawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartDrawerOpen])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && cartDrawerOpen) {
        setCartDrawerOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cartDrawerOpen, setCartDrawerOpen])

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={() => setCartDrawerOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 z-[71] w-full max-w-md bg-void-900 border-l border-void-600 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-void-700/50">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-cyber-400" />
                <h2 className="font-display font-bold text-lg text-ink-primary">
                  Carrito
                </h2>
                {hasItems && (
                  <span className="font-mono text-xs bg-cyber-500/15 text-cyber-400 border border-cyber-500/30 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-2 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-void-700/50 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {!hasItems ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ShoppingBag size={48} className="text-ink-tertiary mb-4" />
                  <p className="font-display font-semibold text-ink-primary mb-1">
                    Tu carrito está vacío
                  </p>
                  <p className="text-sm text-ink-tertiary">
                    Agrega productos para comenzar tu compra.
                  </p>
                  <button
                    onClick={() => setCartDrawerOpen(false)}
                    className="mt-6 px-5 py-2.5 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold text-sm rounded-xl transition-colors"
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-void-700/50">
                  {items.map((item) => (
                    <li key={item.productId} className="px-5 py-4">
                      <div className="flex gap-3">
                        {/* Image */}
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setCartDrawerOpen(false)}
                          className="shrink-0 w-20 h-20 rounded-xl bg-void-800 border border-void-600 overflow-hidden"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-xs font-mono">
                              IMG
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setCartDrawerOpen(false)}
                            className="text-sm font-medium text-ink-primary hover:text-cyber-400 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <div className="text-xs font-mono text-ink-tertiary mt-0.5">
                            SKU: {item.sku}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-void-500 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 text-ink-tertiary hover:text-ink-primary hover:bg-void-700 disabled:opacity-30 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 py-1 text-xs font-mono text-ink-primary bg-void-800 min-w-[32px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="p-1.5 text-ink-tertiary hover:text-ink-primary hover:bg-void-700 disabled:opacity-30 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <PriceDisplay priceUSD={item.priceUSD * item.quantity} size="sm" />
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="shrink-0 self-start p-1.5 rounded-lg text-ink-tertiary hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {hasItems && (
              <div className="border-t border-void-700/50 px-5 py-4 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-secondary font-display">Total</span>
                  <PriceDisplay priceUSD={total} size="md" />
                </div>

                {/* Actions */}
                <Link
                  href="/checkout"
                  onClick={() => setCartDrawerOpen(false)}
                  className="block w-full text-center px-5 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold text-sm rounded-xl transition-colors"
                >
                  Ir al checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full px-5 py-2.5 bg-void-800 border border-void-500 hover:border-danger-500/50 text-ink-secondary hover:text-danger-400 font-display text-sm rounded-xl transition-all"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
