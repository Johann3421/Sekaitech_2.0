'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pencil, Save, Plus } from 'lucide-react'

type CategoryItem = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image: string | null
  position: number
  active: boolean
  _count?: { products: number }
}

interface CategoriesManagerProps {
  initialCategories: CategoryItem[]
}

type EditorState = {
  id?: string
  name: string
  slug: string
  description: string
  icon: string
  image: string
  position: string
  active: boolean
}

const EMPTY_FORM: EditorState = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  image: '',
  position: '0',
  active: true,
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [editing, setEditing] = useState<EditorState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const isEditing = useMemo(() => Boolean(editing.id), [editing.id])

  const fillForm = (cat: CategoryItem) => {
    setEditing({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      icon: cat.icon ?? '',
      image: cat.image ?? '',
      position: String(cat.position ?? 0),
      active: cat.active,
    })
    setError(null)
    setOk(null)
  }

  const resetForm = () => {
    setEditing(EMPTY_FORM)
    setError(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setOk(null)

    const payload = {
      name: editing.name.trim(),
      slug: editing.slug.trim(),
      description: editing.description.trim(),
      icon: editing.icon.trim(),
      image: editing.image.trim(),
      position: Number(editing.position || 0),
      active: editing.active,
    }

    if (!payload.name || !payload.slug) {
      setError('Nombre y slug son obligatorios')
      setSaving(false)
      return
    }

    try {
      const res = await fetch(isEditing ? `/api/categories/${editing.id}` : '/api/categories', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la categoría')

      if (isEditing) {
        setCategories((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)))
        setOk('Categoría actualizada')
      } else {
        setCategories((prev) => [...prev, { ...data, _count: { products: 0 } }].sort((a, b) => a.position - b.position))
        setOk('Categoría creada')
      }

      resetForm()
    } catch (err: any) {
      setError(err?.message || 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-white border border-void-700 rounded-xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink-100 text-lg">
            {isEditing ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-ink-tertiary hover:text-ink-secondary"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Nombre" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Slug" value={editing.slug} onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))} placeholder="ej. tarjetas-graficas" />
          <Input label="Icono (texto)" value={editing.icon} onChange={(e) => setEditing((p) => ({ ...p, icon: e.target.value }))} placeholder="Cpu, Monitor, Keyboard" />
          <Input label="Posición" type="number" value={editing.position} onChange={(e) => setEditing((p) => ({ ...p, position: e.target.value }))} />
        </div>

        <Input label="URL de imagen" value={editing.image} onChange={(e) => setEditing((p) => ({ ...p, image: e.target.value }))} placeholder="https://images.unsplash.com/..." />
        <Input label="Descripción" value={editing.description} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} />

        <label className="inline-flex items-center gap-2 text-sm text-ink-secondary">
          <input
            type="checkbox"
            checked={editing.active}
            onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
          />
          Activa
        </label>

        {error && <div className="text-sm text-danger-400">{error}</div>}
        {ok && <div className="text-sm text-volt-500">{ok}</div>}

        <Button type="submit" loading={saving}>
          {isEditing ? <Save size={14} /> : <Plus size={14} />}
          {isEditing ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </form>

      <div className="bg-white border border-void-700 rounded-xl p-5 shadow-card">
        <h3 className="font-display font-semibold text-ink-100 mb-4">Listado de categorías</h3>
        <div className="space-y-2">
          {categories
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((cat) => (
              <div key={cat.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-void-700 bg-void-900">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-primary truncate">{cat.name}</p>
                  <p className="text-xs text-ink-tertiary">/{cat.slug} · {cat._count?.products ?? 0} productos</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillForm(cat)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-void-600 text-sm text-ink-secondary hover:text-ink-primary hover:border-cyber-500/50"
                >
                  <Pencil size={13} /> Editar
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
