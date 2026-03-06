'use client'

import { Badge } from "./Badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface CompatibilityBadgeProps {
  status: "compatible" | "incompatible" | "warning" | "unknown"
  label?: string
}

export function CompatibilityBadge({ status, label }: CompatibilityBadgeProps) {
  const config = {
    compatible: {
      variant: "compatible" as const,
      icon: <CheckCircle size={12} />,
      text: label ?? "Compatible",
    },
    incompatible: {
      variant: "incompatible" as const,
      icon: <XCircle size={12} />,
      text: label ?? "Incompatible",
    },
    warning: {
      variant: "warning" as const,
      icon: <AlertTriangle size={12} />,
      text: label ?? "Advertencia",
    },
    unknown: {
      variant: "default" as const,
      icon: null,
      text: label ?? "Sin verificar",
    },
  }

  const { variant, icon, text } = config[status]

  return (
    <Badge variant={variant}>
      {icon}
      {text}
    </Badge>
  )
}
