"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ticketSchema, type TicketFormData } from "@/lib/validations/ticket"
import { Input } from "@/components/ui/Input"
import { toast } from "@/components/ui/Toast"
import {
  ChevronRight,
  Send,
  Loader2,
  Paperclip,
  X,
} from "lucide-react"

const CATEGORIES = [
  { value: "ORDER", label: "Pedido" },
  { value: "WARRANTY", label: "Garantía" },
  { value: "TECHNICAL", label: "Soporte Técnico" },
  { value: "BILLING", label: "Facturación" },
  { value: "GENERAL", label: "General" },
]

export default function NewTicketPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: "GENERAL",
      attachments: [],
    },
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i])
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Error al subir archivos")

      const data = await res.json()
      const urls: string[] = data.urls ?? (data.url ? [data.url] : [])
      setAttachments((prev) => [...prev, ...urls])
    } catch (error) {
      toast.error("Error al subir los archivos")
    } finally {
      setUploading(false)
    }
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  async function onSubmit(data: TicketFormData) {
    setSubmitting(true)

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          attachments,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Error al crear el ticket")
      }

      const ticket = await res.json()
      toast.success("Ticket creado exitosamente")
      router.push(`/account/tickets/${ticket.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear el ticket"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-mono text-ink-tertiary mb-6">
        <Link
          href="/account"
          className="hover:text-cyber-400 transition-colors"
        >
          Mi Cuenta
        </Link>
        <ChevronRight size={14} />
        <Link
          href="/account/tickets"
          className="hover:text-cyber-400 transition-colors"
        >
          Tickets
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink-primary">Nuevo Ticket</span>
      </nav>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-8">
        Crear Ticket de Soporte
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gradient-card border border-void-500 rounded-2xl p-6 space-y-6"
      >
        <Input
          label="Asunto *"
          placeholder="Describe brevemente tu problema"
          error={errors.subject?.message}
          {...register("subject")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans text-ink-secondary">
              Categoría *
            </label>
            <select
              {...register("category")}
              className="bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 text-ink-primary font-mono rounded-lg px-3 py-2 text-sm outline-none transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-xs text-danger-400 font-mono">
                {errors.category.message}
              </span>
            )}
          </div>

          <Input
            label="Referencia de Pedido (opcional)"
            placeholder="HL-202603-XXXXXX"
            {...register("orderId")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-sans text-ink-secondary">
            Mensaje *
          </label>
          <textarea
            {...register("initialMessage")}
            placeholder="Describe tu problema o consulta con el mayor detalle posible..."
            rows={6}
            className="w-full bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 text-ink-primary font-mono rounded-lg px-3 py-2 text-sm outline-none transition-all placeholder:text-ink-tertiary resize-none"
          />
          {errors.initialMessage && (
            <span className="text-xs text-danger-400 font-mono">
              {errors.initialMessage.message}
            </span>
          )}
        </div>

        {/* Attachments */}
        <div className="space-y-3">
          <label className="text-sm font-sans text-ink-secondary">
            Archivos adjuntos
          </label>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-void-800 border border-void-600 rounded-lg px-3 py-1.5 text-xs"
                >
                  <Paperclip size={12} className="text-ink-tertiary" />
                  <span className="text-ink-primary truncate max-w-[150px]">
                    {url.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-ink-tertiary hover:text-danger-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-void-800 border border-void-500 hover:border-cyber-500/50 text-ink-secondary hover:text-ink-primary rounded-lg text-sm cursor-pointer transition-all">
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Paperclip size={14} />
            )}
            <span>{uploading ? "Subiendo..." : "Adjuntar archivo"}</span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
