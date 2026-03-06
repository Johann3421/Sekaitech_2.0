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
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  })
  if (!category)
    return { title: "Categoría no encontrada | Hyper-Logic" }

  return createMetadata({
    title: category.name,
    description:
      category.description ??
      `Explora productos de ${category.name} en Hyper-Logic. Los mejores precios con envío a todo el Perú.`,
    path: `/category/${category.slug}`,
    image: category.image ?? undefined,
  })
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  })

  if (!category) notFound()

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, published: true },
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
    brand: p.brand ? { name: p.brand.name } : null,
    category: { name: category.name },
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
        <span className="text-ink-primary">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {category.image && (
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h1 className="font-display font-bold text-3xl text-ink-primary">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-ink-secondary text-sm mt-1">
              {category.description}
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
