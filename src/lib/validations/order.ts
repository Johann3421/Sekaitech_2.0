import { z } from "zod"

export const orderSchema = z.object({
  type: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  currency: z.enum(["USD", "PEN"]).default("PEN"),
  payMethod: z.string().optional(),
  notes: z.string().optional(),
  shippingAddress: z
    .object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      phone: z.string().min(6),
      address1: z.string().min(5),
      address2: z.string().optional(),
      district: z.string().min(2),
      province: z.string().min(2),
      department: z.string().min(2),
    })
    .optional(),
})

export type OrderFormData = z.infer<typeof orderSchema>
