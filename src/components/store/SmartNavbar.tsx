'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  Phone,
  Cpu,
} from 'lucide-react'
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import { CurrencyToggle } from '@/components/ui/CurrencyToggle'
import { SearchBar } from '@/components/store/SearchBar'
import { CartDrawer } from '@/components/store/CartDrawer'
import { useCurrency } from '@/providers/CurrencyProvider'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/products' },
  { label: 'Categorías', href: '/categories' },
  { label: 'Ofertas', href: '/offers' },
]

const SOCIAL_LINKS = [
  { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FaFacebookF, href: 'https://facebook.com', label: 'Facebook' },
  { icon: FaTiktok, href: 'https://tiktok.com', label: 'TikTok' },
  { icon: FaWhatsapp, href: 'https://wa.me/', label: 'WhatsApp' },
]

export function SmartNavbar() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollY = useRef(0)

  const { exchangeRate, currency } = useCurrency()
  const totalItems = useCartStore((s) => s.totalItems())
  const { setCartDrawerOpen, setSearchOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - lastScrollY.current
    if (diff > 5 && latest > 80) {
      setHidden(true)
    } else if (diff < -5) {
      setHidden(false)
    }
    setScrolled(latest > 20)
    lastScrollY.current = latest
  })

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? '-100%' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-void-700 shadow-sm'
            : 'bg-transparent'
        )}
      >
        {/* Micro Top Bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-1 border-b border-void-700 bg-cyber-500 text-xs">
          <div className="flex items-center gap-4">
            <Phone size={12} className="text-blue-100" />
            <span className="text-blue-100">+51 999 999 999</span>
            <span className="text-blue-300">|</span>
            <span className="font-mono text-blue-100">
              1 USD = S/ {exchangeRate.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <Icon size={13} />
              </a>
            ))}
            <span className="text-blue-300 ml-1">|</span>
            <CurrencyToggle />
          </div>
        </div>

        {/* Main Navbar */}
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="font-display font-bold text-xl text-cyber-400">Hyper</span>
            <span className="font-display font-bold text-xl text-plasma-400">-Logic</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary rounded-lg hover:bg-void-700/50 transition-all duration-200"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/pc-builder"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-display font-semibold text-plasma-400 hover:text-plasma-300 rounded-lg hover:bg-plasma-500/10 border border-transparent hover:border-plasma-500/30 transition-all duration-200"
            >
              <Cpu size={15} />
              PC Builder
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Currency */}
            <div className="md:hidden">
              <CurrencyToggle />
            </div>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-void-700/50 transition-all"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-void-700/50 transition-all"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-cyber-500 text-white text-[10px] font-bold font-mono min-w-[18px] h-[18px] flex items-center justify-center rounded-full"
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* User */}
            <Link
              href="/account"
              className="p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-void-700/50 transition-all"
              aria-label="Cuenta"
            >
              <User size={20} />
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-void-700/50 transition-all"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-void-900 border-l border-void-600 p-6 flex flex-col gap-2 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-bold text-lg">
                  <span className="text-cyber-400">Hyper</span>
                  <span className="text-plasma-400">-Logic</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-ink-tertiary hover:text-ink-primary"
                >
                  <X size={20} />
                </button>
              </div>

              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-3 text-ink-secondary hover:text-ink-primary rounded-lg hover:bg-void-700/50 transition-colors"
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/pc-builder"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 text-plasma-400 hover:text-plasma-300 rounded-lg hover:bg-plasma-500/10 border border-plasma-500/30 mt-2 font-display font-semibold"
              >
                <Cpu size={16} />
                PC Builder
              </Link>

              <div className="mt-auto pt-6 border-t border-void-700 flex items-center gap-3">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 rounded-lg text-ink-tertiary hover:text-cyber-400 hover:bg-void-700/50 transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>

              <div className="mt-3 text-xs font-mono text-ink-tertiary">
                1 USD = S/ {exchangeRate.toFixed(2)}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Global overlays controlled by Zustand UI store */}
      <SearchBar />
      <CartDrawer />
    </>
  )
}
