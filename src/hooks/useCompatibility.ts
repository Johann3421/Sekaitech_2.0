'use client'

import { useState, useCallback } from "react"
import type { CompatibilityResult, PCSlotType } from "@/types"

export function useCompatibility() {
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(false)

  const checkCompatibility = useCallback(
    async (build: Partial<Record<PCSlotType, string>>) => {
      setLoading(true)
      try {
        const res = await fetch("/api/builder/compatibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ build }),
        })
        const data = await res.json()
        setResult(data)
        return data as CompatibilityResult
      } catch {
        const errorResult: CompatibilityResult = {
          compatible: false,
          warnings: [],
          errors: ["Error al verificar compatibilidad"],
        }
        setResult(errorResult)
        return errorResult
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { result, loading, checkCompatibility }
}
