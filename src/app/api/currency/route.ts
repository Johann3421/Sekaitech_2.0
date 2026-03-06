import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } })
    const rate = settings?.exchangeRate ? Number(settings.exchangeRate) : 3.75
    return NextResponse.json({ rate, currency: "PEN", baseCurrency: "USD" })
  } catch {
    return NextResponse.json({ rate: 3.75, currency: "PEN", baseCurrency: "USD" })
  }
}
