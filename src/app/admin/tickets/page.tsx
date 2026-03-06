import { prisma } from '@/lib/prisma';
import { TicketsList } from '@/components/admin/TicketsList';
import { MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const stats = {
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    total: tickets.length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-100">
          Gestión de Tickets
        </h1>
        <p className="text-ink-400 text-sm mt-1">
          Soporte al cliente y gestión de consultas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ink-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-ink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">{stats.total}</p>
              <p className="text-ink-400 text-xs">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-cyber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">{stats.open}</p>
              <p className="text-ink-400 text-xs">Abiertos</p>
            </div>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">{stats.inProgress}</p>
              <p className="text-ink-400 text-xs">En progreso</p>
            </div>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-volt-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-volt-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">{stats.resolved}</p>
              <p className="text-ink-400 text-xs">Resueltos</p>
            </div>
          </div>
        </div>
      </div>

      <TicketsList tickets={tickets as any} />
    </div>
  );
}
