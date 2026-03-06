'use client'

import { create } from "zustand"

interface UIState {
  cartDrawerOpen: boolean
  mobileMenuOpen: boolean
  searchOpen: boolean
  modalOpen: boolean
  modalContent: React.ReactNode | null

  setCartDrawerOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  openModal: (content: React.ReactNode) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  cartDrawerOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  modalOpen: false,
  modalContent: null,

  setCartDrawerOpen: (cartDrawerOpen) => set({ cartDrawerOpen }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),
}))
