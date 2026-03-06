import { Metadata } from "next"
import nextDynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { createMetadata } from "@/lib/seo"
import { HeroBanner } from "@/components/banners/HeroBanner"
import { CenterMobileBanner } from "@/components/banners/CenterMobileBanner"
import { ProductGrid } from "@/components/store/ProductGrid"

export const dynamic = 'force-dynamic'

const HeroScene = nextDynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-void-900 rounded-2xl animate-pulse" />
  ),
})

export const metadata: Metadata = createMetadata({
  title: "Componentes de PC & Tecnología Premium",
  description:
    "Tienda online de componentes de PC, periféricos y tecnología premium en Perú. Procesadores, tarjetas gráficas, RAM, almacenamiento y más con envío a todo el país.",
  path: "/",
})

export default async function HomePage() {
  const [heroBanners, centerBanner, featuredProducts, categories, settings] =
    await Promise.all([
      prisma.banner.findMany({
        where: { type: "HERO", active: true },
        orderBy: { position: "asc" },
      }),
      prisma.banner.findFirst({
        where: { type: "CENTER_MOBILE", active: true },
        orderBy: { position: "asc" },
      }),
      prisma.product.findMany({
        where: { featured: true, published: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          brand: true,
          category: true,
        },
      }),
      prisma.category.findMany({
        where: { active: true, parentId: null },
        orderBy: { position: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.globalSettings.findFirst({ where: { id: 1 } }),
    ])

  const products = featuredProducts.map((p) => ({
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
      {/* ========== HERO SECTION ========== */}
      <section className="relative bg-gradient-void overflow-hidden">
        {/* Animated scan-line overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        >
          <div className="absolute left-0 right-0 h-px bg-cyber-500/20 animate-scan-line" />
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left — 3-D scene */}
          <div className="hidden lg:block h-[420px] rounded-2xl overflow-hidden border border-void-600/40">
            <HeroScene />
          </div>

          {/* Right — copy */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-cyber-400 bg-cyber-glow/40 border border-cyber-500/30 px-3 py-1 rounded-full w-fit">
              {"// $ NUEVO STOCK DISPONIBLE"}
            </span>

            <h1 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight text-ink-primary">
              Componentes de PC
              <br />
              <span className="text-cyber-400">&amp;</span> Tecnología{" "}
              <span className="text-plasma-400">Premium</span>
            </h1>

            <p className="text-ink-secondary text-base md:text-lg max-w-md">
              Los mejores precios en hardware de última generación.{" "}
              <span className="text-cyber-400 font-semibold">
                Envío a todo el Perú
              </span>
              .
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all active:scale-95"
              >
                Explorar Catálogo
              </Link>
              <Link
                href="/pc-builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-void-800 border border-void-500 hover:border-plasma-500/50 text-ink-primary font-display font-semibold rounded-xl transition-all"
              >
                PC Builder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HERO BANNER CAROUSEL ========== */}
      {heroBanners.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 -mt-6 relative z-30">
          <HeroBanner banners={heroBanners} />
        </section>
      )}

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="font-mono text-xs text-plasma-400 mb-1 block">
              {"// DESTACADOS"}
            </span>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-ink-primary">
              Productos Destacados
            </h2>
          </div>
          <Link
            href="/products?sort=featured"
            className="text-sm font-display font-semibold text-cyber-400 hover:text-cyber-300 transition-colors hidden sm:inline-flex items-center gap-1"
          >
            Ver todos →
          </Link>
        </div>

        <ProductGrid products={products} />

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/products?sort=featured"
            className="text-sm font-display font-semibold text-cyber-400"
          >
            Ver todos los productos →
          </Link>
        </div>
      </section>

      {/* ========== CATEGORIES GRID ========== */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 lg:pb-24">
          <div className="mb-8 flex items-end justify-between gap-3">
            <span className="font-mono text-xs text-cyber-400 mb-1 block">
              {"// CATEGORÍAS"}
            </span>
            <div>
              <h2 className="font-display font-bold text-2xl lg:text-3xl text-ink-primary">
                Explora por Categoría
              </h2>
              <p className="text-ink-secondary text-sm mt-1">Hardware y tecnología organizados por tipo de producto.</p>
            </div>
            <Link
              href="/categories"
              className="hidden sm:inline-flex text-sm font-semibold text-cyber-500 hover:text-cyber-400"
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-void-700 bg-white shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="relative h-40 w-full bg-void-900">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-void" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display font-semibold text-white text-lg leading-tight">{cat.name}</h3>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-ink-secondary">{cat._count?.products ?? 0} productos</span>
                  <span className="text-sm font-semibold text-cyber-500 group-hover:text-cyber-400">Ver categoría →</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center sm:hidden">
            <Link href="/categories" className="text-sm font-semibold text-cyber-500 hover:text-cyber-400">
              Ver todas las categorías →
            </Link>
          </div>
        </section>
      )}

      {/* ========== CENTER MOBILE BANNER ========== */}
      {centerBanner && (
        <section className="mx-auto max-w-7xl px-4 pb-16 lg:pb-24">
          <CenterMobileBanner
            title={centerBanner.title}
            subtitle={centerBanner.subtitle}
            imageUrl={centerBanner.imageUrl}
            linkUrl={centerBanner.linkUrl}
            linkText={centerBanner.linkText}
            bgColor={centerBanner.bgColor}
          />
        </section>
      )}
    </>
  )
}
