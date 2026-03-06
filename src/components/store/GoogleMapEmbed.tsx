'use client'

import { cn } from '@/lib/utils'

interface GoogleMapEmbedProps {
  src?: string
  className?: string
}

export function GoogleMapEmbed({
  src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.9764!2d-77.0428!3d-12.0464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAyJzQ3LjAiUyA3N8KwMDInMzQuMSJX!5e0!3m2!1ses!2spe!4v1',
  className,
}: GoogleMapEmbedProps) {
  return (
    <div
      className={cn(
        'relative w-full aspect-video rounded-2xl overflow-hidden border border-void-500 shadow-cyber',
        className
      )}
    >
      {/* Dark mode filter overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 mix-blend-difference" />
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(0.85) saturate(1.2)' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación de Hyper-Logic"
        className="w-full h-full"
      />
    </div>
  )
}
