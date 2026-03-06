"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCartStore } from "@/store/cart"
import { useCurrency } from "@/providers/CurrencyProvider"
import { PriceDisplay } from "@/components/ui/PriceDisplay"
import { Input } from "@/components/ui/Input"
import { CurrencyToggle } from "@/components/ui/CurrencyToggle"
import { toast } from "@/components/ui/Toast"
import {
  CreditCard,
  Truck,
  MapPin,
  Loader2,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react"

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  phone: z.string().min(6, "Mínimo 6 caracteres"),
  address1: z.string().min(5, "Mínimo 5 caracteres"),
  address2: z.string().optional(),
  district: z.string().min(2, "Requerido"),
  province: z.string().min(2, "Requerido"),
  department: z.string().min(2, "Requerido"),
  notes: z.string().optional(),
  payMethod: z.string().min(1, "Requerido"),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalUSD, clearCart } = useCartStore()
  const { currency } = useCurrency()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payMethod: "transfer" },
  })

  const total = totalUSD()
  const isEmpty = items.length === 0

  async function onSubmit(data: CheckoutFormData) {
    if (isEmpty) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DELIVERY",
          currency,
          payMethod: data.payMethod,
          notes: data.notes,
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address1: data.address1,
            address2: data.address2,
            district: data.district,
            province: data.province,
            department: data.department,
          },
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Error al crear el pedido")
      }

      const order = await res.json()
      clearCart()
      router.push(`/checkout/success?order=${order.orderNumber}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el pedido"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-void-800 border border-void-500 flex items-center justify-center">
          <ShoppingBag size={32} className="text-ink-tertiary" />
        </div>
        <h1 className="font-display font-bold text-2xl text-ink-primary mb-3">
          No hay productos en el carrito
        </h1>
        <p className="text-ink-secondary text-sm mb-8">
          Agrega productos antes de continuar al checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all"
        >
          Explorar Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-cyber-400 font-mono transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Volver al carrito
      </Link>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-8">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left — Shipping form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <section className="bg-gradient-card border border-void-500 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-cyber-400" />
              <h2 className="font-display font-bold text-lg text-ink-primary">
                Dirección de Envío
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                placeholder="Juan"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Apellido *"
                placeholder="Pérez"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            <Input
              label="Teléfono *"
              placeholder="+51 999 999 999"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Input
              label="Dirección (línea 1) *"
              placeholder="Av. Principal 123"
              error={errors.address1?.message}
              {...register("address1")}
            />
            <Input
              label="Dirección (línea 2)"
              placeholder="Piso 2, Dpto. 4B (opcional)"
              {...register("address2")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Distrito *"
                placeholder="Miraflores"
                error={errors.district?.message}
                {...register("district")}
              />
              <Input
                label="Provincia *"
                placeholder="Lima"
                error={errors.province?.message}
                {...register("province")}
              />
              <Input
                label="Departamento *"
                placeholder="Lima"
                error={errors.department?.message}
                {...register("department")}
              />
            </div>

            <div>
              <label className="text-sm font-sans text-ink-secondary mb-1.5 block">
                Notas (opcional)
              </label>
              <textarea
                {...register("notes")}
                placeholder="Instrucciones de entrega, referencias, etc."
                rows={3}
                className="w-full bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 text-ink-primary font-mono rounded-lg px-3 py-2 text-sm outline-none transition-all placeholder:text-ink-tertiary resize-none"
              />
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-gradient-card border border-void-500 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} className="text-plasma-400" />
              <h2 className="font-display font-bold text-lg text-ink-primary">
                Método de Pago
              </h2>
            </div>

            <div className="space-y-3">
              {[
                { value: "transfer", label: "Transferencia Bancaria", desc: "BCP, Interbank, BBVA" },
                { value: "yape", label: "Yape / Plin", desc: "Pago con QR o número" },
                { value: "cash", label: "Contra entrega", desc: "Paga al recibir tu pedido" },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-center gap-3 p-4 border border-void-500 rounded-xl cursor-pointer hover:border-cyber-500/50 transition-all has-[:checked]:border-cyber-500 has-[:checked]:bg-cyber-glow/10"
                >
                  <input
                    type="radio"
                    value={method.value}
                    {...register("payMethod")}
                    className="w-4 h-4 accent-cyber-500"
                  />
                  <div>
                    <p className="text-sm font-display font-semibold text-ink-primary">
                      {method.label}
                    </p>
                    <p className="text-xs text-ink-tertiary">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right — Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-gradient-card border border-void-500 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-ink-primary">
                Resumen
              </h2>
              <CurrencyToggle />
            </div>

            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-void-800 rounded-lg border border-void-600 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-[10px] font-mono">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink-primary truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-mono text-ink-tertiary">
                      x{item.quantity}
                    </p>
                  </div>
                  <PriceDisplay
                    priceUSD={item.priceUSD * item.quantity}
                    size="sm"
                    className="text-right"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-void-600 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-secondary">
                <span>Subtotal</span>
                <PriceDisplay priceUSD={total} size="sm" />
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Envío</span>
                <span className="font-mono text-ink-tertiary text-xs">
                  {total >= 299 ? "Gratis" : "Por calcular"}
                </span>
              </div>
              <div className="border-t border-void-600 pt-3 flex justify-between items-baseline">
                <span className="font-display font-bold text-ink-primary">
                  Total
                </span>
                <PriceDisplay priceUSD={total} size="md" showBoth />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  <Truck size={18} />
                  Confirmar Pedido
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
