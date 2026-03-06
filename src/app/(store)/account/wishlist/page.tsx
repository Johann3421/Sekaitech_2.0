import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ChevronRight, Heart, ShoppingBag } from "lucide-react"
import { RemoveWishlistButton } from "./RemoveWishlistButton"

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          brand: true,
          category: true,
        },
      },
    },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6">
        <Link href="/account" className="hover:text-cyber-400 transition-colors">
          Mi Cuenta
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">Wishlist</span>
      </nav>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-8">
        Mi Lista de Deseos
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
            <Heart size={28} className="text-ink-tertiary" />
          </div>
          <p className="text-ink-primary font-display font-semibold text-lg mb-2">
            Tu lista de deseos está vacía
          </p>
          <p className="text-ink-secondary text-sm mb-6">
            Agrega productos a tu wishlist para guardarlos y comprarlos después.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all"
          >
            <ShoppingBag size={18} />
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlistItems.map((item) => {
            const product = item.product
            const imageUrl =
              product.images[0]?.url ?? "/placeholder-product.png"
            const inStock = product.stock > 0

            return (
              <div
                key={item.id}
                className="group relative bg-gradient-card border border-void-500 rounded-2xl overflow-hidden hover:border-cyber-500/50 hover:shadow-cyber transition-all"
              >
                {/* Remove button */}
                <div className="absolute top-3 right-3 z-10">
                  <RemoveWishlistButton productId={product.id} />
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  className="block"
                >
                  <div className="relative aspect-square bg-void-800 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                    {!inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="font-mono text-xs text-danger-400 bg-danger-500/20 border border-danger-500/40 px-3 py-1 rounded-full">
                          Sin Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    {product.brand && (
                      <span className="font-mono text-[10px] text-ink-tertiary uppercase tracking-wider">
                        {product.brand.name}
                      </span>
                    )}
                    <h3 className="font-display font-semibold text-sm text-ink-primary line-clamp-2 group-hover:text-cyber-400 transition-colors">
                      {product.name}
                    </h3>
                    <span className="font-mono font-bold text-cyber-400">
                      ${Number(product.priceUSD).toFixed(2)}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
