# Hyper-Logic — E-Commerce de Tecnología & PC Builder

Plataforma full-stack de comercio electrónico para componentes de PC y tecnología en Perú. Incluye catálogo, sistema de moneda dual (USD/PEN), PC Builder con compatibilidad automática, panel de administración, tickets de soporte y escenas 3D.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v3 (tema dark personalizado) |
| Base de datos | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v4 (Credentials) |
| Estado | Zustand (persistido con localStorage) |
| Animaciones | Framer Motion |
| 3D | React Three Fiber + drei + postprocessing |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| Validación | Zod + React Hook Form |
| Notificaciones | Sonner |
| Tiempo real | SSE (Server-Sent Events) |

## Arquitectura

```
src/
├── app/
│   ├── (store)/        # Páginas públicas (Home, Productos, Cart, Checkout, etc.)
│   ├── admin/          # Panel de administración (protegido por rol ADMIN)
│   ├── auth/           # Login y Registro
│   ├── api/            # API Routes (REST)
│   ├── layout.tsx      # Root layout
│   ├── sitemap.ts      # Sitemap dinámico
│   └── robots.ts       # robots.txt
├── components/
│   ├── ui/             # Componentes base (Button, Badge, Input, Modal, etc.)
│   ├── store/          # Componentes del storefront (Navbar, Footer, ProductCard, etc.)
│   ├── admin/          # Componentes del admin (Sidebar, Charts, Forms)
│   ├── banners/        # Sistema CMS de banners
│   ├── builder/        # PC Builder (slots, picker, compatibilidad, PDF)
│   └── three/          # Escenas 3D (HeroScene, ProductViewer, Particles)
├── hooks/              # Custom hooks
├── lib/                # Utilidades (prisma, auth, currency, compatibility, seo)
├── providers/          # Context providers (Currency SSE, Session)
├── store/              # Zustand stores (cart, currency, builder, ui)
└── types/              # TypeScript interfaces
```

## Sistema de Moneda Dual (USD/PEN)

- Precio base en USD almacenado en la base de datos
- Tipo de cambio configurable desde admin (GlobalSettings)
- Conversión en tiempo real con SSE broadcast
- Redondeo `Math.ceil` para PEN (siempre a favor del vendedor)
- Formato: `$549.99` USD / `S/ 2,063.00` PEN

## PC Builder — Algoritmo de Compatibilidad

El PC Builder verifica compatibilidad entre componentes:

1. **CPU ↔ Motherboard**: Socket match (e.g., AM5, LGA1700)
2. **RAM ↔ Motherboard**: DDR type match (e.g., DDR5)
3. **Cooler ↔ CPU**: Socket support + TDP capacity
4. **PSU ↔ Build**: Wattage check con 20% headroom
5. **Case ↔ Motherboard**: Form factor (ATX, mATX, ITX)
6. **Case ↔ GPU**: Length clearance
7. **Case ↔ Cooler**: Height clearance

## Instalación

```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Editar DATABASE_URL y NEXTAUTH_SECRET

# 3. Crear base de datos y ejecutar migraciones
npx prisma migrate dev --name init

# 4. Seed de datos iniciales (30 productos, categorías, marcas, usuarios)
npx prisma db seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno (.env.local)

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/hyperlogic"
NEXTAUTH_SECRET="tu-secreto-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Credenciales de Seed

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@hyperlogic.pe | Admin123! |
| Customer | carlos@example.com | Customer123! |
| Customer | maria@example.com | Customer123! |
| Customer | luis@example.com | Customer123! |

## Comandos

```bash
npm run dev          # Desarrollo (localhost:3000)
npm run build        # Build de producción
npm run start        # Iniciar producción
npm run lint         # Linter
npx prisma studio    # GUI de base de datos
npx prisma db seed   # Ejecutar seed
```

## Paleta de Colores (Tema Dark)

| Token | Uso |
|-------|-----|
| `void` | Backgrounds (950=#0a0a0f → 700=#1e1e2e) |
| `cyber` | Accent principal (cyan) |
| `plasma` | Accent secundario (purple) |
| `volt` | Success/confirm (green) |
| `danger` | Errors/delete (red) |
| `amber` | Warnings/pending (amber) |
| `ink` | Texto (100=white → 600=muted) |

## Licencia

Proyecto privado — Todos los derechos reservados.
