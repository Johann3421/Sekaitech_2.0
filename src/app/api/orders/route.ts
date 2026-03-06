import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateOrderNumber } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const role = (session.user as { role: string }).role

    const where = role === "ADMIN" ? {} : { userId }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")
    const status = searchParams.get("status")

    if (status) Object.assign(where, { status })

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { include: { images: { take: 1 } } } } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const userId = (session.user as { id: string }).id

    const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } })
    const exchangeRate = Number(settings?.exchangeRate ?? 3.75)
    const taxRate = Number(settings?.taxRate ?? 0.18)

    const subtotalUSD = body.items.reduce(
      (sum: number, item: { priceUSD: number; quantity: number }) => sum + item.priceUSD * item.quantity,
      0
    )
    const taxUSD = subtotalUSD * taxRate
    const shippingUSD = subtotalUSD >= Number(settings?.shippingFreeThreshold ?? 299) ? 0 : 15
    const totalUSD = subtotalUSD + taxUSD + shippingUSD
    const totalPEN = Math.ceil(totalUSD * exchangeRate * 100) / 100

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        subtotalUSD,
        taxUSD,
        shippingUSD,
        totalUSD,
        exchangeRateSnapshot: exchangeRate,
        totalPEN,
        currency: body.currency ?? "PEN",
        type: body.type ?? "DELIVERY",
        payMethod: body.payMethod,
        notes: body.notes,
        shippingAddress: body.shippingAddress,
        items: {
          create: body.items.map((item: { productId: string; quantity: number; priceUSD: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceUSD: item.priceUSD,
          })),
        },
      },
      include: { items: true },
    })

    // Decrement stock
    for (const item of body.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Error creating order" }, { status: 500 })
  }
}
