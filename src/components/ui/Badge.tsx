'use client'

import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "compatible" | "incompatible" | "premium" | "warning" | "default"
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    compatible: "bg-volt-500/15 text-volt-400 border-volt-500/30",
    incompatible: "bg-danger-500/15 text-danger-400 border-danger-500/30",
    premium: "bg-plasma-500/15 text-plasma-400 border-plasma-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    default: "bg-void-700 text-ink-secondary border-void-500",
  }

  return (
    <span
      className={cn(
        "font-mono text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
