'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface SalesDataPoint {
  date: string
  total: number
  orders: number
}

interface SalesChartProps {
  data: SalesDataPoint[]
  className?: string
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-void-900 border border-void-600 rounded-xl px-4 py-3 shadow-card">
      <p className="text-xs font-mono text-ink-tertiary mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-ink-secondary font-sans">
            {entry.name === 'total' ? 'Ventas' : 'Pedidos'}:
          </span>
          <span className="font-mono font-bold text-ink-primary">
            {entry.name === 'total'
              ? `$ ${Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null

  const labels: Record<string, string> = {
    total: 'Ventas (USD)',
    orders: 'Pedidos',
  }

  return (
    <div className="flex items-center justify-center gap-6 pt-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-sans text-ink-secondary">
            {labels[entry.value] || entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function SalesChart({ data, className }: SalesChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#0a1628"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12, fontFamily: 'monospace' }}
            dy={8}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12, fontFamily: 'monospace' }}
            tickFormatter={(value: number) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
            dx={-4}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#475569', fontSize: 12, fontFamily: 'monospace' }}
            dx={4}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="total"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#gradientTotal)"
            dot={false}
            activeDot={{
              r: 5,
              fill: '#22d3ee',
              stroke: '#060d16',
              strokeWidth: 2,
            }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#a78bfa"
            strokeWidth={2}
            fill="url(#gradientOrders)"
            dot={false}
            activeDot={{
              r: 5,
              fill: '#a78bfa',
              stroke: '#060d16',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
