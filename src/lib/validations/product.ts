import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  slug: z.string().min(3),
  description: z.string().min(10, "Descripción debe tener al menos 10 caracteres"),
  shortDesc: z.string().optional(),
  priceUSD: z.coerce.number().positive("El precio debe ser positivo"),
  comparePriceUSD: z.coerce.number().positive().optional().nullable(),
  costUSD: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(3, "SKU requerido"),
  stock: z.coerce.number().int().min(0),
  lowStockAlert: z.coerce.number().int().min(0).default(5),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  condition: z.enum(["NEW", "REFURBISHED", "OPEN_BOX"]).default("NEW"),
  warranty: z.string().optional(),
  weight: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Categoría requerida"),
  brandId: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
})

export const compatibilitySchema = z.object({
  socket: z.string().optional(),
  tdpWatts: z.coerce.number().int().optional(),
  chipset: z.string().optional(),
  memoryType: z.string().optional(),
  memorySlots: z.coerce.number().int().optional(),
  maxMemoryGB: z.coerce.number().int().optional(),
  formFactor: z.string().optional(),
  ramType: z.string().optional(),
  ramSpeedMHz: z.coerce.number().int().optional(),
  ramCapacityGB: z.coerce.number().int().optional(),
  gpuTdpWatts: z.coerce.number().int().optional(),
  pciInterface: z.string().optional(),
  gpuLengthMM: z.coerce.number().int().optional(),
  psuWatts: z.coerce.number().int().optional(),
  psuEfficiency: z.string().optional(),
  psuFormFactor: z.string().optional(),
  storageInterface: z.string().optional(),
  storageCapacityGB: z.coerce.number().int().optional(),
  caseFormFactor: z.string().optional(),
  caseMaxGPUMM: z.coerce.number().int().optional(),
  caseMaxCoolerMM: z.coerce.number().int().optional(),
  coolerSocketsSupported: z.array(z.string()).optional(),
  coolerHeightMM: z.coerce.number().int().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
export type CompatibilityFormData = z.infer<typeof compatibilitySchema>
