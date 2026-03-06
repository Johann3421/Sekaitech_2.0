import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import {
  Plus,
  Search,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react"

export const dynamic = "force-dynamic"

interface SearchParams {
  page?: string
  search?: string
  category?: string
  brand?: string
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"))
  const perPage = 20
  const skip = (page - 1) * perPage
  const search = searchParams.search ?? ""
  const categorySlug = searchParams.category ?? ""
  const brandSlug = searchParams.brand ?? ""

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }
  if (categorySlug) {
    where.category = { slug: categorySlug }
  }
  if (brandSlug) {
    where.brand = { slug: brandSlug }
  }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ])

  const totalPages = Math.ceil(total / perPage)

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams()
    if (params.page && params.page !== "1") sp.set("page", params.page)
    if (params.search) sp.set("search", params.search)
    if (params.category) sp.set("category", params.category)
    if (params.brand) sp.set("brand", params.brand)
    const qs = sp.toString()
    return `/admin/products${qs ? `?${qs}` : ""}`
  }

  const conditionLabels: Record<string, string> = {
    NEW: "Nuevo",
    REFURBISHED: "Reacondicionado",
    OPEN_BOX: "Open Box",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Productos
          </h1>
          <p className="text-sm text-ink-tertiary font-sans mt-1">
            {total} producto{total !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyber-500 hover:bg-cyber-600 text-void-950 font-sans font-semibold text-sm transition-colors"
        >
          <Plus size={16} />
          Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-4">
        <form method="GET" action="/admin/products" className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-ink-tertiary font-sans mb-1.5">
              Buscar
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
                placeholder="Nombre o SKU..."
                className="w-full pl-9 pr-3 py-2 bg-void-800 border border-void-700 rounded-lg text-sm text-ink-primary font-sans placeholder:text-ink-tertiary focus:outline-none focus:border-cyber-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="min-w-[160px]">
            <label className="block text-xs text-ink-tertiary font-sans mb-1.5">
              Categoría
            </label>
            <select
              name="category"
              defaultValue={categorySlug}
              className="w-full px-3 py-2 bg-void-800 border border-void-700 rounded-lg text-sm text-ink-primary font-sans focus:outline-none focus:border-cyber-500/50 transition-colors"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand filter */}
          <div className="min-w-[160px]">
            <label className="block text-xs text-ink-tertiary font-sans mb-1.5">
              Marca
            </label>
            <select
              name="brand"
              defaultValue={brandSlug}
              className="w-full px-3 py-2 bg-void-800 border border-void-700 rounded-lg text-sm text-ink-primary font-sans focus:outline-none focus:border-cyber-500/50 transition-colors"
            >
              <option value="">Todas</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
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

      {/* Table */}
      <div className="bg-void-900/80 border border-void-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-void-700">
                <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Producto
                </th>
                <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  SKU
                </th>
                <th className="text-right py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Precio
                </th>
                <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Categoría
                </th>
                <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-center py-3 px-4 font-sans font-medium text-ink-tertiary text-xs uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => {
                const image = product.images[0]?.url
                const stockColor =
                  product.stock > 10
                    ? "text-volt-400"
                    : product.stock > 0
                    ? "text-amber-400"
                    : "text-danger-400"

                return (
                  <tr
                    key={product.id}
                    className={`border-b border-void-800 transition-colors hover:bg-void-800/80 ${
                      idx % 2 === 0 ? "bg-void-800/50" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-void-700 border border-void-600 overflow-hidden shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package
                                size={14}
                                className="text-ink-tertiary"
                              />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans text-ink-primary text-sm truncate max-w-[260px]">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-ink-tertiary font-sans">
                              {product.brand.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-ink-secondary">
                        {product.sku}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-ink-primary tabular-nums">
                        ${Number(product.priceUSD).toFixed(2)}
                      </span>
                      {product.comparePriceUSD && (
                        <span className="block font-mono text-xs text-ink-tertiary line-through tabular-nums">
                          ${Number(product.comparePriceUSD).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold tabular-nums ${stockColor}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-ink-secondary font-sans">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={product.published ? "compatible" : "default"}
                        >
                          {product.published ? "Publicado" : "Borrador"}
                        </Badge>
                        {product.condition !== "NEW" && (
                          <span className="text-[10px] font-mono text-ink-tertiary">
                            {conditionLabels[product.condition] ?? product.condition}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-void-700 transition-colors"
                          title="Ver en tienda"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg text-ink-tertiary hover:text-cyber-400 hover:bg-void-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-ink-tertiary text-sm"
                  >
                    <Package
                      size={32}
                      className="mx-auto mb-2 text-ink-tertiary/50"
                    />
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-void-700">
            <p className="text-xs text-ink-tertiary font-sans">
              Mostrando {skip + 1}–{Math.min(skip + perPage, total)} de {total}
            </p>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link
                  href={buildUrl({
                    page: String(page - 1),
                    search,
                    category: categorySlug,
                    brand: brandSlug,
                  })}
                  className="p-2 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-void-800 transition-colors"
                >
                  <ChevronLeft size={16} />
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (page <= 4) {
                  pageNum = i + 1
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = page - 3 + i
                }
                return (
                  <Link
                    key={pageNum}
                    href={buildUrl({
                      page: String(pageNum),
                      search,
                      category: categorySlug,
                      brand: brandSlug,
                    })}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-mono transition-colors ${
                      pageNum === page
                        ? "bg-cyber-500/15 text-cyber-400 border border-cyber-500/30"
                        : "text-ink-tertiary hover:text-ink-primary hover:bg-void-800"
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
              {page < totalPages && (
                <Link
                  href={buildUrl({
                    page: String(page + 1),
                    search,
                    category: categorySlug,
                    brand: brandSlug,
                  })}
                  className="p-2 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-void-800 transition-colors"
                >
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
