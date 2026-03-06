import { z } from "zod"

export const ticketSchema = z.object({
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  category: z.enum(["ORDER", "WARRANTY", "TECHNICAL", "BILLING", "GENERAL"]),
  orderId: z.string().optional(),
  initialMessage: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  attachments: z.array(z.string()).optional(),
})

export const ticketMessageSchema = z.object({
  body: z.string().min(1, "El mensaje no puede estar vacío"),
  attachments: z.array(z.string()).optional(),
})

export type TicketFormData = z.infer<typeof ticketSchema>
export type TicketMessageFormData = z.infer<typeof ticketMessageSchema>
