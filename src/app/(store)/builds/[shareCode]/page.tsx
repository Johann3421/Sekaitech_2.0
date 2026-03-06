import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { createMetadata } from "@/lib/seo"
import { Badge } from "@/components/ui/Badge"
import { ShareBuildButton } from "@/components/store/ShareBuildButton"
import { CopyBuildButton } from "./CopyBuildButton"
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  MonitorSpeaker,
  HardDrive,
  Zap,
  Box,
  Fan,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

export const dynamic = 'force-dynamic'

const SLOT_ICONS: Record<string, React.ReactNode> = {
  CPU: <Cpu size={18} />,
  MOTHERBOARD: <CircuitBoard size={18} />,
  RAM: <MemoryStick size={18} />,
  GPU: <MonitorSpeaker size={18} />,
  STORAGE: <HardDrive size={18} />,
  PSU: <Zap size={18} />,
  CASE: <Box size={18} />,
  COOLER: <Fan size={18} />,
  EXTRA: <Box size={18} />,
}

const SLOT_LABELS: Record<string, string> = {
  CPU: "Procesador",
  MOTHERBOARD: "Placa Madre",
  RAM: "Memoria RAM",
  GPU: "Tarjeta Gráfica",
  STORAGE: "Almacenamiento",
  PSU: "Fuente de Poder",
  CASE: "Gabinete",
  COOLER: "Cooler",
  EXTRA: "Extra",
}

export async function generateMetadata({
  params,
}: {
  params: { shareCode: string }
}): Promise<Metadata> {
  const build = await prisma.pCBuild.findUnique({
    where: { shareCode: params.shareCode },
    select: { name: true, totalUSD: true },
  })

  if (!build) return { title: "Build no encontrada | Hyper-Logic" }

  return createMetadata({
    title: `${build.name} - PC Build`,
    description: `Build de PC "${build.name}" - $${Number(build.totalUSD).toFixed(2)} USD. Mira los componentes seleccionados y copia esta configuración.`,
    path: `/builds/${params.shareCode}`,
  })
}

export default async function SharedBuildPage({
  params,
}: {
  params: { shareCode: string }
}) {
  const build = await prisma.pCBuild.findUnique({
    where: { shareCode: params.shareCode },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
              brand: true,
              compatibility: true,
            },
          },
        },
      },
      user: { select: { name: true } },
    },
  })

  if (!build || !build.isPublic) notFound()

  const settings = await prisma.globalSettings.findFirst({ where: { id: 1 } })
  const exchangeRate = settings ? Number(settings.exchangeRate) : 3.75

  const totalUSD = Number(build.totalUSD)
  const totalPEN = totalUSD * exchangeRate

  // Sort items by slot order
  const slotOrder = ["CPU", "MOTHERBOARD", "RAM", "GPU", "STORAGE", "PSU", "CASE", "COOLER", "EXTRA"]
  const sortedItems = [...build.items].sort(
    (a, b) => slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot)
  )

  // Compute total TDP
  const totalWatts = build.items.reduce((sum, item) => {
    const tdp =
      item.product.compatibility?.tdpWatts ??
      item.product.compatibility?.gpuTdpWatts ??
      0
    return sum + tdp
  }, 0)

  // Basic compatibility check
  const psu = build.items.find((i) => i.slot === "PSU")
  const psuWatts = psu?.product.compatibility?.psuWatts ?? 0
  const isUnderpowered = psuWatts > 0 && totalWatts > 0 && psuWatts < totalWatts * 1.2

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6">
        <Link href="/" className="hover:text-cyber-400 transition-colors">
          Inicio
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">Build Compartida</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs text-plasma-400 block mb-1">
            {"// PC BUILD"}
          </span>
          <h1 className="font-display font-bold text-3xl text-ink-primary">
            {build.name}
          </h1>
          {build.user?.name && (
            <p className="text-sm text-ink-tertiary mt-1">
              Por {build.user.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ShareBuildButton />
          <CopyBuildButton items={sortedItems.map((item) => ({
            slot: item.slot,
            productId: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            priceUSD: Number(item.product.priceUSD),
            imageUrl: item.product.images[0]?.url,
            sku: item.product.sku,
            stock: item.product.stock,
          }))} buildName={build.name} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-card border border-void-500 rounded-2xl p-4 text-center">
          <span className="font-mono text-xs text-ink-tertiary block mb-1">
            Total USD
          </span>
          <span className="font-mono font-bold text-xl text-cyber-400">
            ${totalUSD.toFixed(2)}
          </span>
        </div>
        <div className="bg-gradient-card border border-void-500 rounded-2xl p-4 text-center">
          <span className="font-mono text-xs text-ink-tertiary block mb-1">
            Total PEN
          </span>
          <span className="font-mono font-bold text-xl text-ink-primary">
            S/ {totalPEN.toFixed(2)}
          </span>
        </div>
        <div className="bg-gradient-card border border-void-500 rounded-2xl p-4 text-center">
          <span className="font-mono text-xs text-ink-tertiary block mb-1">
            Consumo Est.
          </span>
          <span className="font-mono font-bold text-xl text-amber-400">
            {totalWatts}W
          </span>
        </div>
        <div className="bg-gradient-card border border-void-500 rounded-2xl p-4 text-center">
          <span className="font-mono text-xs text-ink-tertiary block mb-1">
            Compatibilidad
          </span>
          {isUnderpowered ? (
            <div className="flex items-center justify-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="font-mono font-bold text-sm text-amber-400">
                PSU baja
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} className="text-volt-400" />
              <span className="font-mono font-bold text-sm text-volt-400">
                OK
              </span>
            </div>
          )}
        </div>
      </div>

      {isUnderpowered && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-8">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-400">
            La fuente de poder ({psuWatts}W) podría ser insuficiente para esta
            configuración (consumo estimado: ~{totalWatts}W). Se recomienda al
            menos un 20% de capacidad adicional.
          </p>
        </div>
      )}

      {/* Components list */}
      <div className="space-y-3">
        {sortedItems.map((item) => {
          const product = item.product
          const imageUrl =
            product.images[0]?.url ?? "/placeholder-product.png"

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-gradient-card border border-void-500 rounded-2xl hover:border-cyber-500/30 transition-all"
            >
              {/* Slot icon */}
              <div className="w-10 h-10 rounded-xl bg-void-800 border border-void-600 flex items-center justify-center text-cyber-400 flex-shrink-0">
                {SLOT_ICONS[item.slot] ?? <Box size={18} />}
              </div>

              {/* Product image */}
              <div className="relative w-14 h-14 flex-shrink-0 bg-void-800 rounded-xl border border-void-600 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] text-ink-tertiary uppercase tracking-wider">
                  {SLOT_LABELS[item.slot] ?? item.slot}
                </span>
                <Link
                  href={`/products/${product.slug}`}
                  className="font-display font-semibold text-sm text-ink-primary hover:text-cyber-400 transition-colors block truncate"
                >
                  {product.name}
                </Link>
                {product.brand && (
                  <span className="text-xs text-ink-tertiary">
                    {product.brand.name}
                  </span>
                )}
              </div>

              {/* Quantity */}
              {item.quantity > 1 && (
                <Badge variant="default">x{item.quantity}</Badge>
              )}

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <span className="font-mono font-bold text-cyber-400">
                  ${Number(product.priceUSD).toFixed(2)}
                </span>
                <span className="font-mono text-xs text-ink-tertiary block">
                  S/ {(Number(product.priceUSD) * exchangeRate).toFixed(2)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
