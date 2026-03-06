# Guía de Despliegue — Hyper-Logic en Dokploy

> Esta guía cubre el despliegue completo con **Docker Compose** en un servidor administrado por [Dokploy](https://dokploy.com/).

---

## Tabla de contenidos

1. [Prerequisitos](#1-prerequisitos)
2. [Arquitectura del contenedor](#2-arquitectura-del-contenedor)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Despliegue en Dokploy](#4-despliegue-en-dokploy)
5. [Primera vez: seed de la base de datos](#5-primera-vez-seed-de-la-base-de-datos)
6. [Actualizar la aplicación](#6-actualizar-la-aplicación)
7. [Backups de la base de datos](#7-backups-de-la-base-de-datos)
8. [Solución de problemas](#8-solución-de-problemas)
9. [Construcción local para pruebas](#9-construcción-local-para-pruebas)

---

## 1. Prerequisitos

| Requisito | Versión mínima |
|-----------|---------------|
| Servidor (VPS/Dedicated) | Ubuntu 22.04+ recomendado |
| Docker Engine | 24+ |
| Docker Compose plugin | v2 |
| Dokploy | Última versión |
| Dominio configurado | DNS apuntando al servidor |

---

## 2. Arquitectura del contenedor

```
┌──────────────────────────────────────────────────┐
│  Docker Compose stack                            │
│                                                  │
│  ┌────────────────────┐   ┌──────────────────┐  │
│  │   app (Next.js)    │──▶│  db (Postgres16) │  │
│  │   Puerto 3000      │   │  Puerto 5432     │  │
│  │   standalone build │   │  Volume persistente│ │
│  └────────────────────┘   └──────────────────┘  │
└──────────────────────────────────────────────────┘
```

- **`app`**: imagen multi-stage (~300 MB). Al arrancar corre `prisma migrate deploy` automáticamente antes de iniciar Next.js.
- **`db`**: PostgreSQL 16 Alpine con datos en un volumen Docker persistente.
- Las migraciones se aplican **automáticamente** en cada arranque del contenedor `app`.

---

## 3. Variables de entorno

### 3.1 Copiar la plantilla

```bash
cp .env.production.example .env
```

### 3.2 Editar `.env`

```env
# ── PostgreSQL ────────────────────────────────────
POSTGRES_DB=hyperlogic
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<contraseña_segura>      # ← cambiar

# ── NextAuth ──────────────────────────────────────
NEXTAUTH_URL=https://tudominio.com          # ← tu dominio real
NEXTAUTH_SECRET=<secreto_32_chars>          # ← genera con el comando de abajo

# ── URL pública (debe ser igual a NEXTAUTH_URL) ───
NEXT_PUBLIC_APP_URL=https://tudominio.com

# ── Opcionales ────────────────────────────────────
NEXT_PUBLIC_STORE_NAME=Hyper-Logic
NEXT_PUBLIC_DEFAULT_CURRENCY=PEN
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Generar `NEXTAUTH_SECRET`:**

```bash
openssl rand -base64 32
```

> ⚠️ **IMPORTANTE — Variables `NEXT_PUBLIC_*`**
> Next.js **bake** (incrusta) las variables `NEXT_PUBLIC_*` en el bundle en tiempo de compilación.
> Si cambias `NEXT_PUBLIC_APP_URL` debes **reconstruir** la imagen (`docker compose build --no-cache app`).
> Las variables normales (sin prefijo `NEXT_PUBLIC_`) se leen en runtime y no requieren rebuild.

---

## 4. Despliegue en Dokploy

### 4.1 Crear el proyecto

1. Accede al panel de Dokploy.
2. Crea un nuevo proyecto → **Docker Compose**.
3. Conecta tu repositorio Git (GitHub/GitLab/Gitea) **o** sube los archivos manualmente.

### 4.2 Configurar las variables de entorno en Dokploy

En la pestaña **Environment** del servicio, agrega **todas** las variables listadas en la sección anterior.

Para las variables de build (`NEXT_PUBLIC_*`), Dokploy las expone como **Build Arguments** automáticamente si las defines en la misma pantalla de entorno — o puedes especificarlas explícitamente en la pestaña **Build Args**.

### 4.3 Configurar el dominio

1. Pestaña **Domains** → agrega tu dominio.
2. Habilita **HTTPS / Let's Encrypt**.
3. Proxy port: `3000` (servicio `app`).

### 4.4 Hacer el primer deploy

Haz clic en **Deploy** en Dokploy.

Dokploy ejecutará:
```
docker compose up --build -d
```

El log del contenedor `app` mostrará:
```
▶ Running database migrations...
▶ Starting Next.js server...
```

---

## 5. Primera vez: seed de la base de datos

Las migraciones se aplican solas, pero los **datos iniciales** (categorías, productos de ejemplo, usuario admin) deben cargarse manualmente **una sola vez** tras el primer deploy.

### Ejecutar el seed

En Dokploy → pestaña **Terminal** del servicio `app`, o desde SSH en el servidor:

```bash
# Entrar al contenedor
docker compose exec app sh

# Dentro del contenedor — instalar ts-node temporalmente y correr el seed
# Nota: el seed está en el contexto de build, no en el runner.
# Usa el siguiente método desde el host:
```

**Método recomendado desde el servidor host:**

```bash
# En el servidor, dentro de la carpeta del proyecto
docker compose run --rm \
  -e DATABASE_URL="postgresql://postgres:<PASSWORD>@db:5432/hyperlogic" \
  app \
  sh -c "node node_modules/prisma/build/index.js db seed"
```

> El seed requiere que el archivo `prisma/seed.ts` haya sido compilado.  
> Si el comando anterior falla, crea el seed desde la máquina de desarrollo apuntando directamente a la DB del servidor con un túnel SSH o Prisma Studio.

### Credenciales admin por defecto (después del seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@hyperlogic.pe | Admin123! |
| Cliente | carlos@example.com | Customer123! |

> ⚠️ **Cambia la contraseña del admin inmediatamente** tras el primer login en `/auth/login`.

---

## 6. Actualizar la aplicación

1. Haz push del código al repositorio.
2. En Dokploy → haz clic en **Redeploy**.

Dokploy reconstruirá la imagen, correrá las migraciones nuevas y reiniciará solo el contenedor `app` sin tocar la base de datos.

**Forzar rebuild sin caché** (si hay cambios en variables `NEXT_PUBLIC_*`):

```bash
docker compose build --no-cache app
docker compose up -d app
```

---

## 7. Backups de la base de datos

### Backup manual

```bash
docker compose exec db pg_dump -U postgres hyperlogic > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore

```bash
docker compose exec -T db psql -U postgres hyperlogic < backup_20260101_120000.sql
```

### Backup automático (recomendado)

Configura un cron en el servidor:

```bash
# /etc/cron.d/hyperlogic-backup
0 3 * * * root cd /path/to/project && \
  docker compose exec -T db pg_dump -U postgres hyperlogic \
  | gzip > /backups/hyperlogic_$(date +\%Y\%m\%d).sql.gz
```

---

## 8. Solución de problemas

### El contenedor `app` se reinicia en loop

**Causa más común:** La DB no está lista o las variables de entorno faltan.

```bash
# Ver logs
docker compose logs app --tail=50

# Comprobar healthcheck de la DB
docker compose ps db
```

### Error: `DATABASE_URL is required`

La variable `POSTGRES_PASSWORD` no está definida. Verifica el `.env` o la configuración de entorno en Dokploy.

### Error: `NEXTAUTH_SECRET is required`

Genera el secreto y agrégalo:
```bash
openssl rand -base64 32
```

### Las imágenes de la tienda no cargan

Si usas Cloudinary, asegúrate de tener las 3 variables de Cloudinary configuradas.  
Las URLs de imágenes externas (`unsplash.com`, `placehold.co`) están permitidas en `next.config.js`.

### Error de Prisma: `Migration engine error`

```bash
# Conectar manualmente y ver estado de migraciones
docker compose exec app node node_modules/prisma/build/index.js migrate status
```

### Puerto 3000 en conflicto

Define un puerto diferente en el `.env`:
```env
PORT=3100
```

---

## 9. Construcción local para pruebas

Antes de hacer deploy, verifica que la imagen construye correctamente:

```bash
# Crea un .env con tus valores de prueba
cp .env.production.example .env
# Edita .env ...

# Construir y levantar
docker compose up --build

# Abrir http://localhost:3000
```

Para limpiar completamente (incluyendo base de datos):

```bash
docker compose down -v
```

---

## Estructura de archivos de despliegue

```
Sekaitech_2.0/
├── Dockerfile                    # Build multi-stage (4 etapas)
├── docker-compose.yml            # Orquestación app + db
├── .dockerignore                 # Excluye node_modules, .next, .env
├── .env.production.example       # Plantilla de variables de entorno
├── scripts/
│   └── docker-entrypoint.sh     # Arranca migraciones + servidor
└── next.config.js                # output: 'standalone' habilitado
```

---

*Última actualización: marzo 2026*
