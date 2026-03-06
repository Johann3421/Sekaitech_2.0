import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { broadcastExchangeRateUpdate } from "@/lib/sse"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } })
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "Error fetching settings" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const settings = await prisma.globalSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...body },
      update: body,
    })

    // If exchange rate changed, broadcast SSE update
    if (body.exchangeRate) {
      broadcastExchangeRateUpdate(Number(body.exchangeRate))
    }

    revalidatePath("/")
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json({ error: "Error updating settings" }, { status: 500 })
  }
}
