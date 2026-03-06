import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  OPEN: 'cyber',
  IN_PROGRESS: 'amber',
  RESOLVED: 'volt',
  CLOSED: 'default',
};

async function updateTicket(formData: FormData) {
  'use server';
  const ticketId = formData.get('ticketId') as string;
  const status = formData.get('status') as string;

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: status as any },
  });
}

async function sendReply(formData: FormData) {
  'use server';
  const ticketId = formData.get('ticketId') as string;
  const content = formData.get('content') as string;

  if (!content?.trim()) return;

  await prisma.ticketMessage.create({
    data: {
      ticketId,
      body: content.trim(),
      isStaff: true,
      authorName: 'Soporte',
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'IN_PROGRESS' },
  });
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!ticket) notFound();

  return (
    <div>
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-ink-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-xl font-bold text-ink-100">
                  {ticket.subject}
                </h1>
                <p className="text-ink-400 text-sm font-mono mt-1">
                  {ticket.ticketCode}
                </p>
              </div>
              <Badge variant={statusColors[ticket.status] as any}>
                {ticket.status}
              </Badge>
            </div>

            {/* Messages */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isStaff ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      msg.isStaff
                        ? 'bg-cyber-500/10 border border-cyber-500/20'
                        : 'bg-void-800/80 border border-void-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-medium ${
                          msg.isStaff ? 'text-cyber-400' : 'text-ink-300'
                        }`}
                      >
                        {msg.isStaff ? 'Soporte' : ticket.user.name}
                      </span>
                      <span className="text-ink-600 text-xs">
                        {new Date(msg.createdAt).toLocaleString('es-PE')}
                      </span>
                    </div>
                    <p className="text-ink-200 text-sm whitespace-pre-wrap">
                      {msg.body}
                    </p>
                    {msg.attachments?.[0] && (
                      <img
                        src={msg.attachments[0]}
                        alt="Adjunto"
                        className="mt-2 rounded-lg max-w-full h-auto max-h-48"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply form */}
            <form action={sendReply} className="mt-6 pt-4 border-t border-void-700/50">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <textarea
                name="content"
                rows={3}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-void-800 border border-void-600 rounded-lg px-4 py-3 text-ink-200 text-sm placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-cyber-500/50 resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="bg-cyber-500 hover:bg-cyber-600 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                >
                  Enviar respuesta
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <h3 className="font-display font-semibold text-ink-100 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-cyber-400" />
              Cliente
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-ink-200">{ticket.user.name}</p>
              <p className="text-ink-400">{ticket.user.email}</p>
            </div>
          </div>

          {/* Ticket info */}
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <h3 className="font-display font-semibold text-ink-100 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyber-400" />
              Detalles
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-400">Categoría</span>
                <span className="text-ink-200">{ticket.category || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Creado</span>
                <span className="text-ink-200">
                  {new Date(ticket.createdAt).toLocaleDateString('es-PE')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Mensajes</span>
                <span className="text-ink-200">{ticket.messages.length}</span>
              </div>
              {ticket.orderId && (
                <div className="flex justify-between">
                  <span className="text-ink-400">Pedido</span>
                  <Link
                    href={`/admin/orders/${ticket.orderId}`}
                    className="text-cyber-400 hover:text-cyber-300"
                  >
                    Ver pedido
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Update status */}
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <h3 className="font-display font-semibold text-ink-100 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyber-400" />
              Cambiar estado
            </h3>
            <form action={updateTicket}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <select
                name="status"
                defaultValue={ticket.status}
                className="w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-ink-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-cyber-500/50"
              >
                <option value="OPEN">Abierto</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="RESOLVED">Resuelto</option>
                <option value="CLOSED">Cerrado</option>
              </select>
              <button
                type="submit"
                className="w-full bg-plasma-500 hover:bg-plasma-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Actualizar estado
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
