'use client'

import { SessionProvider } from "next-auth/react"
import { CurrencyProvider } from "./CurrencyProvider"
import { Toaster } from "sonner"

export function Providers({
  children,
  initialRate,
}: {
  children: React.ReactNode
  initialRate: number
}) {
  return (
    <SessionProvider>
      <CurrencyProvider initialRate={initialRate}>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0a1628",
              border: "1px solid #1e3456",
              color: "#f0f9ff",
              fontFamily: "Inter, system-ui, sans-serif",
            },
          }}
        />
      </CurrencyProvider>
    </SessionProvider>
  )
}
