'use client'

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { toast } from "sonner"
import { Upload, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

interface BannerItem {
  id: string
  type: string
  title?: string | null
  subtitle?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  linkText?: string | null
  bgColor?: string | null
  active: boolean
  position: number
}

export function BannerManager({ banners: initialBanners }: { banners: BannerItem[] }) {
  const [banners, setBanners] = useState(initialBanners)
  const [editing, setEditing] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleImageUpload(bannerId: string, file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        await updateBanner(bannerId, { imageUrl: data.url })
        toast.success("Imagen subida correctamente")
      }
    } catch {
      toast.error("Error al subir imagen")
    } finally {
      setUploading(false)
    }
  }

  async function updateBanner(id: string, data: Partial<BannerItem>) {
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...data } : b))
        )
        toast.success("Banner actualizado")
      }
    } catch {
      toast.error("Error al actualizar banner")
    }
  }

  async function deleteBanner(id: string) {
    try {
      await fetch(`/api/banners/${id}`, { method: "DELETE" })
      setBanners((prev) => prev.filter((b) => b.id !== id))
      toast.success("Banner eliminado")
    } catch {
      toast.error("Error al eliminar banner")
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await updateBanner(id, { active: !active })
  }

  return (
    <div className="space-y-4">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="bg-void-800 border border-void-500 rounded-xl p-4 flex gap-4"
        >
          <div className="flex items-center text-ink-tertiary cursor-grab">
            <GripVertical size={20} />
          </div>

          <div className="w-32 h-20 relative rounded-lg overflow-hidden bg-void-700 flex-shrink-0">
            {banner.imageUrl ? (
              <Image src={banner.imageUrl} alt="" fill className="object-cover" />
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor: banner.bgColor ?? "#0a1628" }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-cyber-400 bg-cyber-500/10 px-2 py-0.5 rounded">
                {banner.type}
              </span>
              <span className={`font-mono text-xs ${banner.active ? "text-volt-400" : "text-ink-tertiary"}`}>
                {banner.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="text-ink-primary font-display font-semibold truncate">
              {banner.title ?? "Sin título"}
            </p>
            <p className="text-ink-tertiary text-sm truncate">{banner.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImageUpload(banner.id, f)
                }}
              />
              <span className="p-2 rounded-lg bg-void-700 text-ink-secondary hover:text-ink-primary transition-colors inline-flex">
                <Upload size={16} />
              </span>
            </label>
            <button
              onClick={() => toggleActive(banner.id, banner.active)}
              className="p-2 rounded-lg bg-void-700 text-ink-secondary hover:text-ink-primary transition-colors"
            >
              {banner.active ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={() => deleteBanner(banner.id)}
              className="p-2 rounded-lg bg-void-700 text-danger-400 hover:bg-danger-500/20 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
