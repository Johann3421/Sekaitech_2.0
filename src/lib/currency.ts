import { Decimal } from "@prisma/client/runtime/library"

export type Currency = "USD" | "PEN"

export function convertPrice(
  priceUSD: number | Decimal,
  currency: Currency,
  exchangeRate: number
): number {
  const usd = typeof priceUSD === "number" ? priceUSD : Number(priceUSD)
  if (currency === "USD") return usd
  return Math.ceil(usd * exchangeRate * 100) / 100
}

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "PEN") {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount)
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPriceCompact(amount: number, currency: Currency): string {
  const symbol = currency === "PEN" ? "S/" : "$"
  return `${symbol} ${amount.toFixed(2)}`
}
