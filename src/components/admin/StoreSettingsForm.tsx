'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface StoreSettingsFormProps {
  initialValues: {
    storeName: string
    storeAddress: string
    storeEmail: string
    storePhone: string
    storeMapUrl: string
  }
}

export function StoreSettingsForm({ initialValues }: StoreSettingsFormProps) {
  const [form, setForm] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo guardar la configuración')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err: any) {
      setError(err?.message || 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-void-700 rounded-xl p-6 shadow-card space-y-4">
      <h2 className="font-display text-lg font-semibold text-ink-100">Información de la tienda</h2>

      <Input
        label="Nombre de la tienda"
        value={form.storeName}
        onChange={(e) => onChange('storeName', e.target.value)}
        placeholder="Hyper-Logic"
      />

      <Input
        label="Dirección"
        value={form.storeAddress}
        onChange={(e) => onChange('storeAddress', e.target.value)}
        placeholder="Lima, Perú"
      />

      <Input
        label="Email de contacto"
        type="email"
        value={form.storeEmail}
        onChange={(e) => onChange('storeEmail', e.target.value)}
        placeholder="contacto@hyperlogic.pe"
      />

      <Input
        label="Teléfono"
        value={form.storePhone}
        onChange={(e) => onChange('storePhone', e.target.value)}
        placeholder="+51 999 999 999"
      />

      <Input
        label="URL de mapa"
        value={form.storeMapUrl}
        onChange={(e) => onChange('storeMapUrl', e.target.value)}
        placeholder="https://maps.app.goo.gl/..."
      />

      {error && (
        <div className="px-3 py-2 rounded-lg bg-danger-500/10 border border-danger-500/20 text-sm text-danger-400">
          {error}
        </div>
      )}

      {success && (
        <div className="px-3 py-2 rounded-lg bg-volt-500/10 border border-volt-500/20 text-sm text-volt-500">
          Configuración guardada correctamente.
        </div>
      )}

      <Button type="submit" className="w-full" loading={saving}>
        Guardar información de tienda
      </Button>
    </form>
  )
}
