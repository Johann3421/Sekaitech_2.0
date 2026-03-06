import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { ChevronRight, Paperclip } from "lucide-react"
import { TicketReplyForm } from "./TicketReplyForm"

export const dynamic = 'force-dynamic'

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true } },
    },
  })

  if (!ticket || ticket.userId !== userId) notFound()

  const statusLabels: Record<string, string> = {
    OPEN: "Abierto",
    IN_PROGRESS: "En progreso",
    WAITING_CUSTOMER: "Esperando respuesta",
    RESOLVED: "Resuelto",
    CLOSED: "Cerrado",
  }

  const categoryLabels: Record<string, string> = {
    ORDER: "Pedido",
    WARRANTY: "Garantía",
    TECHNICAL: "Soporte Técnico",
    BILLING: "Facturación",
    GENERAL: "General",
  }

  const statusVariant = (s: string) => {
    if (["RESOLVED", "CLOSED"].includes(s)) return "compatible" as const
    if (s === "WAITING_CUSTOMER") return "warning" as const
    if (s === "IN_PROGRESS") return "premium" as const
    return "default" as const
  }

  const isClosed = ["RESOLVED", "CLOSED"].includes(ticket.status)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6 flex-wrap">
        <Link href="/account" className="hover:text-cyber-400 transition-colors">
          Mi Cuenta
        </Link>
        <ChevronRight size={14} />
        <Link href="/account/tickets" className="hover:text-cyber-400 transition-colors">
          Tickets
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">{ticket.ticketCode}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-plasma-400">
              {ticket.ticketCode}
            </span>
            <Badge variant="default">
              {categoryLabels[ticket.category] ?? ticket.category}
            </Badge>
            <Badge variant={statusVariant(ticket.status)}>
              {statusLabels[ticket.status] ?? ticket.status}
            </Badge>
          </div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            {ticket.subject}
          </h1>
        </div>
        <span className="text-xs font-mono text-ink-tertiary">
          Creado:{" "}
          {new Date(ticket.createdAt).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Chat messages */}
      <div className="space-y-4 mb-8">
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isStaff ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl p-4 ${
                msg.isStaff
                  ? "bg-void-800 border border-void-500 rounded-tl-sm"
                  : "bg-cyber-500/10 border border-cyber-500/30 rounded-tr-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`font-display font-semibold text-xs ${
                    msg.isStaff ? "text-plasma-400" : "text-cyber-400"
                  }`}
                >
                  {msg.isStaff ? msg.authorName : "Tú"}
                </span>
                <span className="text-[10px] font-mono text-ink-tertiary">
                  {new Date(msg.createdAt).toLocaleString("es-PE", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-sm text-ink-primary whitespace-pre-wrap leading-relaxed">
                {msg.body}
              </p>

              {msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.attachments.map((url, idx) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
                    return isImage ? (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-20 h-20 rounded-lg overflow-hidden border border-void-600 hover:border-cyber-500/50 transition-colors"
                      >
                        <Image
                          src={url}
                          alt={`Adjunto ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </a>
                    ) : (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-void-700 border border-void-600 rounded-lg text-xs text-ink-secondary hover:text-cyber-400 transition-colors"
                      >
                        <Paperclip size={12} />
                        {url.split("/").pop()}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {isClosed ? (
        <div className="text-center p-6 bg-void-800 border border-void-600 rounded-2xl">
          <p className="text-sm text-ink-tertiary">
            Este ticket ha sido{" "}
            {ticket.status === "RESOLVED" ? "resuelto" : "cerrado"}.
            Si necesitas más ayuda,{" "}
            <Link
              href="/account/tickets/new"
              className="text-cyber-400 hover:text-cyber-300 transition-colors"
            >
              crea un nuevo ticket
            </Link>
            .
          </p>
        </div>
      ) : (
        <TicketReplyForm ticketId={ticket.id} />
      )}
    </div>
  )
}
