import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createMetadata } from "@/lib/seo"
import { ProductGrid } from "@/components/store/ProductGrid"
import { ChevronRight, Tag } from "lucide-react"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createMetadata({
  title: "Ofertas",
  description:
    "Encuentra los mejores descuentos en componentes de PC, periféricos y más. Aprovecha nuestras ofertas por tiempo limitado.",
  path: "/offers",
})

export default async function OffersPage() {
  const products = await prisma.product.findMany({
    where: {
      published: true,
      comparePriceUSD: { not: null },
    },
    orderBy: { comparePriceUSD: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      brand: true,
      category: true,
    },
  })

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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6">
        <Link href="/" className="hover:text-cyber-400 transition-colors">
          Inicio
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">Ofertas</span>
      </nav>

      <div className="flex items-center gap-3 mb-8">
        <Tag size={28} className="text-cyber-400" />
        <h1 className="font-display font-bold text-3xl text-ink-primary">
          Ofertas
        </h1>
      </div>

      {gridProducts.length > 0 ? (
        <>
          <p className="text-sm text-ink-secondary font-mono mb-6">
            {gridProducts.length} producto{gridProducts.length !== 1 ? "s" : ""} en oferta
          </p>
          <ProductGrid products={gridProducts} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Tag size={48} className="text-ink-600 mb-4" />
          <p className="text-ink-400 text-lg">No hay ofertas activas en este momento.</p>
          <Link
            href="/products"
            className="mt-6 px-6 py-2 bg-cyber-500 text-void-900 font-semibold rounded hover:bg-cyber-400 transition-colors"
          >
            Ver catálogo completo
          </Link>
        </div>
      )}
    </div>
  )
}
