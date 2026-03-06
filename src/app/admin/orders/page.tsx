import { prisma } from "@/lib/prisma"
import { OrdersTable } from "@/components/admin/OrdersTable"
import { Search, ShoppingCart, Clock, Truck, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

interface SearchParams {
  search?: string
  status?: string
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const search = searchParams.search ?? ""
  const statusFilter = searchParams.status ?? ""

  const where: Record<string, unknown> = {}
  if (search) {
    where.orderNumber = { contains: search, mode: "insensitive" }
  }
  if (statusFilter) {
    where.status = statusFilter
  }

  const [orders, totalCount, pendingCount, shippedCount, deliveredCount] =
    await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
    ])

  // Transform for the OrdersTable component (serialize dates + decimals)
  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status as
      | "PENDING"
      | "CONFIRMED"
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED"
      | "REFUNDED",
    totalUSD: Number(o.totalUSD),
    totalPEN: Number(o.totalPEN),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      priceUSD: Number(item.priceUSD),
      product: { name: item.product.name },
    })),
    user: o.user
      ? { name: o.user.name, email: o.user.email }
      : null,
  }))

  const summaryCards = [
    {
      label: "Total Pedidos",
      value: totalCount,
      icon: ShoppingCart,
      color: "text-cyber-400 bg-cyber-500/15",
    },
    {
      label: "Pendientes",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-400 bg-amber-500/15",
    },
    {
      label: "Enviados",
      value: shippedCount,
      icon: Truck,
      color: "text-plasma-400 bg-plasma-500/15",
    },
    {
      label: "Entregados",
      value: deliveredCount,
      icon: CheckCircle2,
      color: "text-volt-400 bg-volt-500/15",
    },
  ]

  const statuses = [
    { value: "", label: "Todos" },
    { value: "PENDING", label: "Pendiente" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "PROCESSING", label: "Procesando" },
    { value: "SHIPPED", label: "Enviado" },
    { value: "DELIVERED", label: "Entregado" },
    { value: "CANCELLED", label: "Cancelado" },
    { value: "REFUNDED", label: "Reembolsado" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Pedidos
        </h1>
        <p className="text-sm text-ink-tertiary font-sans mt-1">
          Gestión de pedidos
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-void-900/80 border border-void-700/50 rounded-xl p-4 flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="font-mono font-bold text-lg text-ink-primary tabular-nums">
                  {card.value}
                </p>
                <p className="text-xs text-ink-tertiary font-sans">
                  {card.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4">
        <form
          method="GET"
          action="/admin/orders"
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-ink-tertiary font-sans mb-1.5">
              Buscar por N° de pedido
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
              />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="ORD-XXXXX..."
                className="w-full pl-9 pr-3 py-2 bg-void-800 border border-void-700 rounded-lg text-sm text-ink-primary font-sans placeholder:text-ink-tertiary focus:outline-none focus:border-cyber-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs text-ink-tertiary font-sans mb-1.5">
              Estado
            </label>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full px-3 py-2 bg-void-800 border border-void-700 rounded-lg text-sm text-ink-primary font-sans focus:outline-none focus:border-cyber-500/50 transition-colors"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-void-700 hover:bg-void-600 text-ink-primary text-sm font-sans transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Orders table */}
      <div className="bg-void-900/80 border border-void-700/50 rounded-xl overflow-hidden">
        <OrdersTable orders={serializedOrders} />
        {serializedOrders.length === 0 && (
          <div className="py-12 text-center text-ink-tertiary text-sm">
            <ShoppingCart
              size={32}
              className="mx-auto mb-2 text-ink-tertiary/50"
            />
            No se encontraron pedidos.
          </div>
        )}
      </div>
    </div>
  )
}
