'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { LucideIcon } from 'lucide-react'
import { MessageSquare, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface TicketData {
  id: string
  ticketCode: string
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'ORDER' | 'WARRANTY' | 'TECHNICAL' | 'BILLING' | 'GENERAL'
  createdAt: string
  updatedAt: string
  user: {
    name: string | null
    email: string
  }
  _count?: {
    messages: number
  }
}

interface TicketsListProps {
  tickets: TicketData[]
}

const statusTabs = [
  { key: 'ALL', label: 'Todos' },
  { key: 'OPEN', label: 'Abiertos' },
  { key: 'IN_PROGRESS', label: 'En progreso' },
  { key: 'WAITING_CUSTOMER', label: 'Esperando' },
  { key: 'RESOLVED', label: 'Resueltos' },
  { key: 'CLOSED', label: 'Cerrados' },
] as const

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  OPEN: { label: 'Abierto', color: 'bg-cyber-500/15 text-cyber-400 border-cyber-500/30', icon: MessageSquare },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Clock },
  WAITING_CUSTOMER: { label: 'Esperando', color: 'bg-plasma-500/15 text-plasma-400 border-plasma-500/30', icon: Clock },
  RESOLVED: { label: 'Resuelto', color: 'bg-volt-500/15 text-volt-400 border-volt-500/30', icon: CheckCircle2 },
  CLOSED: { label: 'Cerrado', color: 'bg-void-700 text-ink-secondary border-void-500', icon: XCircle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baja', color: 'text-ink-tertiary' },
  MEDIUM: { label: 'Media', color: 'text-ink-secondary' },
  HIGH: { label: 'Alta', color: 'text-amber-400' },
  URGENT: { label: 'Urgente', color: 'text-danger-400' },
}

const categoryLabels: Record<string, string> = {
  ORDER: 'Pedido',
  WARRANTY: 'Garantía',
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  GENERAL: 'General',
}

export function TicketsList({ tickets }: TicketsListProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const router = useRouter()

  const filteredTickets =
    activeTab === 'ALL'
      ? tickets
      : tickets.filter((t) => t.status === activeTab)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRelativeTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `hace ${diffMins}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return formatDate(dateStr)
  }

  return (
    <div>
      {/* Status filter tabs */}
      <div className="flex items-center gap-1 p-1 mb-4 bg-void-900 border border-void-700 rounded-xl overflow-x-auto scrollbar-none">
        {statusTabs.map((tab) => {
          const count =
            tab.key === 'ALL'
              ? tickets.length
              : tickets.filter((t) => t.status === tab.key).length

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-sans font-medium whitespace-nowrap transition-all',
                activeTab === tab.key
                  ? 'bg-cyber-500/15 text-cyber-400 shadow-sm'
                  : 'text-ink-tertiary hover:text-ink-secondary hover:bg-void-800'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono',
                  activeTab === tab.key
                    ? 'bg-cyber-500/20 text-cyber-400'
                    : 'bg-void-700 text-ink-tertiary'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tickets table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-void-700">
              <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                Código
              </th>
              <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                Asunto
              </th>
              <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                Cliente
              </th>
              <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                Estado
              </th>
              <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                Prioridad
              </th>
              <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                Categoría
              </th>
              <th className="text-right py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                Última actualización
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => {
              const config = statusConfig[ticket.status] || statusConfig.OPEN
              const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM
              const StatusIcon = config.icon

              return (
                <tr
                  key={ticket.id}
                  onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                  className={cn(
                    'border-b border-void-800 transition-colors cursor-pointer hover:bg-void-800/80',
                    index % 2 === 0 ? 'bg-void-800/50' : 'bg-transparent'
                  )}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-cyber-400 text-xs">
                      {ticket.ticketCode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-ink-primary line-clamp-1 max-w-[280px]">
                        {ticket.subject}
                      </span>
                      {ticket._count && ticket._count.messages > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-ink-tertiary">
                          <MessageSquare size={10} />
                          {ticket._count.messages}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-sans text-ink-primary text-sm">
                        {ticket.user.name || 'Sin nombre'}
                      </span>
                      <span className="font-mono text-xs text-ink-tertiary">
                        {ticket.user.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-mono font-medium',
                        config.color
                      )}
                    >
                      <StatusIcon size={11} />
                      {config.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn('text-xs font-mono font-medium flex items-center justify-center gap-1', priority.color)}>
                      {ticket.priority === 'URGENT' && <AlertTriangle size={11} />}
                      {ticket.priority === 'HIGH' && <AlertTriangle size={11} />}
                      {priority.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs font-sans text-ink-secondary">
                      {categoryLabels[ticket.category] || ticket.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-xs text-ink-tertiary">
                      {getRelativeTime(ticket.updatedAt)}
                    </span>
                  </td>
                </tr>
              )
            })}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-ink-tertiary text-sm">
                  No se encontraron tickets
                  {activeTab !== 'ALL' && ' con este estado'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
