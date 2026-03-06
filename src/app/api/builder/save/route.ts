import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const { name, slots, totalUSD, totalWatts, isPublic } = body

    const build = await prisma.pCBuild.create({
      data: {
        name: name ?? "Mi Build",
        totalUSD: totalUSD ?? 0,
        totalWatts: totalWatts ?? 0,
        isPublic: isPublic ?? false,
        userId: session?.user ? (session.user as { id: string }).id : null,
        items: {
          create: Object.entries(slots)
            .filter(([, productId]) => productId)
            .map(([slot, productId]) => ({
              slot: slot as "CPU" | "MOTHERBOARD" | "RAM" | "GPU" | "STORAGE" | "PSU" | "CASE" | "COOLER",
              productId: productId as string,
            })),
        },
      },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
      },
    })

    return NextResponse.json({
      id: build.id,
      shareCode: build.shareCode,
      url: `/builds/${build.shareCode}`,
    })
  } catch (error) {
    console.error("Save build error:", error)
    return NextResponse.json({ error: "Error saving build" }, { status: 500 })
  }
}
