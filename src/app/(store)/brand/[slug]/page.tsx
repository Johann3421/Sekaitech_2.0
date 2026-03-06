import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createMetadata } from "@/lib/seo"
import { ProductGrid } from "@/components/store/ProductGrid"
import { ChevronRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
  })
  if (!brand)
    return { title: "Marca no encontrada | Hyper-Logic" }

  return createMetadata({
    title: brand.name,
    description: `Productos ${brand.name} en Hyper-Logic. Encuentra los mejores componentes y periféricos con envío a todo el Perú.`,
    path: `/brand/${brand.slug}`,
    image: brand.logo ?? undefined,
  })
}

export default async function BrandPage({
  params,
}: {
  params: { slug: string }
}) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
  })

  if (!brand) notFound()

  const products = await prisma.product.findMany({
    where: { brandId: brand.id, published: true },
    orderBy: { createdAt: "desc" },
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
    brand: { name: brand.name },
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
        <Link
          href="/products"
          className="hover:text-cyber-400 transition-colors"
        >
          Productos
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">{brand.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {brand.logo && (
          <div className="relative w-14 h-14 flex-shrink-0 bg-void-800 border border-void-500 rounded-xl p-2">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              className="object-contain p-1"
            />
          </div>
        )}
        <div>
          <h1 className="font-display font-bold text-3xl text-ink-primary">
            {brand.name}
          </h1>
          {brand.country && (
            <p className="text-ink-secondary text-sm mt-1">
              Origen: {brand.country}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm font-mono text-ink-tertiary mb-6">
        {gridProducts.length} producto{gridProducts.length !== 1 ? "s" : ""}
      </p>

      <ProductGrid products={gridProducts} />
    </div>
  )
}
