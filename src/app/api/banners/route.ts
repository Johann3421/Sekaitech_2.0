import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const role = session?.user ? (session.user as { role: string }).role : null
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    const where: Record<string, unknown> = { active: true }
    if (type) where.type = type

    // Check date validity
    const now = new Date()
    where.OR = [
      { startsAt: null, endsAt: null },
      { startsAt: { lte: now }, endsAt: null },
      { startsAt: null, endsAt: { gte: now } },
      { startsAt: { lte: now }, endsAt: { gte: now } },
    ]

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { position: "asc" },
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Banners API error:", error)
    return NextResponse.json({ error: "Error fetching banners" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const banner = await prisma.banner.create({
      data: {
        type: body.type,
        title: body.title,
        subtitle: body.subtitle,
        imageUrl: body.imageUrl,
        mobileImageUrl: body.mobileImageUrl,
        linkUrl: body.linkUrl,
        linkText: body.linkText,
        bgColor: body.bgColor,
        textColor: body.textColor,
        active: body.active ?? true,
        position: body.position ?? 0,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error("Create banner error:", error)
    return NextResponse.json({ error: "Error creating banner" }, { status: 500 })
  }
}
