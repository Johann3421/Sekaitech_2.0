'use client'

import Link from 'next/link'
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import { MapPin, Mail, Phone, CreditCard, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

const FOOTER_CATEGORIES = [
  { label: 'Procesadores', href: '/categories/procesadores' },
  { label: 'Tarjetas Gráficas', href: '/categories/tarjetas-graficas' },
  { label: 'Motherboards', href: '/categories/motherboards' },
  { label: 'Memoria RAM', href: '/categories/memoria-ram' },
  { label: 'Almacenamiento', href: '/categories/almacenamiento' },
  { label: 'Periféricos', href: '/categories/perifericos' },
]

const FOOTER_ACCOUNT = [
  { label: 'Mi Perfil', href: '/account' },
  { label: 'Mis Pedidos', href: '/account/orders' },
  { label: 'Lista de Deseos', href: '/account/wishlist' },
  { label: 'Soporte', href: '/support' },
  { label: 'PC Builder', href: '/pc-builder' },
]

const SOCIAL_LINKS = [
  { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FaFacebookF, href: 'https://facebook.com', label: 'Facebook' },
  { icon: FaTiktok, href: 'https://tiktok.com', label: 'TikTok' },
  { icon: FaWhatsapp, href: 'https://wa.me/', label: 'WhatsApp' },
]

export function Footer({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'bg-void-950 border-t border-void-600/50',
        className
      )}
    >
      {/* Newsletter CTA */}
      <div className="border-b border-void-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-ink-primary">
              Suscríbete al Newsletter
            </h3>
            <p className="text-sm text-ink-tertiary mt-1">
              Recibe ofertas exclusivas y novedades tech directamente en tu correo.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 md:w-72 px-4 py-2.5 bg-void-800 border border-void-500 rounded-l-xl text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-cyber-500/50 transition-colors"
            />
            <button className="px-5 py-2.5 bg-cyber-500 hover:bg-cyber-400 text-void-950 font-display font-bold text-sm rounded-r-xl flex items-center gap-1.5 transition-colors">
              <Send size={14} />
              Suscribir
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display font-bold text-xl text-cyber-400">Hyper</span>
              <span className="font-display font-bold text-xl text-plasma-400">-Logic</span>
            </Link>
            <p className="text-sm text-ink-tertiary leading-relaxed">
              Tu tienda de tecnología y componentes de PC en Perú.
              Productos originales con garantía, los mejores precios
              y asesoría personalizada.
            </p>
            <div className="flex items-start gap-2 text-sm text-ink-tertiary">
              <MapPin size={16} className="shrink-0 mt-0.5 text-cyber-400" />
              <span>Av. Ejemplo 1234, Lima, Perú</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-tertiary">
              <Phone size={14} className="shrink-0 text-cyber-400" />
              <span>+51 999 999 999</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-tertiary">
              <Mail size={14} className="shrink-0 text-cyber-400" />
              <span>contacto@hyperlogic.pe</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg bg-void-800 border border-void-600 text-ink-tertiary hover:text-cyber-400 hover:border-cyber-500/40 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-display font-bold text-sm text-ink-primary uppercase tracking-wider mb-4">
              Categorías
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_CATEGORIES.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-ink-tertiary hover:text-cyber-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mi Cuenta */}
          <div>
            <h4 className="font-display font-bold text-sm text-ink-primary uppercase tracking-wider mb-4">
              Mi Cuenta
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_ACCOUNT.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-ink-tertiary hover:text-cyber-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto & Mapa */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-ink-primary uppercase tracking-wider mb-4">
              Encuéntranos
            </h4>

            {/* Google Maps Placeholder */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-void-600 bg-void-800">
              <div className="w-full h-full flex items-center justify-center text-xs text-ink-tertiary font-mono">
                Google Maps Embed
              </div>
            </div>

            <p className="text-xs text-ink-tertiary">
              Lunes a Sábado: 9:00 AM – 7:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-void-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-ink-tertiary" />
              <span className="text-xs text-ink-tertiary">Aceptamos:</span>
              <div className="flex items-center gap-2">
                {['Visa', 'Mastercard', 'Yape', 'Plin', 'Transferencia'].map(
                  (method) => (
                    <span
                      key={method}
                      className="px-2 py-0.5 bg-void-800 border border-void-600 rounded text-[10px] font-mono text-ink-secondary"
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-void-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ink-tertiary">
            © {currentYear} Hyper-Logic. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-tertiary">
            <Link href="/terms" className="hover:text-ink-secondary transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-ink-secondary transition-colors">
              Privacidad
            </Link>
            <Link href="/refunds" className="hover:text-ink-secondary transition-colors">
              Devoluciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
