import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { ChevronRight, MessageSquare, Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, body: true, isStaff: true },
      },
    },
  })

  const statusLabels: Record<string, string> = {
    OPEN: "Abierto",
    IN_PROGRESS: "En progreso",
    WAITING_CUSTOMER: "Esperando respuesta",
    RESOLVED: "Resuelto",
    CLOSED: "Cerrado",
  }

  const categoryLabels: Record<string, string> = {
    ORDER: "Pedido",
    WARRANTY: "Garantía",
    TECHNICAL: "Soporte Técnico",
    BILLING: "Facturación",
    GENERAL: "General",
  }

  const statusVariant = (s: string) => {
    if (["RESOLVED", "CLOSED"].includes(s)) return "compatible" as const
    if (s === "WAITING_CUSTOMER") return "warning" as const
    if (s === "IN_PROGRESS") return "premium" as const
    return "default" as const
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6">
        <Link href="/account" className="hover:text-cyber-400 transition-colors">
          Mi Cuenta
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">Tickets</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-ink-primary">
          Mis Tickets
        </h1>
        <Link
          href="/account/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl text-sm transition-all active:scale-95"
        >
          <Plus size={16} />
          Nuevo Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
            <MessageSquare size={28} className="text-ink-tertiary" />
          </div>
          <p className="text-ink-primary font-display font-semibold text-lg mb-2">
            No tienes tickets de soporte
          </p>
          <p className="text-ink-secondary text-sm mb-6">
            Si necesitas ayuda, crea un ticket y te responderemos pronto.
          </p>
          <Link
            href="/account/tickets/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all"
          >
            <Plus size={16} />
            Crear Ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const lastMessage = ticket.messages[0]

            return (
              <Link
                key={ticket.id}
                href={`/account/tickets/${ticket.id}`}
                className="flex flex-wrap items-center gap-4 p-5 bg-gradient-card border border-void-500 rounded-2xl hover:border-cyber-500/50 hover:shadow-cyber transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-plasma-400">
                      {ticket.ticketCode}
                    </span>
                    <Badge variant="default">
                      {categoryLabels[ticket.category] ?? ticket.category}
                    </Badge>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-ink-primary line-clamp-1">
                    {ticket.subject}
                  </h3>
                  {lastMessage && (
                    <p className="text-xs text-ink-tertiary mt-1 line-clamp-1">
                      {lastMessage.isStaff ? "Soporte: " : "Tú: "}
                      {lastMessage.body}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-mono text-ink-tertiary">
                    {new Date(ticket.updatedAt).toLocaleDateString("es-PE")}
                  </span>
                  <Badge variant={statusVariant(ticket.status)}>
                    {statusLabels[ticket.status] ?? ticket.status}
                  </Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
