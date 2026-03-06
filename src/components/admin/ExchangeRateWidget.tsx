'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  DollarSign,
  RefreshCw,
  Save,
  Clock,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react'

interface ExchangeRateWidgetProps {
  currentRate: number
  lastUpdated?: string | null
  className?: string
}

export function ExchangeRateWidget({
  currentRate: initialRate,
  lastUpdated: initialLastUpdated,
  className,
}: ExchangeRateWidgetProps) {
  const [rate, setRate] = useState<number>(initialRate)
  const [inputRate, setInputRate] = useState<string>(initialRate.toFixed(4))
  const [autoMode, setAutoMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialLastUpdated ?? null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    const newRate = parseFloat(inputRate)
    if (isNaN(newRate) || newRate <= 0) {
      setError('El tipo de cambio debe ser un número positivo')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchangeRate: newRate }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar')
      }

      const data = await res.json()
      const updatedRate = parseFloat(data.exchangeRate ?? newRate)
      setRate(updatedRate)
      setInputRate(updatedRate.toFixed(4))
      setLastUpdated(new Date().toISOString())
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/currency')
      if (!res.ok) throw new Error('Error al obtener tipo de cambio')
      const data = await res.json()
      const freshRate = parseFloat(data.rate ?? data.exchangeRate ?? rate)
      setRate(freshRate)
      setInputRate(freshRate.toFixed(4))
      setLastUpdated(new Date().toISOString())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatLastUpdated = (iso: string | null) => {
    if (!iso) return 'Nunca'
    const date = new Date(iso)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={cn(
        'bg-void-900 border border-void-700 rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-void-700">
        <div className="w-9 h-9 rounded-lg bg-volt-500/15 flex items-center justify-center">
          <DollarSign size={18} className="text-volt-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-ink-primary text-sm">
            Tipo de Cambio
          </h3>
          <p className="text-xs text-ink-tertiary font-sans">USD → PEN</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={saving}
          className="p-2 rounded-lg text-ink-tertiary hover:text-cyber-400 hover:bg-void-800 transition-colors disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={16} className={cn(saving && 'animate-spin')} />
        </button>
      </div>

      {/* Current rate */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-ink-tertiary font-sans mb-1">Tasa actual</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold text-3xl text-cyber-400 tabular-nums">
                {rate.toFixed(4)}
              </span>
              <span className="text-xs text-ink-tertiary font-sans">PEN/USD</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-volt-500/10 border border-volt-500/20">
            <TrendingUp size={14} className="text-volt-400" />
            <span className="text-xs font-mono text-volt-400">
              1 USD = S/{rate.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Conversion preview */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-void-800 rounded-lg p-3 border border-void-700">
            <p className="text-[10px] text-ink-tertiary font-sans uppercase tracking-wider mb-1">
              $100 USD
            </p>
            <p className="font-mono font-bold text-ink-primary text-sm tabular-nums">
              S/{(100 * rate).toFixed(2)}
            </p>
          </div>
          <div className="bg-void-800 rounded-lg p-3 border border-void-700">
            <p className="text-[10px] text-ink-tertiary font-sans uppercase tracking-wider mb-1">
              $1,000 USD
            </p>
            <p className="font-mono font-bold text-ink-primary text-sm tabular-nums">
              S/{(1000 * rate).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center justify-between mb-4 py-3 px-4 bg-void-800 rounded-lg border border-void-700">
          <div className="flex items-center gap-2">
            {autoMode ? (
              <ToggleRight size={22} className="text-cyber-400" />
            ) : (
              <ToggleLeft size={22} className="text-ink-tertiary" />
            )}
            <span className="text-sm font-sans text-ink-secondary">
              {autoMode ? 'Automático' : 'Manual'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAutoMode(!autoMode)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-mono transition-all',
              autoMode
                ? 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/30'
                : 'bg-void-700 text-ink-tertiary border border-void-600 hover:border-void-500'
            )}
          >
            {autoMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Manual input */}
        {!autoMode && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Nuevo tipo de cambio"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={inputRate}
                  onChange={(e) => setInputRate(e.target.value)}
                  placeholder="3.7500"
                />
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={saving}
              className="w-full"
            >
              <Save size={14} />
              Guardar tipo de cambio
            </Button>
          </div>
        )}

        {/* Status messages */}
        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-danger-500/10 border border-danger-500/20">
            <p className="text-xs text-danger-400 font-mono">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-volt-500/10 border border-volt-500/20">
            <p className="text-xs text-volt-400 font-mono">Tipo de cambio actualizado correctamente</p>
          </div>
        )}

        {/* Last updated */}
        <div className="mt-4 flex items-center gap-1.5 text-ink-tertiary">
          <Clock size={12} />
          <span className="text-[11px] font-mono">
            Última actualización: {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  )
}
