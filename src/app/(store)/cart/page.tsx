"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { PriceDisplay } from "@/components/ui/PriceDisplay"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalUSD } =
    useCartStore()

  const total = totalUSD()
  const isEmpty = items.length === 0

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
          <ShoppingBag size={32} className="text-ink-tertiary" />
        </div>
        <h1 className="font-display font-bold text-2xl text-ink-primary mb-3">
          Tu carrito está vacío
        </h1>
        <p className="text-ink-secondary text-sm mb-8">
          Agrega productos para comenzar tu compra.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all active:scale-95"
        >
          <ShoppingBag size={18} />
          Explorar Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display font-bold text-3xl text-ink-primary mb-8">
        Carrito de Compras
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-center gap-4 p-4 bg-gradient-card border border-void-500 rounded-2xl"
              >
                {/* Image */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-20 h-20 flex-shrink-0 bg-void-800 rounded-xl overflow-hidden border border-void-600"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-tertiary font-mono text-xs">
                      N/A
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-display font-semibold text-sm text-ink-primary hover:text-cyber-400 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="font-mono text-xs text-ink-tertiary mt-0.5">
                    SKU: {item.sku}
                  </p>
                  <div className="mt-1">
                    <PriceDisplay priceUSD={item.priceUSD} size="sm" />
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-void-500 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="px-2 py-1.5 text-ink-secondary hover:text-ink-primary hover:bg-void-700 transition-colors"
                    aria-label="Disminuir"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2.5 py-1.5 font-mono text-xs text-ink-primary bg-void-800 min-w-[32px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="px-2 py-1.5 text-ink-secondary hover:text-ink-primary hover:bg-void-700 transition-colors"
                    aria-label="Aumentar"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="hidden sm:block text-right min-w-[100px]">
                  <PriceDisplay
                    priceUSD={item.priceUSD * item.quantity}
                    size="sm"
                  />
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-ink-tertiary hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={clearCart}
            className="text-sm text-ink-tertiary hover:text-danger-400 font-mono transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-gradient-card border border-void-500 rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-lg text-ink-primary">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-ink-secondary">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <PriceDisplay priceUSD={total} size="sm" />
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Envío</span>
                <span className="font-mono text-ink-tertiary">Por calcular</span>
              </div>
              <div className="border-t border-void-600 pt-3 flex justify-between">
                <span className="font-display font-bold text-ink-primary">
                  Total
                </span>
                <PriceDisplay priceUSD={total} size="md" showBoth />
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all active:scale-95"
            >
              Ir al Checkout
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/products"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-void-800 border border-void-500 hover:border-cyber-500/50 text-ink-secondary hover:text-ink-primary font-display font-semibold rounded-xl transition-all text-sm"
            >
              <ArrowLeft size={16} />
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
