'use client'

import { motion } from "framer-motion"
import Image from "next/image"

interface CenterMobileBannerProps {
  title?: string | null
  subtitle?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  linkText?: string | null
  bgColor?: string | null
}

export function CenterMobileBanner({ title, subtitle, imageUrl, linkUrl, linkText, bgColor }: CenterMobileBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-full rounded-2xl overflow-hidden border border-void-500"
    >
      {imageUrl ? (
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <Image src={imageUrl} alt={title ?? "Promoción"} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-void-950/80 to-transparent" />
        </div>
      ) : (
        <div
          className="aspect-[16/9] md:aspect-[21/9]"
          style={{ backgroundColor: bgColor ?? "#0a1628" }}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {title && (
          <h3 className="font-display font-bold text-2xl text-ink-primary">{title}</h3>
        )}
        {subtitle && (
          <p className="text-ink-secondary mt-1">{subtitle}</p>
        )}
        {linkUrl && (
          <a
            href={linkUrl}
            className="mt-3 inline-flex px-4 py-2 bg-cyber-500 text-void-950 font-display font-bold rounded-lg text-sm hover:bg-cyber-400 transition-colors"
          >
            {linkText ?? "Ver más"}
          </a>
        )}
      </div>
    </motion.div>
  )
}
