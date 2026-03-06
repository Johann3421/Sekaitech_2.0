'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Fan, Box, type LucideIcon } from 'lucide-react'
import { useBuilderStore } from '@/store/builder'
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
  CPU: 'CPU',
  MOTHERBOARD: 'Motherboard',
  RAM: 'RAM',
  GPU: 'GPU',
  STORAGE: 'Almacenamiento',
  PSU: 'Fuente',
  CASE: 'Case',
  COOLER: 'Cooler',
}

/** Fallback TDP estimates per slot when wattage unknown */
const ESTIMATED_WATTS: Partial<Record<PCSlotType, number>> = {
  CPU: 95,
  GPU: 200,
  RAM: 10,
  STORAGE: 8,
  MOTHERBOARD: 30,
  COOLER: 5,
}

export function PowerCalculator() {
  const slots = useBuilderStore((s) => s.slots)

  const breakdown = useMemo(() => {
    const items: { slot: PCSlotType; label: string; watts: number; icon: LucideIcon }[] = []
    let total = 0

    for (const [key, product] of Object.entries(slots)) {
      if (!product) continue
      const slot = key as PCSlotType
      if (slot === 'PSU' || slot === 'CASE') continue // PSU/Case don't consume power in this calc

      const watts =
        product.compatibility?.tdpWatts ??
        product.compatibility?.gpuTdpWatts ??
        (ESTIMATED_WATTS[slot] ?? 0)

      if (watts > 0) {
        items.push({ slot, label: SLOT_LABELS[slot], watts, icon: SLOT_ICONS[slot] })
        total += watts
      }
    }

    return { items, total }
  }, [slots])

  // PSU wattage from selected PSU
  const psuProduct = slots.PSU
  const psuWatts = psuProduct?.compatibility?.psuWatts ?? 0
  const recommendedWatts = Math.ceil((breakdown.total * 1.2) / 50) * 50

  // Load percentage
  const loadPercent = psuWatts > 0 ? Math.round((breakdown.total / psuWatts) * 100) : 0
  const barColor =
    psuWatts === 0
      ? 'bg-ink-tertiary'
      : loadPercent > 80
        ? 'bg-danger-500'
        : loadPercent > 60
          ? 'bg-amber-500'
          : 'bg-volt-500'
  const barGlow =
    psuWatts === 0
      ? ''
      : loadPercent > 80
        ? 'shadow-[0_0_12px_rgba(244,63,94,0.3)]'
        : loadPercent > 60
          ? 'shadow-[0_0_12px_rgba(245,158,11,0.3)]'
          : 'shadow-[0_0_12px_rgba(132,204,22,0.3)]'

  const displayPercent = psuWatts > 0 ? Math.min(loadPercent, 100) : breakdown.total > 0 ? 50 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-void-600 bg-void-900 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-void-700/50">
        <Zap size={16} className="text-amber-400" />
        <span className="text-sm font-display font-semibold text-ink-primary">
          Consumo energético
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Total watts display */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-ink-secondary font-display uppercase tracking-wider">
              Consumo estimado
            </p>
            <p className="text-2xl font-mono font-bold text-ink-primary tabular-nums">
              {breakdown.total}
              <span className="text-sm text-ink-secondary ml-1">W</span>
            </p>
          </div>
          {psuWatts > 0 && (
            <div className="text-right">
              <p className="text-xs text-ink-secondary font-display uppercase tracking-wider">
                PSU
              </p>
              <p className="text-lg font-mono font-bold text-ink-primary tabular-nums">
                {psuWatts}
                <span className="text-sm text-ink-secondary ml-1">W</span>
              </p>
            </div>
          )}
        </div>

        {/* Power bar */}
        <div className="space-y-1.5">
          <div className="h-3 rounded-full bg-void-800 overflow-hidden border border-void-600">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn('h-full rounded-full', barColor, barGlow)}
            />
          </div>
          <div className="flex justify-between text-xs font-mono">
            {psuWatts > 0 ? (
              <>
                <span
                  className={cn(
                    loadPercent > 80
                      ? 'text-danger-400'
                      : loadPercent > 60
                        ? 'text-amber-400'
                        : 'text-volt-400'
                  )}
                >
                  {loadPercent}% carga
                </span>
                <span className="text-ink-tertiary">
                  {Math.max(0, psuWatts - breakdown.total)}W disponibles
                </span>
              </>
            ) : (
              <span className="text-ink-tertiary">
                {breakdown.total > 0 ? `Recomendado: ${recommendedWatts}W PSU` : 'Sin componentes'}
              </span>
            )}
          </div>
        </div>

        {/* Breakdown per component */}
        {breakdown.items.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-void-700/50">
            {breakdown.items.map(({ slot, label, watts, icon: SlotIcon }) => {
              const pct = breakdown.total > 0 ? Math.round((watts / breakdown.total) * 100) : 0
              return (
                <div key={slot} className="flex items-center gap-2 text-sm">
                  <SlotIcon size={14} className="text-ink-tertiary flex-shrink-0" />
                  <span className="text-ink-secondary flex-1 truncate">{label}</span>
                  <span className="font-mono text-xs text-ink-tertiary tabular-nums w-8 text-right">
                    {pct}%
                  </span>
                  <span className="font-mono text-xs text-ink-primary tabular-nums w-12 text-right">
                    {watts}W
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Recommendation */}
        {breakdown.total > 0 && (!psuWatts || psuWatts < recommendedWatts) && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-400 font-display font-semibold">
              💡 PSU recomendada: {recommendedWatts}W mínimo
            </p>
            <p className="text-xs text-ink-secondary mt-0.5">
              Incluye 20% de margen sobre los {breakdown.total}W estimados
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
