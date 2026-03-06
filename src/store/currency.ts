'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Currency = "USD" | "PEN"

interface CurrencyState {
  currency: Currency
  setCurrency: (c: Currency) => void
  toggleCurrency: () => void
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as Currency) || "PEN",
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () =>
        set((state) => ({
          currency: state.currency === "PEN" ? "USD" : "PEN",
        })),
    }),
    { name: "hyper-logic-currency" }
  )
)
