'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const { searchOpen, setSearchOpen } = useUIStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      // Small delay to wait for AnimatePresence animation
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
      // Ctrl+K / Cmd+K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, setSearchOpen])

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        // Could be used for autocomplete suggestions in the future
      }, 300)
    },
    []
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    handleSearch(e.target.value)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-[61]',
              className
            )}
          >
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-void-900 border border-void-500 rounded-2xl shadow-cyber overflow-hidden">
                <Search size={20} className="ml-4 text-ink-tertiary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleChange}
                  placeholder="Buscar productos, categorías, marcas..."
                  className="flex-1 px-4 py-4 bg-transparent text-ink-primary placeholder:text-ink-tertiary text-sm focus:outline-none"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-2 mr-1 text-ink-tertiary hover:text-ink-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-4 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold text-sm transition-colors"
                >
                  Buscar
                </button>
              </div>

              {/* Keyboard shortcut hint */}
              <div className="flex items-center justify-center mt-2">
                <span className="text-[10px] text-ink-tertiary font-mono">
                  ESC para cerrar · Ctrl+K para buscar
                </span>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
