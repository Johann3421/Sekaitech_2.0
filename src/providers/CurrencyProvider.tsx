'use client'

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useCurrencyStore } from "@/store/currency"

interface CurrencyContextValue {
  currency: "USD" | "PEN"
  exchangeRate: number
  setCurrency: (c: "USD" | "PEN") => void
  convert: (priceUSD: number) => number
  format: (priceUSD: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  children,
  initialRate,
}: {
  children: React.ReactNode
  initialRate: number
}) {
  const { currency, setCurrency } = useCurrencyStore()
  const [exchangeRate, setExchangeRate] = useState(initialRate)

  useEffect(() => {
    const es = new EventSource("/api/currency/stream")
    es.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "EXCHANGE_RATE_UPDATED") {
        setExchangeRate(data.rate)
      }
    }
    es.onerror = () => {
      es.close()
    }
    return () => es.close()
  }, [])

  const convert = useCallback(
    (priceUSD: number) => {
      if (currency === "USD") return priceUSD
      return Math.ceil(priceUSD * exchangeRate * 100) / 100
    },
    [currency, exchangeRate]
  )

  const format = useCallback(
    (priceUSD: number) => {
      const amount = convert(priceUSD)
      if (currency === "PEN") {
        return `S/ ${amount.toFixed(2)}`
      }
      return `$ ${amount.toFixed(2)}`
    },
    [convert, currency]
  )

  return (
    <CurrencyContext.Provider value={{ currency, exchangeRate, setCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}
