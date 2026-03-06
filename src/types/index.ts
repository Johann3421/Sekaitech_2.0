import type {
  Product,
  ProductImage,
  ProductSpec,
  Brand,
  Category,
  ProductCompatibility,
  Review,
  User,
  Order,
  OrderItem,
  Ticket,
  TicketMessage,
  Banner,
  PCBuild,
  PCBuildItem,
} from "@prisma/client"

export type { Currency } from "@/lib/currency"

// Extended types with relations
export interface ProductWithRelations extends Product {
  images: ProductImage[]
  specs: ProductSpec[]
  brand: Brand | null
  category: Category
  reviews: Review[]
  compatibility: ProductCompatibility | null
}

export interface CategoryWithChildren extends Category {
  children: Category[]
  _count?: { products: number }
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product & { images: ProductImage[] } })[]
  user: User | null
}

export interface TicketWithMessages extends Ticket {
  messages: TicketMessage[]
  user: User
}

export interface PCBuildWithItems extends PCBuild {
  items: (PCBuildItem & { product: Product & { images: ProductImage[] } })[]
  user: User | null
}

export interface BuilderProduct {
  id: string
  name: string
  slug: string
  priceUSD: number
  imageUrl?: string
  sku: string
  stock: number
  compatibility?: ProductCompatibility | null
}

export type PCSlotType = "CPU" | "MOTHERBOARD" | "RAM" | "GPU" | "STORAGE" | "PSU" | "CASE" | "COOLER"

export interface CartItem {
  productId: string
  name: string
  slug: string
  priceUSD: number
  imageUrl?: string
  quantity: number
  stock: number
  sku: string
}

export interface CompatibilityResult {
  compatible: boolean
  warnings: string[]
  errors: string[]
}
