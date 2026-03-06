import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/components/store/ProductGrid"
import { Search as SearchIcon } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q?.trim() ?? ""

  const products = query
    ? await prisma.product.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 48,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          brand: true,
          category: true,
        },
      })
    : []

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <span className="font-mono text-xs text-plasma-400 block mb-1">
          {"// RESULTADOS DE BÚSQUEDA"}
        </span>
        <h1 className="font-display font-bold text-3xl text-ink-primary">
          {query ? (
            <>
              Resultados para{" "}
              <span className="text-cyber-400">&quot;{query}&quot;</span>
            </>
          ) : (
            "Búsqueda"
          )}
        </h1>
        {query && (
          <p className="text-sm text-ink-secondary font-mono mt-2">
            {gridProducts.length} resultado{gridProducts.length !== 1 ? "s" : ""}{" "}
            encontrado{gridProducts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {!query ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
            <SearchIcon size={28} className="text-ink-tertiary" />
          </div>
          <p className="text-ink-secondary text-sm">
            Ingresa un término de búsqueda para encontrar productos.
          </p>
        </div>
      ) : gridProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
            <SearchIcon size={28} className="text-ink-tertiary" />
          </div>
          <p className="text-ink-primary font-display font-semibold text-lg mb-2">
            No se encontraron resultados
          </p>
          <p className="text-ink-secondary text-sm mb-6 max-w-md mx-auto">
            Intenta con términos más generales o explora nuestro catálogo
            completo.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all"
          >
            Ver Catálogo
          </Link>
        </div>
      ) : (
        <ProductGrid products={gridProducts} />
      )}
    </div>
  )
}
