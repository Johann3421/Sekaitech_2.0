import { prisma } from '@/lib/prisma';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    monthlyOrders,
    topCategories,
    topProducts,
    ordersByStatus,
    revenueByMonth,
  ] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, priceUSD: true },
      orderBy: { _sum: { priceUSD: 'desc' } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { totalUSD: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalUSD: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Fetch product names for top products
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, slug: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const totalRevenue = ordersByStatus.reduce(
    (sum, s) => sum + Number(s._sum.totalUSD || 0),
    0
  );
  const totalOrders = ordersByStatus.reduce(
    (sum, s) => sum + s._count.id,
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-100">
          Reportes
        </h1>
        <p className="text-ink-400 text-sm mt-1">
          Análisis de ventas y rendimiento
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyber-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-cyber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">
                ${totalRevenue.toFixed(0)}
              </p>
              <p className="text-ink-400 text-xs">Ingresos totales</p>
            </div>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-plasma-500/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-plasma-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">{totalOrders}</p>
              <p className="text-ink-400 text-xs">Pedidos totales</p>
            </div>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-volt-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-volt-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">
                ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : '0'}
              </p>
              <p className="text-ink-400 text-xs">Ticket promedio</p>
            </div>
          </div>
        </div>
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-100 font-mono">{monthlyOrders}</p>
              <p className="text-ink-400 text-xs">Pedidos (30 días)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyber-400" />
            Pedidos por estado
          </h2>
          <div className="space-y-3">
            {ordersByStatus.map((status) => {
              const percentage = totalOrders > 0 ? (status._count.id / totalOrders) * 100 : 0;
              const colors: Record<string, string> = {
                PENDING: 'bg-amber-500',
                CONFIRMED: 'bg-cyber-500',
                SHIPPED: 'bg-plasma-500',
                DELIVERED: 'bg-volt-500',
                CANCELLED: 'bg-danger-500',
              };
              const labels: Record<string, string> = {
                PENDING: 'Pendiente',
                CONFIRMED: 'Confirmado',
                SHIPPED: 'Enviado',
                DELIVERED: 'Entregado',
                CANCELLED: 'Cancelado',
              };
              return (
                <div key={status.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-300">{labels[status.status] || status.status}</span>
                    <span className="text-ink-400 font-mono">
                      {status._count.id} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-void-800">
                    <div
                      className={`h-full rounded-full ${colors[status.status] || 'bg-ink-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyber-400" />
            Top 10 Productos (por ingresos)
          </h2>
          <div className="space-y-3">
            {topProducts.map((item, i) => {
              const product = productMap.get(item.productId);
              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-void-800/50 transition-colors"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? 'bg-amber-500/20 text-amber-400'
                        : i === 1
                        ? 'bg-ink-400/20 text-ink-300'
                        : i === 2
                        ? 'bg-amber-700/20 text-amber-600'
                        : 'bg-void-800 text-ink-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-200 text-sm truncate">
                      {product?.name || 'Producto eliminado'}
                    </p>
                    <p className="text-ink-500 text-xs">
                      {item._sum.quantity} unidades
                    </p>
                  </div>
                  <span className="text-ink-200 font-mono text-sm">
                    ${Number(item._sum.priceUSD || 0).toFixed(0)}
                  </span>
                </div>
              );
            })}
            {topProducts.length === 0 && (
              <p className="text-ink-500 text-sm text-center py-4">
                Sin datos de ventas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
