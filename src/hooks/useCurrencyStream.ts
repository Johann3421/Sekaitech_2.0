'use client'

import { useEffect, useState } from "react"

export function useCurrencyStream() {
  const [rate, setRate] = useState<number | null>(null)

  useEffect(() => {
    const es = new EventSource("/api/currency/stream")
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "EXCHANGE_RATE_UPDATED") {
          setRate(data.rate)
        }
      } catch {
        // Ignore parse errors
      }
    }
    es.onerror = () => {
      es.close()
    }
    return () => es.close()
  }, [])

  return rate
}
