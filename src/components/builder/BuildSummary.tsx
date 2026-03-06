'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Save,
  Package,
  Zap,
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Box,
  Fan,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { useBuilderStore } from '@/store/builder'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { ShareBuildButton } from '@/components/store/ShareBuildButton'
import { BuildPDFButton } from './BuildPDFButton'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { PCSlotType } from '@/types'

const SLOT_ICONS: Record<PCSlotType, LucideIcon> = {
  CPU: Cpu,
  MOTHERBOARD: CircuitBoard,
  RAM: MemoryStick,
  GPU: Monitor,
  STORAGE: HardDrive,
  PSU: Zap,
  CASE: Box,
  COOLER: Fan,
}

const SLOT_LABELS: Record<PCSlotType, string> = {
  CPU: 'Procesador',
  MOTHERBOARD: 'Placa madre',
  RAM: 'Memoria RAM',
  GPU: 'Tarjeta gráfica',
  STORAGE: 'Almacenamiento',
  PSU: 'Fuente de poder',
  CASE: 'Gabinete',
  COOLER: 'Cooler',
}

const ALL_SLOTS: PCSlotType[] = ['CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'STORAGE', 'PSU', 'CASE', 'COOLER']

export function BuildSummary() {
  const slots = useBuilderStore((s) => s.slots)
  const totalUSD = useBuilderStore((s) => s.totalUSD)
  const compatibilityResult = useBuilderStore((s) => s.compatibilityResult)
  const buildName = useBuilderStore((s) => s.buildName)
  const setBuildName = useBuilderStore((s) => s.setBuildName)
  const addCartItem = useCartStore((s) => s.addItem)
  const [saving, setSaving] = useState(false)
  const [savedBuildId, setSavedBuildId] = useState<string | null>(null)

  const filledSlots = useMemo(
    () => ALL_SLOTS.filter((s) => slots[s] != null),
    [slots]
  )

  const totalWatts = useMemo(() => {
    return Object.entries(slots).reduce((sum, [key, product]) => {
      if (!product || key === 'PSU' || key === 'CASE') return sum
      return sum + (product.compatibility?.tdpWatts ?? product.compatibility?.gpuTdpWatts ?? 0)
    }, 0)
  }, [slots])

  const isCompatible = compatibilityResult?.compatible ?? null

  async function handleSaveBuild() {
    if (filledSlots.length === 0) {
      toast.error('Agrega al menos un componente')
      return
    }
    setSaving(true)
    try {
      const buildMap = Object.fromEntries(
        Object.entries(slots)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, v!.id])
      )
      const res = await fetch('/api/builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: buildName, slots: buildMap }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      const data = await res.json()
      setSavedBuildId(data.id ?? data.shareCode ?? null)
      toast.success('Build guardada exitosamente')
    } catch {
      toast.error('No se pudo guardar la build')
    } finally {
      setSaving(false)
    }
  }

  function handleAddAllToCart() {
    let added = 0
    for (const product of Object.values(slots)) {
      if (!product) continue
      addCartItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        priceUSD: product.priceUSD,
        imageUrl: product.imageUrl,
        quantity: 1,
        stock: product.stock,
        sku: product.sku,
      })
      added++
    }
    if (added > 0) {
      toast.success(`${added} producto${added !== 1 ? 's' : ''} agregado${added !== 1 ? 's' : ''} al carrito`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-void-600 bg-void-900 overflow-hidden sticky top-4"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-void-700/50">
        <input
          type="text"
          value={buildName}
          onChange={(e) => setBuildName(e.target.value)}
          className="w-full bg-transparent text-lg font-display font-bold text-ink-primary outline-none placeholder:text-ink-tertiary focus:text-cyber-400 transition-colors"
          placeholder="Nombre de tu build..."
        />
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs font-mono text-ink-secondary">
            {filledSlots.length}/{ALL_SLOTS.length} componentes
          </span>
          {totalWatts > 0 && (
            <span className="text-xs font-mono text-ink-secondary flex items-center gap-1">
              <Zap size={12} className="text-amber-400" />
              {totalWatts}W
            </span>
          )}
          {isCompatible !== null && (
            <Badge variant={isCompatible ? 'compatible' : 'incompatible'}>
              {isCompatible ? 'Compatible' : 'Incompatible'}
            </Badge>
          )}
        </div>
      </div>

      {/* Component list */}
      <div className="divide-y divide-void-700/30 max-h-[340px] overflow-y-auto">
        {ALL_SLOTS.map((slot) => {
          const product = slots[slot]
          const SlotIcon = SLOT_ICONS[slot]
          return (
            <div
              key={slot}
              className={cn(
                'flex items-center gap-3 px-5 py-2.5',
                product ? 'opacity-100' : 'opacity-40'
              )}
            >
              <SlotIcon size={14} className={product ? 'text-cyber-400' : 'text-ink-tertiary'} />
              <div className="flex-1 min-w-0">
                {product ? (
                  <p className="text-sm text-ink-primary truncate">{product.name}</p>
                ) : (
                  <p className="text-sm text-ink-tertiary italic">{SLOT_LABELS[slot]}</p>
                )}
              </div>
              {product && (
                <span className="text-sm font-mono text-cyber-400 tabular-nums flex-shrink-0">
                  ${product.priceUSD.toFixed(2)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="px-5 py-4 border-t border-void-700/50 bg-void-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-display font-semibold text-ink-secondary uppercase tracking-wider">
            Total
          </span>
          <PriceDisplay priceUSD={totalUSD} size="lg" />
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleAddAllToCart}
            disabled={filledSlots.length === 0}
          >
            <ShoppingCart size={16} />
            Agregar todo al carrito
          </Button>

          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={handleSaveBuild}
            loading={saving}
            disabled={filledSlots.length === 0}
          >
            <Save size={16} />
            Guardar Build
          </Button>

          <div className="flex gap-2">
            <ShareBuildButton buildId={savedBuildId ?? undefined} className="flex-1" />
            <BuildPDFButton className="flex-1" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
