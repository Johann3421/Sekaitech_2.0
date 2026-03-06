'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarBanner {
  id: string
  title?: string | null
  subtitle?: string | null
  linkUrl?: string | null
  linkText?: string | null
  bgColor?: string | null
  textColor?: string | null
}

interface TopBarProps {
  banner: TopBarBanner | null
  className?: string
}

export function TopBar({ banner, className }: TopBarProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!banner || dismissed) return null

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'relative overflow-hidden bg-gradient-to-r from-cyber-500/10 via-plasma-500/10 to-cyber-500/10 border-b border-void-600/50',
            className
          )}
          style={{
            backgroundColor: banner.bgColor || undefined,
            color: banner.textColor || undefined,
          }}
        >
          <div className="flex items-center justify-center px-10 py-2 text-center">
            <p className="text-xs sm:text-sm text-ink-secondary">
              {banner.title && (
                <span className="font-semibold text-ink-primary mr-1.5">
                  {banner.title}
                </span>
              )}
              {banner.subtitle && (
                <span>{banner.subtitle}</span>
              )}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="inline-flex items-center ml-2 text-cyber-400 hover:text-cyber-300 underline underline-offset-2 font-medium transition-colors"
                >
                  {banner.linkText || 'Ver más'}
                </Link>
              )}
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-ink-tertiary hover:text-ink-primary hover:bg-void-700/50 transition-colors"
            aria-label="Cerrar banner"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
