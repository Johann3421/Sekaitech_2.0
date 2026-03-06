'use client'

import { useCurrency } from "@/providers/CurrencyProvider"
import { cn } from "@/lib/utils"
import { ArrowLeftRight } from "lucide-react"

export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency()

  return (
    <button
      onClick={() => setCurrency(currency === "PEN" ? "USD" : "PEN")}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
        "bg-void-800 border border-void-500 hover:border-cyber-500/50",
        "text-ink-secondary hover:text-ink-primary transition-all duration-200",
        "font-mono text-xs",
        className
      )}
      title={`Cambiar a ${currency === "PEN" ? "USD" : "PEN"}`}
    >
      <ArrowLeftRight size={12} />
      <span className={cn(currency === "USD" && "text-cyber-400")}>USD</span>
      <span className="text-ink-tertiary">/</span>
      <span className={cn(currency === "PEN" && "text-cyber-400")}>PEN</span>
    </button>
  )
}
