import Link from "next/link"
import { CheckCircle2, ShoppingBag, FileText } from "lucide-react"

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  const orderNumber = searchParams.order ?? "—"

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-volt-500/15 border border-volt-500/30 flex items-center justify-center">
        <CheckCircle2 size={40} className="text-volt-400" />
      </div>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-3">
        ¡Pedido Confirmado!
      </h1>

      <p className="text-ink-secondary mb-2">
        Gracias por tu compra. Tu pedido ha sido registrado exitosamente.
      </p>

      <div className="inline-flex items-center gap-2 bg-void-800 border border-void-500 rounded-xl px-5 py-3 mb-8">
        <span className="text-sm text-ink-secondary">N° de Pedido:</span>
        <span className="font-mono font-bold text-cyber-400 text-lg">
          {orderNumber}
        </span>
      </div>

      <p className="text-sm text-ink-tertiary mb-8 max-w-md mx-auto">
        Recibirás un correo con los detalles de tu pedido y las instrucciones de
        pago. Si tienes alguna pregunta, no dudes en contactarnos.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all active:scale-95"
        >
          <FileText size={18} />
          Ver Mis Pedidos
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-void-800 border border-void-500 hover:border-cyber-500/50 text-ink-secondary hover:text-ink-primary font-display font-semibold rounded-xl transition-all"
        >
          <ShoppingBag size={18} />
          Seguir Comprando
        </Link>
      </div>
    </div>
  )
}
