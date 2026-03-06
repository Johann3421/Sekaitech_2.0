"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/Toast"

interface RemoveWishlistButtonProps {
  productId: string
}

export function RemoveWishlistButton({ productId }: RemoveWishlistButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRemove() {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (!res.ok) throw new Error("Error al eliminar")

      toast.success("Eliminado de tu lista de deseos")
      router.refresh()
    } catch {
      toast.error("Error al eliminar de la lista")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleRemove}
      disabled={loading}
      className="p-2 rounded-xl bg-void-900/80 backdrop-blur-sm border border-void-500 text-ink-tertiary hover:text-danger-400 hover:border-danger-500/40 hover:bg-danger-500/10 transition-all disabled:opacity-50"
      aria-label="Eliminar de lista de deseos"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <X size={14} />
      )}
    </motion.button>
  )
}
