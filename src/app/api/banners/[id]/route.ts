import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: body,
    })

    revalidatePath("/")
    return NextResponse.json(banner)
  } catch (error) {
    console.error("Update banner error:", error)
    return NextResponse.json({ error: "Error updating banner" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.banner.delete({ where: { id: params.id } })
    revalidatePath("/")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete banner error:", error)
    return NextResponse.json({ error: "Error deleting banner" }, { status: 500 })
  }
}
