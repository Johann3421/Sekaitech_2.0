import { prisma } from "@/lib/prisma"
import { SalesChart } from "@/components/admin/SalesChart"
import { TopProductsTable } from "@/components/admin/TopProductsTable"
import Link from "next/link"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  MessageSquare,
} from "lucide-react"

export const dynamic = "force-dynamic"

async function getDashboardData() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalProducts,
    totalOrders,
    currentPeriodOrders,
    previousPeriodOrders,
    activeCustomers,
    previousCustomers,
    recentOrders,
    openTickets,
    pendingOrders,
    lowStockProducts,
    ordersByDay,
    topProductsRaw,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { totalUSD: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      select: { totalUSD: true },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER", orders: { some: {} } },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        orders: { some: {} },
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { stock: { lt: 5 }, published: true } }),
    prisma.order.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalUSD: true },
      _count: true,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, priceUSD: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ])

  // Aggregate sales by day
  const salesByDayMap = new Map<string, { total: number; orders: number }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(5, 10) // MM-DD
    salesByDayMap.set(key, { total: 0, orders: 0 })
  }
  for (const row of ordersByDay) {
    const key = new Date(row.createdAt).toISOString().slice(5, 10)
    const existing = salesByDayMap.get(key)
    if (existing) {
      existing.total += Number(row._sum.totalUSD ?? 0)
      existing.orders += row._count
    }
  }
  const salesData = Array.from(salesByDayMap.entries()).map(([date, v]) => ({
    date,
    total: Math.round(v.total * 100) / 100,
    orders: v.orders,
  }))

  // Revenue calculation
  const currentRevenue = currentPeriodOrders.reduce(
    (acc, o) => acc + Number(o.totalUSD),
    0
  )
  const previousRevenue = previousPeriodOrders.reduce(
    (acc, o) => acc + Number(o.totalUSD),
    0
  )

  // Top products with details
  const topProductIds = topProductsRaw.map((r) => r.productId)
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, slug: true, images: { take: 1, select: { url: true } } },
  })
  const topProducts = topProductsRaw.map((raw) => {
    const detail = topProductDetails.find((p) => p.id === raw.productId)
    return {
      id: raw.productId,
      name: detail?.name ?? "Producto eliminado",
      slug: detail?.slug ?? "",
      totalSold: raw._sum.quantity ?? 0,
      revenue: Number(raw._sum.priceUSD ?? 0),
      image: detail?.images[0]?.url ?? null,
    }
  })

  return {
    totalProducts,
    totalOrders,
    currentRevenue,
    previousRevenue,
    activeCustomers,
    previousCustomers,
    recentOrders,
    openTickets,
    pendingOrders,
    lowStockProducts,
    salesData,
    topProducts,
  }
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%"
  const pct = ((current - previous) / previous) * 100
  const sign = pct >= 0 ? "+" : ""
  return `${sign}${pct.toFixed(1)}%`
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      label: "Total Productos",
      value: data.totalProducts.toLocaleString(),
      icon: Package,
      color: "cyber",
      change: null,
    },
    {
      label: "Total Pedidos",
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "plasma",
      change: pctChange(
        data.currentRevenue > 0 ? data.totalOrders : 0,
        data.previousRevenue > 0 ? data.totalOrders : 0
      ),
    },
    {
      label: "Revenue (USD)",
      value: `$${data.currentRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "volt",
      change: pctChange(data.currentRevenue, data.previousRevenue),
    },
    {
      label: "Clientes Activos",
      value: data.activeCustomers.toLocaleString(),
      icon: Users,
      color: "amber",
      change: pctChange(data.activeCustomers, data.previousCustomers),
    },
  ]

  const iconColor: Record<string, string> = {
    cyber: "text-cyber-400 bg-cyber-500/15",
    plasma: "text-plasma-400 bg-plasma-500/15",
    volt: "text-volt-400 bg-volt-500/15",
    amber: "text-amber-400 bg-amber-500/15",
  }

  const changeColor = (change: string | null) => {
    if (!change) return "text-ink-tertiary"
    return change.startsWith("+") ? "text-volt-400" : "text-danger-400"
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Dashboard
        </h1>
        <p className="text-sm text-ink-tertiary font-sans mt-1">
          Resumen general de tu tienda
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-void-900/80 border border-void-700/50 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor[stat.color]}`}
                >
                  <Icon size={20} />
                </div>
                {stat.change && (
                  <span
                    className={`text-xs font-mono ${changeColor(stat.change)}`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="font-mono font-bold text-2xl text-ink-primary tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-ink-tertiary font-sans mt-1">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyber-500/15 flex items-center justify-center">
            <MessageSquare size={18} className="text-cyber-400" />
          </div>
          <div>
            <p className="font-mono font-bold text-lg text-ink-primary tabular-nums">
              {data.openTickets}
            </p>
            <p className="text-xs text-ink-tertiary font-sans">
              Tickets abiertos
            </p>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Clock size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="font-mono font-bold text-lg text-ink-primary tabular-nums">
              {data.pendingOrders}
            </p>
            <p className="text-xs text-ink-tertiary font-sans">
              Pedidos pendientes
            </p>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-danger-500/15 flex items-center justify-center">
            <AlertTriangle size={18} className="text-danger-400" />
          </div>
          <div>
            <p className="font-mono font-bold text-lg text-ink-primary tabular-nums">
              {data.lowStockProducts}
            </p>
            <p className="text-xs text-ink-tertiary font-sans">Stock bajo</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-void-900/80 border border-void-700/50 rounded-xl p-5">
          <h2 className="font-display font-bold text-sm text-ink-primary mb-4">
            Ventas — Últimos 30 días
          </h2>
          <SalesChart data={data.salesData} />
        </div>

        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-5">
          <h2 className="font-display font-bold text-sm text-ink-primary mb-4">
            Top Productos
          </h2>
          <TopProductsTable products={data.topProducts} />
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-sm text-ink-primary">
            Pedidos Recientes
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-cyber-400 hover:text-cyber-300 font-sans transition-colors"
          >
            Ver todos →
          </Link>
        </div>
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
                <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Total
                </th>
                <th className="text-right py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order, idx) => {
                const statusColors: Record<string, string> = {
                  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                  CONFIRMED: "bg-cyber-500/15 text-cyber-400 border-cyber-500/30",
                  PROCESSING: "bg-cyber-500/15 text-cyber-300 border-cyber-500/30",
                  SHIPPED: "bg-plasma-500/15 text-plasma-400 border-plasma-500/30",
                  DELIVERED: "bg-volt-500/15 text-volt-400 border-volt-500/30",
                  CANCELLED: "bg-danger-500/15 text-danger-400 border-danger-500/30",
                  REFUNDED: "bg-void-700 text-ink-secondary border-void-500",
                }
                const statusLabels: Record<string, string> = {
                  PENDING: "Pendiente",
                  CONFIRMED: "Confirmado",
                  PROCESSING: "Procesando",
                  SHIPPED: "Enviado",
                  DELIVERED: "Entregado",
                  CANCELLED: "Cancelado",
                  REFUNDED: "Reembolsado",
                }
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-void-800 transition-colors hover:bg-void-800/80 ${
                      idx % 2 === 0 ? "bg-void-800/50" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-cyber-400 hover:text-cyber-300 text-xs"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-ink-primary font-sans text-sm">
                      {order.user?.name ?? order.user?.email ?? "Invitado"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-full border inline-flex items-center ${
                          statusColors[order.status] ?? ""
                        }`}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-ink-primary tabular-nums">
                      ${Number(order.totalUSD).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-ink-tertiary text-xs tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                  </tr>
                )
              })}
              {data.recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-ink-tertiary text-sm"
                  >
                    No hay pedidos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
