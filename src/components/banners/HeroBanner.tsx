'use client'

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BannerData {
  id: string
  title?: string | null
  subtitle?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  linkText?: string | null
  bgColor?: string | null
}

export function HeroBanner({ banners }: { banners: BannerData[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  return (
    <div className="relative w-full aspect-[21/9] lg:aspect-[24/7] overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {banners[current]?.imageUrl ? (
            <Image
              src={banners[current].imageUrl!}
              alt={banners[current].title ?? "Banner"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: banners[current]?.bgColor ?? "#060d16" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display font-bold text-3xl lg:text-6xl text-white max-w-2xl leading-tight"
            >
              {banners[current]?.title}
            </motion.h1>
            {banners[current]?.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="font-sans text-base lg:text-xl text-slate-200 mt-3 max-w-xl"
              >
                {banners[current].subtitle}
              </motion.p>
            )}
            {banners[current]?.linkUrl && (
              <motion.a
                href={banners[current].linkUrl!}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-white font-display font-bold rounded-xl w-fit transition-all duration-200 active:scale-95"
              >
                {banners[current].linkText ?? "Ver más"}
              </motion.a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-cyber-400" : "w-1.5 bg-void-500"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
