'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Image,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cpu,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/products', icon: Package },
  { label: 'Categorías', href: '/admin/categories', icon: Layers },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
  { label: 'Clientes', href: '/admin/customers', icon: Users },
  { label: 'Reportes', href: '/admin/reports', icon: BarChart3 },
  { label: 'Configuración', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  userName?: string
  userEmail?: string
  userAvatar?: string | null
}

export function AdminSidebar({ userName = 'Admin', userEmail = 'admin@sekaitech.pe', userAvatar }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-void-900 border-r border-void-700 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-void-700 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-cyber-500/20 border border-cyber-500/30 flex items-center justify-center shrink-0">
          <Cpu size={20} className="text-cyber-400" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-display font-bold text-ink-primary whitespace-nowrap"
            >
              SekaiTech
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                active
                  ? 'bg-cyber-500/10 text-cyber-400'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-void-800'
              )}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-cyber-400"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <Icon size={20} className="shrink-0" />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-sans whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-void-800 border border-void-600 rounded-md text-xs text-ink-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-card">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-ink-tertiary hover:text-ink-secondary hover:bg-void-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-sans"
              >
                Colapsar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User info */}
      <div className="border-t border-void-700 px-3 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-plasma-500/20 border border-plasma-500/30 flex items-center justify-center shrink-0 overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-plasma-400">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-sans text-ink-primary truncate">{userName}</p>
                <p className="text-xs text-ink-tertiary truncate">{userEmail}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="text-ink-tertiary hover:text-danger-400 transition-colors shrink-0"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  )
}
