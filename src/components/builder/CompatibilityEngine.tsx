'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldX, Loader2 } from 'lucide-react'
import { useBuilderStore } from '@/store/builder'
import { useCompatibility } from '@/hooks/useCompatibility'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface CheckItem {
  label: string
  status: 'pass' | 'fail' | 'warn' | 'pending'
  message: string
}

export function CompatibilityEngine() {
  const slots = useBuilderStore((s) => s.slots)
  const setCompatibilityResult = useBuilderStore((s) => s.setCompatibilityResult)
  const { result, loading, checkCompatibility } = useCompatibility()

  // Build a map of slot -> product id for the API
  const buildMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(slots)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, v!.id])
      ) as Partial<Record<string, string>>,
    [slots]
  )

  const filledCount = Object.keys(buildMap).length

  // Re-check whenever build changes (debounced)
  useEffect(() => {
    if (filledCount < 2) return
    const timer = setTimeout(() => {
      checkCompatibility(buildMap as Partial<Record<import('@/types').PCSlotType, string>>).then(
        (r) => r && setCompatibilityResult(r)
      )
    }, 600)
    return () => clearTimeout(timer)
  }, [buildMap, filledCount, checkCompatibility, setCompatibilityResult])

  // Derive check items from result
  const checks = useMemo<CheckItem[]>(() => {
    if (filledCount < 2) {
      return [
        {
          label: 'Compatibilidad',
          status: 'pending' as const,
          message: 'Selecciona al menos 2 componentes para verificar',
        },
      ]
    }

    if (!result) {
      return [
        {
          label: 'Compatibilidad',
          status: 'pending' as const,
          message: 'Verificando...',
        },
      ]
    }

    const items: CheckItem[] = []

    // Overall
    if (result.compatible) {
      items.push({ label: 'Estado general', status: 'pass', message: 'Build compatible' })
    } else {
      items.push({
        label: 'Estado general',
        status: 'fail',
        message: `${result.errors.length} problema${result.errors.length !== 1 ? 's' : ''} encontrado${result.errors.length !== 1 ? 's' : ''}`,
      })
    }

    // Map errors
    result.errors.forEach((err) => {
      items.push({ label: categorizeIssue(err), status: 'fail', message: err })
    })

    // Map warnings
    result.warnings.forEach((warn) => {
      items.push({ label: categorizeIssue(warn), status: 'warn', message: warn })
    })

    // If no issues at all, add an all-clear row
    if (result.errors.length === 0 && result.warnings.length === 0 && result.compatible) {
      items.push({ label: 'Todos los checks', status: 'pass', message: 'Sin problemas detectados' })
    }

    return items
  }, [result, filledCount])

  const isCompatible = result?.compatible ?? null

  const statusIcon = {
    pass: <CheckCircle2 size={16} className="text-volt-400 flex-shrink-0" />,
    fail: <XCircle size={16} className="text-danger-400 flex-shrink-0" />,
    warn: <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />,
    pending: <div className="w-4 h-4 rounded-full bg-void-600 flex-shrink-0" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-void-600 bg-void-900 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-void-700/50">
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-cyber-400" />
          ) : isCompatible === true ? (
            <ShieldCheck size={18} className="text-volt-400" />
          ) : isCompatible === false ? (
            <ShieldX size={18} className="text-danger-400" />
          ) : (
            <ShieldCheck size={18} className="text-ink-tertiary" />
          )}
          <span className="text-sm font-display font-semibold text-ink-primary">
            Compatibilidad
          </span>
        </div>

        {isCompatible !== null && !loading && (
          <Badge variant={isCompatible ? 'compatible' : 'incompatible'}>
            {isCompatible ? 'Compatible' : 'Incompatible'}
          </Badge>
        )}
      </div>

      {/* Checks list */}
      <div className="divide-y divide-void-700/30">
        {checks.map((check, i) => (
          <motion.div
            key={`${check.label}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'flex items-start gap-3 px-4 py-3',
              check.status === 'fail' && 'bg-danger-500/5',
              check.status === 'warn' && 'bg-amber-500/5'
            )}
          >
            <div className="mt-0.5">{statusIcon[check.status]}</div>
            <div className="min-w-0">
              <p className="text-xs font-display font-semibold uppercase tracking-wider text-ink-secondary">
                {check.label}
              </p>
              <p className="text-sm text-ink-primary/80 mt-0.5 leading-snug">{check.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/** Categorize an issue string to a user-friendly label */
function categorizeIssue(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('socket')) return 'CPU ↔ Motherboard'
  if (lower.includes('ddr') || lower.includes('ram') || lower.includes('memoria')) return 'RAM ↔ Motherboard'
  if (lower.includes('cooler') || lower.includes('tdp') || lower.includes('enfriamiento')) return 'Cooler ↔ CPU'
  if (lower.includes('psu') || lower.includes('watts') || lower.includes('fuente')) return 'Fuente de poder'
  if (lower.includes('case') || lower.includes('form') || lower.includes('factor') || lower.includes('gabinete')) return 'Case ↔ Motherboard'
  return 'Verificación'
}
