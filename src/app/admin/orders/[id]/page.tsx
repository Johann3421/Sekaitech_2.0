import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendiente', color: 'amber', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'cyber', icon: CheckCircle },
  SHIPPED: { label: 'Enviado', color: 'plasma', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'volt', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'danger', icon: XCircle },
};

async function updateOrderStatus(formData: FormData) {
  'use server';
  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as string;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: { include: { product: { include: { images: true } } } },
    },
  });

  if (!order) notFound();

  const address = order.shippingAddress as any;
  const config = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-ink-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a pedidos
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">
            Pedido {order.orderNumber}
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 text-${config.color}-400`} />
          <Badge variant={config.color as any}>{config.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyber-400" />
              Productos ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-void-800/50"
                >
                  <div className="w-16 h-16 rounded-lg bg-void-700/50 overflow-hidden shrink-0">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-100 font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-ink-400 text-sm">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-ink-100 font-mono">
                      ${item.priceUSD.toFixed(2)}
                    </p>
                    <p className="text-ink-400 text-sm font-mono">
                      × {item.quantity} = ${(Number(item.priceUSD) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-void-700/50 space-y-2">
              <div className="flex justify-between text-ink-300">
                <span>Subtotal</span>
                <span className="font-mono">${Number(order.totalUSD).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-300">
                <span>Envío</span>
                <span className="font-mono text-volt-400">Gratis</span>
              </div>
              <div className="flex justify-between text-ink-100 text-lg font-bold pt-2 border-t border-void-700/30">
                <span>Total</span>
                <span className="font-mono text-cyber-400">
                  ${Number(order.totalUSD).toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between text-ink-400 text-sm">
                <span />
                <span className="font-mono">
                  S/ {Number(order.totalPEN).toFixed(2)} PEN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <h3 className="font-display font-semibold text-ink-100 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-cyber-400" />
              Cliente
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-ink-200">{order.user?.name || 'Invitado'}</p>
              <p className="text-ink-400">{order.user?.email || '-'}</p>
            </div>
          </div>

          {/* Shipping Address */}
          {address && (
            <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
              <h3 className="font-display font-semibold text-ink-100 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyber-400" />
                Dirección de envío
              </h3>
              <div className="space-y-1 text-sm text-ink-300">
                <p>{address.firstName} {address.lastName}</p>
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>
                  {address.district}, {address.province}
                </p>
                <p>{address.department}</p>
                <p className="text-ink-400">{address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <h3 className="font-display font-semibold text-ink-100 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyber-400" />
              Pago
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-400">Método</span>
                <span className="text-ink-200 capitalize">{order.payMethod || 'Pendiente'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Moneda</span>
                <span className="text-ink-200">{order.currency}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6">
            <h3 className="font-display font-semibold text-ink-100 mb-3">
              Actualizar estado
            </h3>
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-ink-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-cyber-500/50"
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              <button
                type="submit"
                className="w-full bg-cyber-500 hover:bg-cyber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Actualizar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
