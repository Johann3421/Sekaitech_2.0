import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/ProductForm"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Editar Producto — Admin SekaiTech",
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { position: "asc" } },
        specs: { orderBy: { position: "asc" } },
        compatibility: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ])

  if (!product) {
    notFound()
  }

  // Transform Prisma data → ProductForm initialData shape
  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDesc: product.shortDesc ?? "",
    priceUSD: Number(product.priceUSD),
    comparePriceUSD: product.comparePriceUSD
      ? Number(product.comparePriceUSD)
      : null,
    costUSD: product.costUSD ? Number(product.costUSD) : null,
    sku: product.sku,
    stock: product.stock,
    lowStockAlert: product.lowStockAlert,
    featured: product.featured,
    published: product.published,
    condition: product.condition as "NEW" | "REFURBISHED" | "OPEN_BOX",
    warranty: product.warranty ?? "",
    weight: product.weight ?? null,
    categoryId: product.categoryId,
    brandId: product.brandId ?? null,
    metaTitle: product.metaTitle ?? "",
    metaDesc: product.metaDesc ?? "",
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? "",
    })),
    specs: product.specs.map((s) => ({
      key: s.key,
      value: s.value,
    })),
    compatibility: product.compatibility
      ? {
          socket: product.compatibility.socket ?? undefined,
          tdpWatts: product.compatibility.tdpWatts ?? undefined,
          chipset: product.compatibility.chipset ?? undefined,
          memoryType: product.compatibility.memoryType ?? undefined,
          formFactor: product.compatibility.formFactor ?? undefined,
          ramType: product.compatibility.ramType ?? undefined,
          ramSpeedMHz: product.compatibility.ramSpeedMHz ?? undefined,
          ramCapacityGB: product.compatibility.ramCapacityGB ?? undefined,
          gpuTdpWatts: product.compatibility.gpuTdpWatts ?? undefined,
          pciInterface: product.compatibility.pciInterface ?? undefined,
          gpuLengthMM: product.compatibility.gpuLengthMM ?? undefined,
          psuWatts: product.compatibility.psuWatts ?? undefined,
          psuEfficiency: product.compatibility.psuEfficiency ?? undefined,
          storageInterface: product.compatibility.storageInterface ?? undefined,
          caseFormFactor: product.compatibility.caseFormFactor ?? undefined,
          coolerHeightMM: product.compatibility.coolerHeightMM ?? undefined,
        }
      : undefined,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Editar Producto
        </h1>
        <p className="text-sm text-ink-tertiary font-sans mt-1">
          {product.name}
        </p>
      </div>

      <ProductForm
        initialData={initialData}
        categories={categories}
        brands={brands}
      />
    </div>
  )
}
