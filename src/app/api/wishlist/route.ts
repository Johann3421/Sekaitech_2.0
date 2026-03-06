import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json({ items: [], authenticated: false })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (productId) {
      const item = await prisma.wishlistItem.findUnique({
        where: { productId_userId: { productId, userId } },
      })
      return NextResponse.json({ wishlisted: Boolean(item), authenticated: true })
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
    })

    return NextResponse.json({
      items: items.map((i) => i.productId),
      authenticated: true,
    })
  } catch (error) {
    console.error('Wishlist GET error:', error)
    return NextResponse.json({ error: 'Error fetching wishlist' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json({ error: 'Debes iniciar sesión para guardar favoritos' }, { status: 401 })
    }

    const body = await req.json()
    const productId = body?.productId
    if (!productId) {
      return NextResponse.json({ error: 'productId es requerido' }, { status: 400 })
    }

    const item = await prisma.wishlistItem.upsert({
      where: { productId_userId: { productId, userId } },
      update: {},
      create: { productId, userId },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Wishlist POST error:', error)
    return NextResponse.json({ error: 'Error adding wishlist item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json({ error: 'Debes iniciar sesión para modificar favoritos' }, { status: 401 })
    }

    const body = await req.json()
    const productId = body?.productId
    if (!productId) {
      return NextResponse.json({ error: 'productId es requerido' }, { status: 400 })
    }

    await prisma.wishlistItem.deleteMany({
      where: { productId, userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Wishlist DELETE error:', error)
    return NextResponse.json({ error: 'Error removing wishlist item' }, { status: 500 })
  }
}
