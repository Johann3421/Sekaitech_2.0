'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Check, Copy } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface ShareBuildButtonProps {
  buildId?: string
  className?: string
}

export function ShareBuildButton({ buildId, className }: ShareBuildButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = buildId
      ? `${window.location.origin}/builds/${buildId}`
      : window.location.href

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all',
        copied
          ? 'bg-volt-500/15 text-volt-400 border border-volt-500/30'
          : 'bg-void-800 border border-void-500 text-ink-secondary hover:text-ink-primary hover:border-cyber-500/50',
        className
      )}
    >
      {copied ? (
        <>
          <Check size={16} />
          ¡Copiado!
        </>
      ) : (
        <>
          <Share2 size={16} />
          Compartir Build
        </>
      )}
    </motion.button>
  )
}
