"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: { id: string; url: string; alt: string }[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-void-800 rounded-2xl border border-void-500 flex items-center justify-center text-ink-tertiary font-mono text-sm">
        Sin imagen
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square bg-void-800 rounded-2xl border border-void-500 overflow-hidden">
        <Image
          src={images[selected].url}
          alt={images[selected].alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelected(idx)}
              className={cn(
                "relative w-16 h-16 flex-shrink-0 rounded-lg border overflow-hidden transition-all",
                idx === selected
                  ? "border-cyber-500 ring-1 ring-cyber-500/50"
                  : "border-void-500 hover:border-void-400"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
