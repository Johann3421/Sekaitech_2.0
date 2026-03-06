import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TopProduct {
  id: string
  name: string
  slug: string
  totalSold: number
  revenue: number
  image?: string | null
}

interface TopProductsTableProps {
  products: TopProduct[]
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-void-700">
            <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              #
            </th>
            <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Producto
            </th>
            <th className="text-right py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Vendidos
            </th>
            <th className="text-right py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
              Ingresos
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product.id}
              className={cn(
                'border-b border-void-800 transition-colors hover:bg-void-800/80',
                index % 2 === 0 ? 'bg-void-800/50' : 'bg-transparent'
              )}
            >
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold',
                    index === 0 && 'bg-amber-500/20 text-amber-400',
                    index === 1 && 'bg-ink-secondary/20 text-ink-secondary',
                    index === 2 && 'bg-amber-500/10 text-amber-500/60',
                    index > 2 && 'text-ink-tertiary'
                  )}
                >
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-4">
                <Link
                  href={`/admin/products/${product.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-void-700 border border-void-600 overflow-hidden shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-ink-tertiary">N/A</span>
                      </div>
                    )}
                  </div>
                  <span className="font-sans text-ink-primary group-hover:text-cyber-400 transition-colors line-clamp-1">
                    {product.name}
                  </span>
                </Link>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono text-ink-secondary tabular-nums">
                  {product.totalSold.toLocaleString()}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono font-bold text-cyber-400 tabular-nums">
                  ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-ink-tertiary text-sm">
                No hay productos con ventas aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
