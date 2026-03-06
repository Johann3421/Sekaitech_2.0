'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BuilderProduct, PCSlotType, CompatibilityResult } from "@/types"

interface BuilderState {
  slots: Partial<Record<PCSlotType, BuilderProduct>>
  totalWatts: number
  totalUSD: number
  compatibilityResult: CompatibilityResult | null
  activeSlot: PCSlotType | null
  buildName: string

  // Actions
  setSlot: (slot: PCSlotType, product: BuilderProduct) => void
  removeSlot: (slot: PCSlotType) => void
  setTotalWatts: (w: number) => void
  setCompatibilityResult: (r: CompatibilityResult) => void
  setActiveSlot: (slot: PCSlotType | null) => void
  setBuildName: (name: string) => void
  clearBuild: () => void
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      slots: {},
      totalWatts: 0,
      totalUSD: 0,
      compatibilityResult: null,
      activeSlot: null,
      buildName: "Mi Build",

      setSlot: (slot, product) =>
        set((state) => {
          const newSlots = { ...state.slots, [slot]: product }
          const totalUSD = Object.values(newSlots).reduce(
            (sum, p) => sum + (p?.priceUSD ?? 0),
            0
          )
          return { slots: newSlots, totalUSD }
        }),

      removeSlot: (slot) =>
        set((state) => {
          const newSlots = { ...state.slots }
          delete newSlots[slot]
          const totalUSD = Object.values(newSlots).reduce(
            (sum, p) => sum + (p?.priceUSD ?? 0),
            0
          )
          return { slots: newSlots, totalUSD }
        }),

      setTotalWatts: (totalWatts) => set({ totalWatts }),
      setCompatibilityResult: (compatibilityResult) => set({ compatibilityResult }),
      setActiveSlot: (activeSlot) => set({ activeSlot }),
      setBuildName: (buildName) => set({ buildName }),

      clearBuild: () =>
        set({
          slots: {},
          totalWatts: 0,
          totalUSD: 0,
          compatibilityResult: null,
          activeSlot: null,
          buildName: "Mi Build",
        }),
    }),
    { name: "hyper-logic-builder" }
  )
)
