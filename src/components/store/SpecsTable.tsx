'use client'

import { cn } from '@/lib/utils'

interface Spec {
  key: string
  value: string
  unit?: string | null
}

interface SpecsTableProps {
  specs: Spec[]
  className?: string
}

export function SpecsTable({ specs, className }: SpecsTableProps) {
  if (specs.length === 0) return null

  return (
    <div
      className={cn(
        'border border-void-500 rounded-2xl overflow-hidden',
        className
      )}
    >
      <div className="px-5 py-3 bg-void-800 border-b border-void-600">
        <h3 className="font-display font-bold text-sm text-ink-primary">
          Especificaciones Técnicas
        </h3>
      </div>
      <div className="divide-y divide-void-700/50">
        {specs.map((spec, idx) => (
          <div
            key={spec.key}
            className={cn(
              'flex items-center justify-between px-5 py-3 text-sm',
              idx % 2 === 0 ? 'bg-void-900' : 'bg-void-800/50'
            )}
          >
            <span className="text-ink-secondary">{spec.key}</span>
            <span className="font-mono text-cyber-400 text-right">
              {spec.value}
              {spec.unit && (
                <span className="text-ink-tertiary ml-1 text-xs">{spec.unit}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
