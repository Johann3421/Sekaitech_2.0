import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import {
  Package,
  MessageSquare,
  Heart,
  ChevronRight,
  User,
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const [user, recentOrders, recentTickets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalUSD: true,
        createdAt: true,
      },
    }),
    prisma.ticket.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        ticketCode: true,
        subject: true,
        status: true,
        updatedAt: true,
      },
    }),
  ])

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "En proceso",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  }

  const ticketStatusLabels: Record<string, string> = {
    OPEN: "Abierto",
    IN_PROGRESS: "En progreso",
    WAITING_CUSTOMER: "Esperando respuesta",
    RESOLVED: "Resuelto",
    CLOSED: "Cerrado",
  }

  const statusVariant = (s: string) => {
    if (["DELIVERED", "RESOLVED", "CLOSED"].includes(s)) return "compatible" as const
    if (["CANCELLED", "REFUNDED"].includes(s)) return "incompatible" as const
    if (["SHIPPED", "IN_PROGRESS"].includes(s)) return "premium" as const
    return "warning" as const
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Welcome */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
          <User size={24} className="text-ink-tertiary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Hola, {user?.name ?? "Usuario"} 👋
          </h1>
          <p className="text-sm text-ink-tertiary font-mono">{user?.email}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/account/orders", icon: Package, label: "Mis Pedidos", color: "text-cyber-400" },
          { href: "/account/tickets", icon: MessageSquare, label: "Soporte", color: "text-plasma-400" },
          { href: "/account/wishlist", icon: Heart, label: "Mi Wishlist", color: "text-danger-400" },
        ].map((link: any) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 p-4 bg-gradient-card border border-void-500 rounded-2xl hover:border-cyber-500/50 hover:shadow-cyber transition-all group"
          >
            <link.icon size={20} className={link.color} />
            <span className="font-display font-semibold text-sm text-ink-primary group-hover:text-cyber-400 transition-colors">
              {link.label}
            </span>
            <ChevronRight
              size={16}
              className="ml-auto text-ink-tertiary group-hover:text-cyber-400 transition-colors"
            />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <section className="bg-gradient-card border border-void-500 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-void-800 border-b border-void-600">
            <h2 className="font-display font-bold text-sm text-ink-primary">
              Pedidos Recientes
            </h2>
            <Link
              href="/account/orders"
              className="text-xs text-cyber-400 hover:text-cyber-300 font-mono transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-tertiary">
              No tienes pedidos aún.
            </div>
          ) : (
            <div className="divide-y divide-void-700/50">
              {recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href="/account/orders"
                  className="flex items-center justify-between px-5 py-3 hover:bg-void-800/50 transition-colors"
                >
                  <div>
                    <span className="font-mono text-xs text-cyber-400">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-ink-tertiary mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-ink-primary">
                      ${Number(order.totalUSD).toFixed(2)}
                    </span>
                    <Badge variant={statusVariant(order.status)}>
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Tickets */}
        <section className="bg-gradient-card border border-void-500 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-void-800 border-b border-void-600">
            <h2 className="font-display font-bold text-sm text-ink-primary">
              Tickets de Soporte
            </h2>
            <Link
              href="/account/tickets"
              className="text-xs text-cyber-400 hover:text-cyber-300 font-mono transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-tertiary">
              No tienes tickets de soporte.
            </div>
          ) : (
            <div className="divide-y divide-void-700/50">
              {recentTickets.map((ticket: any) => (
                <Link
                  key={ticket.id}
                  href={`/account/tickets/${ticket.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-void-800/50 transition-colors"
                >
                  <div>
                    <span className="font-mono text-xs text-plasma-400">
                      {ticket.ticketCode}
                    </span>
                    <p className="text-xs text-ink-primary mt-0.5 line-clamp-1">
                      {ticket.subject}
                    </p>
                  </div>
                  <Badge variant={statusVariant(ticket.status)}>
                    {ticketStatusLabels[ticket.status] ?? ticket.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
