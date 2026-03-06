"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Check, Minus, Plus } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { toast } from "@/components/ui/Toast"
import type { CartItem } from "@/types"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  product: Omit<CartItem, "quantity">
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const inStock = product.stock > 0

  function handleAdd() {
    if (!inStock) return
    addItem({ ...product, quantity: qty })
    setAdded(true)
    toast.success(`${product.name} agregado al carrito`)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Quantity selector */}
      <div className="flex items-center border border-void-500 rounded-xl overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2.5 text-ink-secondary hover:text-ink-primary hover:bg-void-700 transition-colors"
          aria-label="Disminuir cantidad"
        >
          <Minus size={16} />
        </button>
        <span className="px-3 py-2.5 font-mono text-sm text-ink-primary min-w-[40px] text-center bg-void-800">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="px-3 py-2.5 text-ink-secondary hover:text-ink-primary hover:bg-void-700 transition-colors"
          aria-label="Aumentar cantidad"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add to cart */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleAdd}
        disabled={!inStock}
        className={cn(
          "flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm transition-all",
          added
            ? "bg-volt-500/20 text-volt-400 border border-volt-500/40"
            : inStock
              ? "bg-cyber-500 hover:bg-cyber-400 text-void-950 active:scale-[0.97]"
              : "bg-void-700 text-ink-tertiary cursor-not-allowed"
        )}
      >
        {added ? (
          <>
            <Check size={18} /> Agregado
          </>
        ) : (
          <>
            <ShoppingCart size={18} /> {inStock ? "Agregar al Carrito" : "Sin Stock"}
          </>
        )}
      </motion.button>
    </div>
  )
}
