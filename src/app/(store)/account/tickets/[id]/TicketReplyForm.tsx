"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ticketMessageSchema, type TicketMessageFormData } from "@/lib/validations/ticket"
import { toast } from "@/components/ui/Toast"
import { Send, Loader2, Paperclip, X } from "lucide-react"

interface TicketReplyFormProps {
  ticketId: string
}

export function TicketReplyForm({ ticketId }: TicketReplyFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketMessageFormData>({
    resolver: zodResolver(ticketMessageSchema),
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
    } catch {
      toast.error("Error al subir los archivos")
    } finally {
      setUploading(false)
    }
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  async function onSubmit(data: TicketMessageFormData) {
    setSubmitting(true)

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: data.body,
          attachments,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Error al enviar el mensaje")
      }

      reset()
      setAttachments([])
      toast.success("Mensaje enviado")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al enviar el mensaje"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gradient-card border border-void-500 rounded-2xl p-5 space-y-4"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-sans text-ink-secondary">
          Responder
        </label>
        <textarea
          {...register("body")}
          placeholder="Escribe tu respuesta..."
          rows={4}
          className="w-full bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 text-ink-primary font-mono rounded-lg px-3 py-2 text-sm outline-none transition-all placeholder:text-ink-tertiary resize-none"
        />
        {errors.body && (
          <span className="text-xs text-danger-400 font-mono">
            {errors.body.message}
          </span>
        )}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((url, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-void-800 border border-void-600 rounded-lg px-3 py-1.5 text-xs"
            >
              <Paperclip size={12} className="text-ink-tertiary" />
              <span className="text-ink-primary truncate max-w-[120px]">
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

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-void-800 border border-void-600 hover:border-cyber-500/50 text-ink-tertiary hover:text-ink-secondary rounded-lg text-xs cursor-pointer transition-all">
          {uploading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Paperclip size={12} />
          )}
          <span>{uploading ? "Subiendo..." : "Adjuntar"}</span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando…
            </>
          ) : (
            <>
              <Send size={16} />
              Enviar
            </>
          )}
        </button>
      </div>
    </form>
  )
}
