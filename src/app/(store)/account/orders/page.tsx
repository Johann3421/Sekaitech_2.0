import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { ChevronRight, Package, ChevronDown } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
        },
      },
    },
  })

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "En proceso",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  }

  const payStatusLabels: Record<string, string> = {
    UNPAID: "No pagado",
    PAID: "Pagado",
    PARTIALLY_PAID: "Pago parcial",
    REFUNDED: "Reembolsado",
  }

  const statusVariant = (s: string) => {
    if (s === "DELIVERED" || s === "PAID") return "compatible" as const
    if (s === "CANCELLED" || s === "REFUNDED") return "incompatible" as const
    if (s === "SHIPPED" || s === "PROCESSING") return "premium" as const
    return "warning" as const
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6">
        <Link href="/account" className="hover:text-cyber-400 transition-colors">
          Mi Cuenta
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">Pedidos</span>
      </nav>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-8">
        Mis Pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
            <Package size={28} className="text-ink-tertiary" />
          </div>
          <p className="text-ink-primary font-display font-semibold text-lg mb-2">
            No tienes pedidos todavía
          </p>
          <p className="text-ink-secondary text-sm mb-6">
            Cuando realices una compra, aparecerá aquí.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all"
          >
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <details
              key={order.id}
              className="group bg-gradient-card border border-void-500 rounded-2xl overflow-hidden"
            >
              <summary className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-void-800/50 transition-colors list-none">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm text-cyber-400 font-semibold">
                    {order.orderNumber}
                  </span>
                  <p className="text-xs text-ink-tertiary mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant={statusVariant(order.status)}>
                    {statusLabels[order.status] ?? order.status}
                  </Badge>
                  <Badge variant={statusVariant(order.payStatus)}>
                    {payStatusLabels[order.payStatus] ?? order.payStatus}
                  </Badge>
                  <span className="font-mono text-sm text-ink-primary font-semibold">
                    ${Number(order.totalUSD).toFixed(2)} USD
                  </span>
                </div>

                <ChevronDown
                  size={18}
                  className="text-ink-tertiary group-open:rotate-180 transition-transform"
                />
              </summary>

              <div className="border-t border-void-600 px-5 py-4 space-y-3">
                {/* Order items */}
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-10 h-10 rounded-lg bg-void-800 border border-void-600 overflow-hidden relative flex-shrink-0">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-ink-primary hover:text-cyber-400 transition-colors truncate block"
                      >
                        {item.product.name}
                      </Link>
                    </div>
                    <span className="font-mono text-xs text-ink-tertiary">
                      x{item.quantity}
                    </span>
                    <span className="font-mono text-sm text-ink-primary">
                      ${Number(item.priceUSD).toFixed(2)}
                    </span>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t border-void-700/50 pt-3 flex justify-between text-sm">
                  <span className="text-ink-secondary">Total</span>
                  <span className="font-mono font-bold text-cyber-400">
                    ${Number(order.totalUSD).toFixed(2)} USD / S/{" "}
                    {Number(order.totalPEN).toFixed(2)}
                  </span>
                </div>

                {order.notes && (
                  <p className="text-xs text-ink-tertiary italic">
                    Nota: {order.notes}
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
