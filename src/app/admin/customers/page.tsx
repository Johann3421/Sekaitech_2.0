import { prisma } from '@/lib/prisma';
import { Users, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const perPage = 20;
  const search = searchParams.search || '';

  const where = search
    ? {
        role: 'CUSTOMER' as const,
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : { role: 'CUSTOMER' as const };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        orders: { select: { totalUSD: true } },
        _count: { select: { orders: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">
            Clientes
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {total} clientes registrados
          </p>
        </div>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            name="search"
            type="text"
            placeholder="Buscar por nombre o email..."
            defaultValue={search}
            className="w-full bg-void-900/80 border border-void-700/50 rounded-lg pl-10 pr-4 py-2.5 text-ink-200 text-sm placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-cyber-500/50"
          />
        </div>
      </form>

      {/* Table */}
      <div className="bg-void-900/80 border border-void-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-void-700/50">
                <th className="text-left px-6 py-4 text-xs font-medium text-ink-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-ink-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-center px-6 py-4 text-xs font-medium text-ink-400 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="text-center px-6 py-4 text-xs font-medium text-ink-400 uppercase tracking-wider">
                  Reseñas
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-ink-400 uppercase tracking-wider">
                  Total gastado
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-ink-400 uppercase tracking-wider">
                  Registro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-void-700/30">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum, o) => sum + Number(o.totalUSD),
                  0
                );
                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-void-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-500 to-plasma-500 flex items-center justify-center text-white text-xs font-bold">
                          {customer.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-ink-200 font-medium">
                          {customer.name || 'Sin nombre'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink-400 text-sm">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-center text-ink-200 font-mono text-sm">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 text-center text-ink-200 font-mono text-sm">
                      {customer._count.reviews}
                    </td>
                    <td className="px-6 py-4 text-right text-ink-200 font-mono text-sm">
                      ${totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-ink-400 text-sm">
                      {new Date(customer.createdAt).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-ink-600 mx-auto mb-2" />
                    <p className="text-ink-400">No se encontraron clientes</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-void-700/50">
            <p className="text-ink-400 text-sm">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/customers?page=${page - 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-void-800 border border-void-600 text-ink-300 text-sm hover:bg-void-700 transition-colors"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/customers?page=${page + 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-void-800 border border-void-600 text-ink-300 text-sm hover:bg-void-700 transition-colors"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
