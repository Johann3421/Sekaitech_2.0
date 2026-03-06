import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/providers/Providers"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: {
    default: "Hyper-Logic | Tecnología Premium en Perú",
    template: "%s | Hyper-Logic",
  },
  description:
    "Tienda online de componentes de PC, laptops, periféricos y armado de equipos a medida. Envío a todo el Perú. Los mejores precios en tecnología.",
  keywords: [
    "componentes PC",
    "tecnología Perú",
    "tienda online",
    "procesadores",
    "tarjetas gráficas",
    "laptops",
    "periféricos",
    "Huánuco",
  ],
  authors: [{ name: "Hyper-Logic" }],
  creator: "Hyper-Logic",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Hyper-Logic",
  },
}

async function getExchangeRate() {
  try {
    const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } })
    return settings?.exchangeRate ? Number(settings.exchangeRate) : 3.75
  } catch {
    return 3.75
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const rate = await getExchangeRate()

  return (
    <html lang="es" className="dark">
      <body className="bg-void-950 text-ink-primary font-sans">
        <Providers initialRate={rate}>{children}</Providers>
      </body>
    </html>
  )
}
