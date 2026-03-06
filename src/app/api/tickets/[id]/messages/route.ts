import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Ticket messages error:", error)
    return NextResponse.json({ error: "Error fetching messages" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const role = (session.user as { role: string }).role
    const isStaff = role === "ADMIN"

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        body: body.body,
        attachments: body.attachments ?? [],
        isStaff,
        authorName: session.user.name ?? (isStaff ? "Soporte" : "Cliente"),
      },
    })

    // Update ticket status
    await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: isStaff ? "WAITING_CUSTOMER" : "IN_PROGRESS",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Create message error:", error)
    return NextResponse.json({ error: "Error creating message" }, { status: 500 })
  }
}
