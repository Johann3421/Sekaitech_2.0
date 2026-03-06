'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterCategory {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

interface FilterBrand {
  id: string
  name: string
}

interface FilterSidebarProps {
  categories: FilterCategory[]
  brands: FilterBrand[]
  className?: string
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-void-700/50 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-1 text-sm font-display font-semibold text-ink-primary hover:text-cyber-400 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

export function FilterSidebar({ categories, brands, className }: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || []
  const selectedBrands = searchParams.get('brand')?.split(',').filter(Boolean) || []
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const inStockOnly = searchParams.get('inStock') === 'true'
  const selectedConditions = searchParams.get('condition')?.split(',').filter(Boolean) || []

  const CONDITIONS = [
    { value: 'NEW', label: 'Nuevo' },
    { value: 'REFURBISHED', label: 'Reacondicionado' },
    { value: 'OPEN_BOX', label: 'Open Box' },
  ]

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // Reset page when filters change
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function toggleArrayParam(key: string, value: string, current: string[]) {
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateParams(key, updated.length > 0 ? updated.join(',') : null)
  }

  function clearAllFilters() {
    router.push(pathname, { scroll: false })
  }

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    inStockOnly ||
    selectedConditions.length > 0

  return (
    <aside
      className={cn(
        'bg-gradient-card border border-void-500 rounded-2xl p-5',
        className
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-cyber-400" />
          <h2 className="font-display font-bold text-sm text-ink-primary">Filtros</h2>
        </div>
        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-danger-400 hover:text-danger-400/80 transition-colors"
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection title="Categoría">
        <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => toggleArrayParam('category', cat.slug, selectedCategories)}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-all',
                  selectedCategories.includes(cat.slug)
                    ? 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/30'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-void-700/50'
                )}
              >
                <span>{cat.name}</span>
                {cat._count && (
                  <span className="ml-1 text-ink-tertiary text-xs font-mono">
                    ({cat._count.products})
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection title="Marca">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.name)}
                onChange={() => toggleArrayParam('brand', brand.name, selectedBrands)}
                className="w-3.5 h-3.5 rounded border-void-500 bg-void-800 text-cyber-500 focus:ring-cyber-500/30 focus:ring-offset-0 transition-colors"
              />
              <span className="text-sm text-ink-secondary group-hover:text-ink-primary transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Precio (USD)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => updateParams('minPrice', e.target.value || null)}
            className="w-full px-3 py-2 bg-void-800 border border-void-500 rounded-lg text-sm text-ink-primary font-mono placeholder:text-ink-tertiary focus:outline-none focus:border-cyber-500/50 transition-colors"
          />
          <span className="text-ink-tertiary text-xs">–</span>
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => updateParams('maxPrice', e.target.value || null)}
            className="w-full px-3 py-2 bg-void-800 border border-void-500 rounded-lg text-sm text-ink-primary font-mono placeholder:text-ink-tertiary focus:outline-none focus:border-cyber-500/50 transition-colors"
          />
        </div>
      </FilterSection>

      {/* In Stock Only */}
      <FilterSection title="Disponibilidad">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => updateParams('inStock', inStockOnly ? null : 'true')}
            className="w-3.5 h-3.5 rounded border-void-500 bg-void-800 text-cyber-500 focus:ring-cyber-500/30 focus:ring-offset-0 transition-colors"
          />
          <span className="text-sm text-ink-secondary group-hover:text-ink-primary transition-colors">
            Solo productos en stock
          </span>
        </label>
      </FilterSection>

      {/* Condition Filter */}
      <FilterSection title="Condición">
        <div className="space-y-2">
          {CONDITIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(value)}
                onChange={() => toggleArrayParam('condition', value, selectedConditions)}
                className="w-3.5 h-3.5 rounded border-void-500 bg-void-800 text-cyber-500 focus:ring-cyber-500/30 focus:ring-offset-0 transition-colors"
              />
              <span className="text-sm text-ink-secondary group-hover:text-ink-primary transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  )
}
