"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { useBuilderStore } from "@/store/builder"
import { toast } from "@/components/ui/Toast"
import type { PCSlotType } from "@/types"

interface CopyBuildButtonProps {
  items: {
    slot: string
    productId: string
    name: string
    slug: string
    priceUSD: number
    imageUrl?: string
    sku: string
    stock: number
  }[]
  buildName: string
}

export function CopyBuildButton({ items, buildName }: CopyBuildButtonProps) {
  const [copied, setCopied] = useState(false)
  const { setSlot, setBuildName, clearBuild } = useBuilderStore()

  function handleCopy() {
    clearBuild()
    setBuildName(`${buildName} (copia)`)

    for (const item of items) {
      const slot = item.slot as PCSlotType
      setSlot(slot, {
        id: item.productId,
        name: item.name,
        slug: item.slug,
        priceUSD: item.priceUSD,
        imageUrl: item.imageUrl,
        sku: item.sku,
        stock: item.stock,
      })
    }

    setCopied(true)
    toast.success("Build copiada a tu PC Builder")
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
        copied
          ? "bg-volt-500/15 text-volt-400 border border-volt-500/30"
          : "bg-plasma-500/20 border border-plasma-500/40 hover:bg-plasma-500/30 text-plasma-400"
      }`}
    >
      {copied ? (
        <>
          <Check size={16} />
          ¡Copiada!
        </>
      ) : (
        <>
          <Copy size={16} />
          Copiar esta Build
        </>
      )}
    </motion.button>
  )
}
