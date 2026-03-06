'use client'

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-sans text-ink-secondary">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50",
            "text-ink-primary font-mono rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200",
            "placeholder:text-ink-tertiary",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/50",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger-400 font-mono">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
export { Input }
