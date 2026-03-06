import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort") ?? "createdAt"
    const order = searchParams.get("order") ?? "desc"
    const inStock = searchParams.get("inStock")

    const where: Record<string, unknown> = { published: true }

    if (category) where.category = { slug: category }
    if (brand) where.brand = { slug: brand }
    if (featured === "true") where.featured = true
    if (inStock === "true") where.stock = { gt: 0 }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }
    if (minPrice) where.priceUSD = { ...(where.priceUSD as object ?? {}), gte: parseFloat(minPrice) }
    if (maxPrice) where.priceUSD = { ...(where.priceUSD as object ?? {}), lte: parseFloat(maxPrice) }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { take: 2, orderBy: { position: "asc" } },
          brand: true,
          category: true,
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        shortDesc: body.shortDesc,
        priceUSD: body.priceUSD,
        comparePriceUSD: body.comparePriceUSD,
        costUSD: body.costUSD,
        sku: body.sku,
        stock: body.stock ?? 0,
        lowStockAlert: body.lowStockAlert ?? 5,
        featured: body.featured ?? false,
        published: body.published ?? true,
        condition: body.condition ?? "NEW",
        warranty: body.warranty,
        weight: body.weight,
        metaTitle: body.metaTitle,
        metaDesc: body.metaDesc,
        categoryId: body.categoryId,
        brandId: body.brandId,
      },
      include: { images: true, brand: true, category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
