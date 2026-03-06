import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/admin/ProductForm"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Nuevo Producto — Admin SekaiTech",
}

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Nuevo Producto
        </h1>
        <p className="text-sm text-ink-tertiary font-sans mt-1">
          Agrega un nuevo producto al catálogo
        </p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  )
}
