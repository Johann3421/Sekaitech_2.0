import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateTicketCode } from "@/lib/utils"

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
    const status = searchParams.get("status")
    if (status) Object.assign(where, { status })

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Tickets API error:", error)
    return NextResponse.json({ error: "Error fetching tickets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const body = await req.json()

    const count = await prisma.ticket.count()
    const ticketCode = generateTicketCode(count)

    const ticket = await prisma.ticket.create({
      data: {
        ticketCode,
        subject: body.subject,
        category: body.category,
        orderId: body.orderId,
        userId,
        messages: {
          create: {
            body: body.initialMessage,
            attachments: body.attachments ?? [],
            isStaff: false,
            authorName: session.user.name ?? "Cliente",
          },
        },
      },
      include: { messages: true },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json({ error: "Error creating ticket" }, { status: 500 })
  }
}
