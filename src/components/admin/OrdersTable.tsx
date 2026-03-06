'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Eye, ChevronDown } from 'lucide-react'

interface OrderItemData {
  id: string
  quantity: number
  priceUSD: number
  product: {
    name: string
  }
}

interface OrderData {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  totalUSD: number
  totalPEN: number
  currency: string
  createdAt: string
  items: OrderItemData[]
  user: {
    name: string | null
    email: string
  } | null
}

interface OrdersTableProps {
  orders: OrderData[]
  onStatusChange?: (orderId: string, newStatus: string) => Promise<void>
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'compatible' | 'premium' | 'incompatible' | 'default'; color: string }> = {
  PENDING: { label: 'Pendiente', variant: 'warning', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  CONFIRMED: { label: 'Confirmado', variant: 'compatible', color: 'bg-cyber-500/15 text-cyber-400 border-cyber-500/30' },
  PROCESSING: { label: 'Procesando', variant: 'compatible', color: 'bg-cyber-500/15 text-cyber-300 border-cyber-500/30' },
  SHIPPED: { label: 'Enviado', variant: 'premium', color: 'bg-plasma-500/15 text-plasma-400 border-plasma-500/30' },
  DELIVERED: { label: 'Entregado', variant: 'compatible', color: 'bg-volt-500/15 text-volt-400 border-volt-500/30' },
  CANCELLED: { label: 'Cancelado', variant: 'incompatible', color: 'bg-danger-500/15 text-danger-400 border-danger-500/30' },
  REFUNDED: { label: 'Reembolsado', variant: 'default', color: 'bg-void-700 text-ink-secondary border-void-500' },
}

const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!onStatusChange) return
    setUpdatingId(orderId)
    try {
      await onStatusChange(orderId, newStatus)
    } finally {
      startTransition(() => {
        setUpdatingId(null)
      })
    }
  }

  const itemsCount = (items: OrderItemData[]) =>
    items.reduce((acc, item) => acc + item.quantity, 0)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-void-700">
            <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Pedido
            </th>
            <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Cliente
            </th>
            <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Fecha
            </th>
            <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Items
            </th>
            <th className="text-right py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Total
            </th>
            <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Estado
            </th>
            <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const config = statusConfig[order.status] || statusConfig.PENDING
            const isUpdating = updatingId === order.id

            return (
              <tr
                key={order.id}
                className={cn(
                  'border-b border-void-800 transition-colors hover:bg-void-800/80',
                  index % 2 === 0 ? 'bg-void-800/50' : 'bg-transparent'
                )}
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-cyber-400 hover:text-cyber-300 transition-colors"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-sans text-ink-primary text-sm">
                      {order.user?.name || 'Invitado'}
                    </span>
                    <span className="font-mono text-xs text-ink-tertiary">
                      {order.user?.email || '—'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-ink-secondary text-xs">
                    {formatDate(order.createdAt)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-mono text-ink-secondary tabular-nums">
                    {itemsCount(order.items)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono font-bold text-ink-primary tabular-nums">
                      ${Number(order.totalUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="font-mono text-xs text-ink-tertiary tabular-nums">
                      S/{Number(order.totalPEN).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  {onStatusChange ? (
                    <div className="relative inline-flex">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isUpdating}
                        className={cn(
                          'appearance-none cursor-pointer rounded-full border px-3 py-1 pr-7 text-xs font-mono font-medium transition-all outline-none',
                          config.color,
                          'bg-transparent focus:ring-1 focus:ring-cyber-500/50',
                          isUpdating && 'opacity-50 cursor-wait'
                        )}
                      >
                        {allStatuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                            className="bg-void-900 text-ink-primary"
                          >
                            {statusConfig[status]?.label || status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60"
                      />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-mono font-medium',
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ink-tertiary hover:text-cyber-400 hover:bg-void-700 transition-colors"
                    title="Ver detalle"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            )
          })}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-ink-tertiary text-sm">
                No se encontraron pedidos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
