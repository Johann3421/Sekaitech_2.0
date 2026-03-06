import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createMetadata } from "@/lib/seo"
import { ProductGrid } from "@/components/store/ProductGrid"
import { FilterSidebar } from "@/components/store/FilterSidebar"
import { ChevronRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createMetadata({
  title: "Catálogo de Productos",
  description:
    "Explora nuestro catálogo completo de componentes de PC, periféricos y tecnología. Filtros por categoría, marca, precio y más.",
  path: "/products",
})

const PAGE_SIZE = 24

interface ProductsPageProps {
  searchParams: {
    page?: string
    category?: string
    brand?: string
    search?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    condition?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1)
  const categorySlugs = searchParams.category?.split(",").filter(Boolean) ?? []
  const brandSlugs = searchParams.brand?.split(",").filter(Boolean) ?? []
  const search = searchParams.search ?? ""
  const sort = searchParams.sort ?? "newest"
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined
  const inStock = searchParams.inStock === "true"
  const conditions = searchParams.condition?.split(",").filter(Boolean) ?? []

  // Build where clause
  const where: Record<string, unknown> = { published: true }

  if (categorySlugs.length > 0) {
    where.category = { slug: { in: categorySlugs } }
  }
  if (brandSlugs.length > 0) {
    where.brand = { slug: { in: brandSlugs } }
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.priceUSD = {}
    if (minPrice !== undefined) (where.priceUSD as Record<string, number>).gte = minPrice
    if (maxPrice !== undefined) (where.priceUSD as Record<string, number>).lte = maxPrice
  }
  if (inStock) {
    where.stock = { gt: 0 }
  }
  if (conditions.length > 0) {
    where.condition = { in: conditions }
  }

  // Build orderBy
  const orderByMap: Record<string, Record<string, string>> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    "price-asc": { priceUSD: "asc" },
    "price-desc": { priceUSD: "desc" },
    name: { name: "asc" },
    featured: { featured: "desc" },
  }
  const orderBy = orderByMap[sort] ?? orderByMap.newest

  const [products, totalCount, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: where as never,
      orderBy: orderBy as never,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        brand: true,
        category: true,
      },
    }),
    prisma.product.count({ where: where as never }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const gridProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    priceUSD: Number(p.priceUSD),
    comparePriceUSD: p.comparePriceUSD ? Number(p.comparePriceUSD) : null,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    brand: p.brand ? { name: p.brand.name } : null,
    category: p.category ? { name: p.category.name } : null,
    stock: p.stock,
    featured: p.featured,
  }))

  const filterCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    _count: c._count,
  }))

  const filterBrands = brands.map((b) => ({
    id: b.id,
    name: b.name,
  }))

  function buildPageUrl(p: number): string {
    const params = new URLSearchParams()
    if (p > 1) params.set("page", String(p))
    if (searchParams.category) params.set("category", searchParams.category)
    if (searchParams.brand) params.set("brand", searchParams.brand)
    if (searchParams.search) params.set("search", searchParams.search)
    if (searchParams.sort) params.set("sort", searchParams.sort)
    if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice)
    if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice)
    if (searchParams.inStock) params.set("inStock", searchParams.inStock)
    if (searchParams.condition) params.set("condition", searchParams.condition)
    const qs = params.toString()
    return `/products${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6">
        <Link href="/" className="hover:text-cyber-400 transition-colors">
          Inicio
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">Productos</span>
      </nav>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-8">
        Catálogo de Productos
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <FilterSidebar categories={filterCategories} brands={filterBrands} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Results count & sort */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-ink-secondary font-mono">
              {totalCount} producto{totalCount !== 1 ? "s" : ""} encontrado
              {totalCount !== 1 ? "s" : ""}
            </p>
          </div>

          <ProductGrid products={gridProducts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="px-4 py-2 bg-void-800 border border-void-500 hover:border-cyber-500/50 text-ink-secondary hover:text-ink-primary rounded-lg font-mono text-sm transition-all"
                >
                  ← Anterior
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 2 && p <= page + 2)
                )
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  const showEllipsis = prev !== undefined && p - prev > 1
                  return (
                    <span key={p} className="flex items-center gap-2">
                      {showEllipsis && (
                        <span className="text-ink-tertiary font-mono text-sm px-1">
                          …
                        </span>
                      )}
                      <Link
                        href={buildPageUrl(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-mono text-sm transition-all ${
                          p === page
                            ? "bg-cyber-500 text-void-950 font-bold"
                            : "bg-void-800 border border-void-500 text-ink-secondary hover:border-cyber-500/50 hover:text-ink-primary"
                        }`}
                      >
                        {p}
                      </Link>
                    </span>
                  )
                })}

              {page < totalPages && (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="px-4 py-2 bg-void-800 border border-void-500 hover:border-cyber-500/50 text-ink-secondary hover:text-ink-primary rounded-lg font-mono text-sm transition-all"
                >
                  Siguiente →
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
