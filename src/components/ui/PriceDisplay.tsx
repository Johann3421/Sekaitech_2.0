'use client'

import { useCurrency } from "@/providers/CurrencyProvider"
import { cn } from "@/lib/utils"

interface PriceDisplayProps {
  priceUSD: number
  comparePriceUSD?: number | null
  size?: "sm" | "md" | "lg" | "xl"
  showBoth?: boolean
  className?: string
}

export function PriceDisplay({
  priceUSD,
  comparePriceUSD,
  size = "md",
  showBoth = false,
  className,
}: PriceDisplayProps) {
  const { format, currency, convert } = useCurrency()

  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
  }

  const hasDiscount = comparePriceUSD && comparePriceUSD > priceUSD
  const discountPercent = hasDiscount
    ? Math.round(((comparePriceUSD - priceUSD) / comparePriceUSD) * 100)
    : 0

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className={cn(
            "font-mono font-bold text-cyber-400 tabular-nums",
            sizeClasses[size]
          )}
        >
          {format(priceUSD)}
        </span>
        {hasDiscount && (
          <span className="font-mono text-sm text-ink-tertiary line-through tabular-nums">
            {format(comparePriceUSD)}
          </span>
        )}
        {hasDiscount && (
          <span className="font-mono text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
      </div>
      {showBoth && (
        <span className="font-mono text-xs text-ink-tertiary">
          {currency === "PEN"
            ? `≈ $ ${priceUSD.toFixed(2)} USD`
            : `≈ S/ ${convert(priceUSD).toFixed(2)} PEN`}
        </span>
      )}
    </div>
  )
}
