import { Metadata } from "next"
import { notFound } from "next/navigation"
import nextDynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PriceDisplay } from "@/components/ui/PriceDisplay"
import { Badge } from "@/components/ui/Badge"
import { SpecsTable } from "@/components/store/SpecsTable"
import { WishlistButton } from "@/components/store/WishlistButton"
import { ReviewCard } from "@/components/store/ReviewCard"
import { ProductGrid } from "@/components/store/ProductGrid"
import { ChevronRight, ShoppingCart, Package, Shield, Truck } from "lucide-react"
import { AddToCartButton } from "./AddToCartButton"
import { ImageGallery } from "./ImageGallery"

const ProductViewer3D = nextDynamic(
  () =>
    import("@/components/three/ProductViewer3D").then(
      (m) => m.ProductViewer3D
    ),
  { ssr: false, loading: () => <div className="w-full h-80 bg-void-800 rounded-2xl animate-pulse" /> }
)

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { slug: true },
    })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  })

  if (!product) return { title: "Producto no encontrado | Hyper-Logic" }

  const priceFormatted = `S/ ${(Number(product.priceUSD) * 3.75).toFixed(2)}`
  const title = `Comprar ${product.name} en Perú - ${priceFormatted} - Hyper-Logic`
  const description =
    product.metaDesc ??
    product.shortDesc ??
    `${product.name} - ${product.category?.name ?? "Tecnología"} en Hyper-Logic. Envío a todo el Perú.`
  const image = product.images[0]?.url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { position: "asc" } },
      specs: { orderBy: { position: "asc" } },
      brand: true,
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  })

  if (!product) notFound()

  // Related products — same category, exclude self
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      published: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      brand: true,
      category: true,
    },
  })

  const settings = await prisma.globalSettings.findFirst({ where: { id: 1 } })
  const exchangeRate = settings ? Number(settings.exchangeRate) : 3.75
  const pricePEN = (Number(product.priceUSD) * exchangeRate).toFixed(2)

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const conditionLabel: Record<string, string> = {
    NEW: "Nuevo",
    REFURBISHED: "Reacondicionado",
    OPEN_BOX: "Open Box",
  }

  // JSON-LD schema.org Product
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc ?? product.description,
    image: product.images.map((img) => img.url),
    sku: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/products/${product.slug}`,
      priceCurrency: "PEN",
      price: pricePEN,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:
        product.condition === "NEW"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/RefurbishedCondition",
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  }

  const related = relatedProducts.map((p) => ({
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6 flex-wrap">
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
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-cyber-400 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-ink-primary truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left — Images */}
          <div className="space-y-4">
            <ImageGallery
              images={product.images.map((img) => ({
                id: img.id,
                url: img.url,
                alt: img.alt ?? product.name,
              }))}
            />

            {product.model3dUrl && (
              <div className="rounded-2xl border border-void-500 overflow-hidden">
                <div className="px-4 py-2 bg-void-800 border-b border-void-600">
                  <span className="font-mono text-xs text-plasma-400">
                    {"// VISTA 3D"}
                  </span>
                </div>
                <div className="h-80">
                  <ProductViewer3D model3dUrl={product.model3dUrl} />
                </div>
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <Link
                href={`/brand/${product.brand.slug}`}
                className="inline-flex items-center gap-2 text-xs font-mono text-ink-tertiary hover:text-cyber-400 transition-colors"
              >
                {product.brand.logo && (
                  <Image
                    src={product.brand.logo}
                    alt={product.brand.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                )}
                {product.brand.name}
              </Link>
            )}

            <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-primary leading-tight">
              {product.name}
            </h1>

            {/* Reviews summary */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(avgRating) ? "text-amber-400" : "text-void-600"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-mono text-sm text-ink-secondary">
                  {avgRating.toFixed(1)} ({product.reviews.length} reseña
                  {product.reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            {/* Price */}
            <PriceDisplay
              priceUSD={Number(product.priceUSD)}
              comparePriceUSD={
                product.comparePriceUSD
                  ? Number(product.comparePriceUSD)
                  : null
              }
              size="lg"
              showBoth
            />

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={product.stock > 0 ? "compatible" : "incompatible"}
              >
                <Package size={12} />
                {product.stock > 0
                  ? `${product.stock} en stock`
                  : "Sin stock"}
              </Badge>
              <Badge variant="default">
                <Shield size={12} />
                {conditionLabel[product.condition] ?? product.condition}
              </Badge>
              {product.warranty && (
                <Badge variant="default">
                  <Shield size={12} />
                  {product.warranty}
                </Badge>
              )}
            </div>

            {/* SKU */}
            <p className="font-mono text-xs text-ink-tertiary">
              SKU: {product.sku}
            </p>

            {/* Description */}
            <div className="prose prose-invert max-w-none text-sm text-ink-secondary leading-relaxed">
              {product.shortDesc && (
                <p className="text-ink-primary font-medium">
                  {product.shortDesc}
                </p>
              )}
              <p>{product.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <AddToCartButton
                product={{
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  priceUSD: Number(product.priceUSD),
                  imageUrl: product.images[0]?.url,
                  stock: product.stock,
                  sku: product.sku,
                }}
              />
              <WishlistButton productId={product.id} />
            </div>

            {/* Shipping info */}
            <div className="flex items-center gap-2 p-4 bg-void-800 border border-void-600 rounded-xl">
              <Truck size={18} className="text-cyber-400 flex-shrink-0" />
              <p className="text-sm text-ink-secondary">
                <span className="text-ink-primary font-semibold">
                  Envío a todo el Perú.
                </span>{" "}
                Envío gratis en compras mayores a $299 USD.
              </p>
            </div>
          </div>
        </div>

        {/* Specs table */}
        {product.specs.length > 0 && (
          <div className="mt-12">
            <SpecsTable
              specs={product.specs.map((s) => ({
                key: s.key,
                value: s.value,
                unit: s.unit,
              }))}
            />
          </div>
        )}

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-bold text-xl text-ink-primary mb-6">
              Reseñas de Clientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={{
                    id: review.id,
                    rating: review.rating,
                    title: review.title,
                    body: review.body,
                    userName: review.user?.name ?? "Anónimo",
                    verified: review.verified,
                    createdAt: review.createdAt.toISOString(),
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display font-bold text-xl text-ink-primary mb-6">
              Productos Relacionados
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </>
  )
}
