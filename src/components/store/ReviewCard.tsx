'use client'

import Image from 'next/image'
import { Star, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    title?: string | null
    body?: string | null
    userName: string
    verified?: boolean
    images?: { url: string; alt?: string | null }[]
    createdAt: string | Date
  }
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const date = new Date(review.createdAt)
  const formattedDate = date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article
      className={cn(
        'bg-gradient-card border border-void-500 rounded-2xl p-5 space-y-3',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-void-700 border border-void-500 flex items-center justify-center text-xs font-bold text-ink-secondary font-mono">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-ink-primary">
                {review.userName}
              </span>
              {review.verified && (
                <BadgeCheck size={14} className="text-volt-400" />
              )}
            </div>
            <span className="text-xs text-ink-tertiary font-mono">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={cn(
              i < review.rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-void-600'
            )}
          />
        ))}
        <span className="ml-1.5 text-xs font-mono text-ink-tertiary">
          {review.rating}/5
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-display font-semibold text-sm text-ink-primary">
          {review.title}
        </h4>
      )}

      {/* Body */}
      {review.body && (
        <p className="text-sm text-ink-secondary leading-relaxed">
          {review.body}
        </p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {review.images.map((img, idx) => (
            <div
              key={idx}
              className="w-16 h-16 rounded-lg overflow-hidden border border-void-600 bg-void-800"
            >
              <Image
                src={img.url}
                alt={img.alt || `Review image ${idx + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
