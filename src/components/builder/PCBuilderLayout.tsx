'use client'

import { motion } from 'framer-motion'
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useBuilderStore } from '@/store/builder'
import { Button } from '@/components/ui/Button'
import { BuilderSlot } from './BuilderSlot'
import { BuildSummary } from './BuildSummary'
import { PowerCalculator } from './PowerCalculator'
import { CompatibilityEngine } from './CompatibilityEngine'
import type { PCSlotType } from '@/types'

interface SlotConfig {
  slot: PCSlotType
  label: string
  icon: LucideIcon
}

const SLOT_CONFIGS = [
  { slot: 'CPU' as const, label: 'Procesador', icon: Cpu },
  { slot: 'MOTHERBOARD' as const, label: 'Placa madre', icon: CircuitBoard },
  { slot: 'RAM' as const, label: 'Memoria RAM', icon: MemoryStick },
  { slot: 'GPU' as const, label: 'Tarjeta gráfica', icon: Monitor },
  { slot: 'STORAGE' as const, label: 'Almacenamiento', icon: HardDrive },
  { slot: 'PSU' as const, label: 'Fuente de poder', icon: Zap },
  { slot: 'CASE' as const, label: 'Gabinete', icon: Box },
  { slot: 'COOLER' as const, label: 'Cooler', icon: Fan },
] satisfies SlotConfig[]

export function PCBuilderLayout() {
  const clearBuild = useBuilderStore((s) => s.clearBuild)
  const slotCount = useBuilderStore((s) => Object.keys(s.slots).length)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ink-primary">
            PC Builder
          </h1>
          <p className="text-ink-secondary text-sm mt-1 font-sans">
            Arma tu PC ideal — selecciona cada componente y verifica compatibilidad en tiempo real
          </p>
        </div>

        {slotCount > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button variant="danger" size="sm" onClick={clearBuild}>
              <Trash2 size={14} />
              Limpiar build
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Main grid: slots + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Slots grid + extras */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slots grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SLOT_CONFIGS.map((config, i) => (
              <motion.div
                key={config.slot}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <BuilderSlot
                  slot={config.slot}
                  label={config.label}
                  icon={config.icon}
                />
              </motion.div>
            ))}
          </div>

          {/* Power calculator */}
          <PowerCalculator />

          {/* Compatibility engine */}
          <CompatibilityEngine />
        </div>

        {/* Right — Summary sidebar */}
        <div className="lg:col-span-1">
          <BuildSummary />
        </div>
      </div>
    </div>
  )
}
