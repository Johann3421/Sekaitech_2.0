'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { LucideIcon } from 'lucide-react'
import {
  Plus,
  Trash2,
  Save,
  ImagePlus,
  Cpu,
  Tag,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ---------- Schema ----------
const productFormSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'Slug requerido'),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  shortDesc: z.string().optional(),
  priceUSD: z.coerce.number().positive('Precio debe ser positivo'),
  comparePriceUSD: z.coerce.number().positive().optional().nullable(),
  costUSD: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(3, 'SKU requerido'),
  stock: z.coerce.number().int().min(0, 'Stock no puede ser negativo'),
  lowStockAlert: z.coerce.number().int().min(0).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  condition: z.enum(['NEW', 'REFURBISHED', 'OPEN_BOX']).default('NEW'),
  warranty: z.string().optional(),
  weight: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().min(1, 'Categoría es requerida'),
  brandId: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  specs: z.array(z.object({
    key: z.string().min(1, 'Clave requerida'),
    value: z.string().min(1, 'Valor requerido'),
  })).optional(),
  images: z.array(z.object({
    url: z.string().url('URL inválida'),
    alt: z.string().optional(),
  })).optional(),
  compatibility: z.object({
    socket: z.string().optional(),
    tdpWatts: z.coerce.number().int().optional().nullable(),
    chipset: z.string().optional(),
    memoryType: z.string().optional(),
    formFactor: z.string().optional(),
    ramType: z.string().optional(),
    ramSpeedMHz: z.coerce.number().int().optional().nullable(),
    ramCapacityGB: z.coerce.number().int().optional().nullable(),
    gpuTdpWatts: z.coerce.number().int().optional().nullable(),
    pciInterface: z.string().optional(),
    gpuLengthMM: z.coerce.number().int().optional().nullable(),
    psuWatts: z.coerce.number().int().optional().nullable(),
    psuEfficiency: z.string().optional(),
    storageInterface: z.string().optional(),
    caseFormFactor: z.string().optional(),
    coolerHeightMM: z.coerce.number().int().optional().nullable(),
  }).optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

// ---------- Props ----------
interface CategoryOption {
  id: string
  name: string
  slug: string
}

interface BrandOption {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  initialData?: Partial<ProductFormValues> & { id?: string }
  categories: CategoryOption[]
  brands: BrandOption[]
}

// ---------- Section wrapper ----------
function FormSection({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-void-900 border border-void-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-5 py-4 border-b border-void-700',
          collapsible && 'cursor-pointer hover:bg-void-800/50 transition-colors'
        )}
      >
        <Icon size={18} className="text-cyber-400 shrink-0" />
        <span className="font-display font-bold text-ink-primary text-sm flex-1 text-left">
          {title}
        </span>
        {collapsible && (
          open ? <ChevronUp size={16} className="text-ink-tertiary" /> : <ChevronDown size={16} className="text-ink-tertiary" />
        )}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  )
}

// ---------- Component ----------
export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const isEditMode = Boolean(initialData?.id)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      shortDesc: '',
      priceUSD: 0,
      comparePriceUSD: null,
      costUSD: null,
      sku: '',
      stock: 0,
      lowStockAlert: 5,
      featured: false,
      published: true,
      condition: 'NEW',
      warranty: '',
      weight: null,
      categoryId: '',
      brandId: null,
      metaTitle: '',
      metaDesc: '',
      specs: [],
      images: [],
      compatibility: {},
      ...initialData,
    },
  })

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({ control, name: 'specs' })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: 'images' })

  const nameValue = watch('name')

  const handleAutoSlug = () => {
    if (nameValue) {
      setValue('slug', slugify(nameValue))
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    setSaving(true)
    try {
      const url = isEditMode
        ? `/api/products/${initialData!.id}`
        : '/api/products'
      const method = isEditMode ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al guardar producto')
      }

      const product = await res.json()
      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Basic info */}
      <FormSection title="Información básica" icon={Tag}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Nombre del producto"
              placeholder="Ej: AMD Ryzen 9 7950X"
              error={errors.name?.message}
              {...register('name', {
                onBlur: () => {
                  if (!isEditMode && !watch('slug')) handleAutoSlug()
                },
              })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans text-ink-secondary">Slug</label>
            <div className="flex gap-2">
              <input
                className={cn(
                  'flex-1 bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50',
                  'text-ink-primary font-mono rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200',
                  'placeholder:text-ink-tertiary',
                  errors.slug && 'border-danger-500'
                )}
                placeholder="auto-generado-del-nombre"
                {...register('slug')}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAutoSlug}>
                Auto
              </Button>
            </div>
            {errors.slug && <span className="text-xs text-danger-400 font-mono">{errors.slug.message}</span>}
          </div>

          <Input
            label="SKU"
            placeholder="Ej: CPU-AMD-7950X"
            error={errors.sku?.message}
            {...register('sku')}
          />

          <div className="md:col-span-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-sans text-ink-secondary">Descripción</label>
              <textarea
                rows={4}
                className={cn(
                  'bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50',
                  'text-ink-primary font-sans rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200 resize-y',
                  'placeholder:text-ink-tertiary',
                  errors.description && 'border-danger-500'
                )}
                placeholder="Descripción detallada del producto..."
                {...register('description')}
              />
              {errors.description && (
                <span className="text-xs text-danger-400 font-mono">{errors.description.message}</span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Descripción corta"
              placeholder="Resumen breve del producto"
              {...register('shortDesc')}
            />
          </div>
        </div>
      </FormSection>

      {/* Pricing & inventory */}
      <FormSection title="Precio e inventario" icon={Tag}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Precio USD"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.priceUSD?.message}
            {...register('priceUSD')}
          />
          <Input
            label="Precio comparación USD"
            type="number"
            step="0.01"
            placeholder="Opcional"
            {...register('comparePriceUSD')}
          />
          <Input
            label="Costo USD"
            type="number"
            step="0.01"
            placeholder="Opcional"
            {...register('costUSD')}
          />
          <Input
            label="Stock"
            type="number"
            step="1"
            placeholder="0"
            error={errors.stock?.message}
            {...register('stock')}
          />
          <Input
            label="Alerta stock bajo"
            type="number"
            step="1"
            placeholder="5"
            {...register('lowStockAlert')}
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.01"
            placeholder="Opcional"
            {...register('weight')}
          />
        </div>
      </FormSection>

      {/* Classification */}
      <FormSection title="Clasificación" icon={Info}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans text-ink-secondary">Categoría</label>
            <select
              className={cn(
                'bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50',
                'text-ink-primary font-sans rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200',
                errors.categoryId && 'border-danger-500'
              )}
              {...register('categoryId')}
            >
              <option value="" className="bg-void-900">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-void-900">
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-xs text-danger-400 font-mono">{errors.categoryId.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans text-ink-secondary">Marca</label>
            <select
              className={cn(
                'bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50',
                'text-ink-primary font-sans rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200'
              )}
              {...register('brandId')}
            >
              <option value="" className="bg-void-900">Sin marca</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id} className="bg-void-900">
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans text-ink-secondary">Condición</label>
            <select
              className={cn(
                'bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50',
                'text-ink-primary font-sans rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200'
              )}
              {...register('condition')}
            >
              <option value="NEW" className="bg-void-900">Nuevo</option>
              <option value="REFURBISHED" className="bg-void-900">Reacondicionado</option>
              <option value="OPEN_BOX" className="bg-void-900">Open Box</option>
            </select>
          </div>

          <Input
            label="Garantía"
            placeholder="Ej: 3 años"
            {...register('warranty')}
          />

          <div className="flex items-center gap-6 md:col-span-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-void-500 bg-void-800 text-cyber-500 focus:ring-cyber-500/50 focus:ring-offset-0 cursor-pointer"
                {...register('featured')}
              />
              <span className="text-sm font-sans text-ink-secondary group-hover:text-ink-primary transition-colors">
                Producto destacado
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-void-500 bg-void-800 text-cyber-500 focus:ring-cyber-500/50 focus:ring-offset-0 cursor-pointer"
                {...register('published')}
              />
              <span className="text-sm font-sans text-ink-secondary group-hover:text-ink-primary transition-colors">
                Publicado
              </span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* Images */}
      <FormSection title="Imágenes" icon={ImagePlus} collapsible defaultOpen={imageFields.length > 0}>
        <div className="space-y-3">
          {imageFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label={`URL imagen ${index + 1}`}
                  placeholder="https://..."
                  error={errors.images?.[index]?.url?.message}
                  {...register(`images.${index}.url`)}
                />
                <Input
                  label="Texto alt"
                  placeholder="Descripción de la imagen"
                  {...register(`images.${index}.alt`)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="mt-7 p-2 text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendImage({ url: '', alt: '' })}
          >
            <Plus size={14} />
            Agregar imagen
          </Button>
        </div>
      </FormSection>

      {/* Specs */}
      <FormSection title="Especificaciones" icon={Info} collapsible defaultOpen={specFields.length > 0}>
        <div className="space-y-3">
          {specFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label={index === 0 ? 'Clave' : undefined}
                  placeholder="Ej: Núcleos"
                  error={errors.specs?.[index]?.key?.message}
                  {...register(`specs.${index}.key`)}
                />
                <Input
                  label={index === 0 ? 'Valor' : undefined}
                  placeholder="Ej: 16"
                  error={errors.specs?.[index]?.value?.message}
                  {...register(`specs.${index}.value`)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className={cn('p-2 text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors', index === 0 && 'mt-7')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendSpec({ key: '', value: '' })}
          >
            <Plus size={14} />
            Agregar especificación
          </Button>
        </div>
      </FormSection>

      {/* Compatibility */}
      <FormSection title="Compatibilidad (PC Builder)" icon={Cpu} collapsible defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Socket" placeholder="Ej: AM5" {...register('compatibility.socket')} />
          <Input label="TDP (W)" type="number" placeholder="Ej: 170" {...register('compatibility.tdpWatts')} />
          <Input label="Chipset" placeholder="Ej: X670E" {...register('compatibility.chipset')} />
          <Input label="Tipo memoria" placeholder="Ej: DDR5" {...register('compatibility.memoryType')} />
          <Input label="Form Factor" placeholder="Ej: ATX" {...register('compatibility.formFactor')} />
          <Input label="Tipo RAM" placeholder="Ej: DDR5" {...register('compatibility.ramType')} />
          <Input label="Velocidad RAM (MHz)" type="number" placeholder="Ej: 5600" {...register('compatibility.ramSpeedMHz')} />
          <Input label="Capacidad RAM (GB)" type="number" placeholder="Ej: 32" {...register('compatibility.ramCapacityGB')} />
          <Input label="TDP GPU (W)" type="number" placeholder="Ej: 350" {...register('compatibility.gpuTdpWatts')} />
          <Input label="Interfaz PCI" placeholder="Ej: PCIe 4.0 x16" {...register('compatibility.pciInterface')} />
          <Input label="Largo GPU (mm)" type="number" placeholder="Ej: 336" {...register('compatibility.gpuLengthMM')} />
          <Input label="Watts PSU" type="number" placeholder="Ej: 850" {...register('compatibility.psuWatts')} />
          <Input label="Eficiencia PSU" placeholder="Ej: 80+ Gold" {...register('compatibility.psuEfficiency')} />
          <Input label="Interfaz almacenamiento" placeholder="Ej: NVMe M.2" {...register('compatibility.storageInterface')} />
          <Input label="Form Factor Case" placeholder="Ej: Mid Tower ATX" {...register('compatibility.caseFormFactor')} />
          <Input label="Altura cooler (mm)" type="number" placeholder="Ej: 163" {...register('compatibility.coolerHeightMM')} />
        </div>
      </FormSection>

      {/* SEO */}
      <FormSection title="SEO" icon={Info} collapsible defaultOpen={false}>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Meta título"
            placeholder="Título para SEO (opcional)"
            {...register('metaTitle')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans text-ink-secondary">Meta descripción</label>
            <textarea
              rows={2}
              className={cn(
                'bg-void-800 border border-void-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50',
                'text-ink-primary font-sans rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200 resize-y',
                'placeholder:text-ink-tertiary'
              )}
              placeholder="Descripción para buscadores (opcional)"
              {...register('metaDesc')}
            />
          </div>
        </div>
      </FormSection>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-8">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          <Save size={16} />
          {isEditMode ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
