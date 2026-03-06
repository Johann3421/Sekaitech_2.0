'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronRight, type LucideIcon } from 'lucide-react'
import { useBuilderStore } from '@/store/builder'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { ComponentPicker } from './ComponentPicker'
import { cn } from '@/lib/utils'
import type { PCSlotType } from '@/types'

interface BuilderSlotProps {
  slot: PCSlotType
  label: string
  icon: LucideIcon
}

export function BuilderSlot({ slot, label, icon: Icon }: BuilderSlotProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const product = useBuilderStore((s) => s.slots[slot])
  const removeSlot = useBuilderStore((s) => s.removeSlot)

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          'group relative rounded-2xl border transition-all duration-300',
          product
            ? 'bg-void-900 border-cyber-500/30 shadow-[0_0_20px_rgba(6,182,212,0.06)]'
            : 'bg-void-900/60 border-void-600 hover:border-void-500'
        )}
      >
        {/* Slot header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-void-700/50">
          <Icon size={16} className={product ? 'text-cyber-400' : 'text-ink-tertiary'} />
          <span className="text-xs font-display font-semibold uppercase tracking-wider text-ink-secondary">
            {label}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {product ? (
            <motion.div
              key="product"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <div className="flex items-center gap-3">
                {/* Product image */}
                <div className="relative h-14 w-14 flex-shrink-0 rounded-xl bg-void-800 border border-void-600 overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Icon size={20} className="text-void-500" />
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans text-ink-primary truncate leading-tight">
                    {product.name}
                  </p>
                  <PriceDisplay priceUSD={product.priceUSD} size="sm" className="mt-0.5" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPickerOpen(true)}
                    className="p-1.5 rounded-lg text-ink-tertiary hover:text-cyber-400 hover:bg-void-800 transition-colors"
                    title="Cambiar"
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeSlot(slot)}
                    className="p-1.5 rounded-lg text-ink-tertiary hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
                    title="Quitar"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-6 text-ink-tertiary hover:text-cyber-400 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-display font-semibold">Seleccionar</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Component picker modal */}
      <ComponentPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        slot={slot}
        label={label}
      />
    </>
  )
}
