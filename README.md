# MornaProject (Panel de Gestión y Cliente)

Aplicación Next.js (App Router) para gestionar pedidos y operaciones entre China y Venezuela con áreas para Administrador, Venezuela, China y Cliente. Incluye autenticación, configuración unificada, seguimiento, reportes y flujos de pedido con animaciones.

## 🚀 Características principales
- Autenticación y post-registro con inicialización de rol (`/api/auth/after-signup`).
- Paneles por rol: Admin, Venezuela, China y Cliente.
- Pedidos: creación, listado con paginación, búsqueda y acciones (incluye modales y animaciones de éxito).
- Reportes y validación de pagos (Venezuela).
- Tracking para clientes.
- Configuración unificada y compartida (tema, idioma, perfil y avatar con Supabase Storage), con confirmación al eliminar foto.
- i18n básico (ES/EN/ZH) con selector de idioma y banderas.
- Realtime (Supabase) para actualizaciones en tiempo real en áreas clave.

## 🧱 Tecnologías
- Next.js 13 App Router, React 18, TypeScript
- Tailwind CSS + shadcn/ui (Radix) + lucide-react
- Supabase (auth, Realtime, Storage)
- Lottie para animaciones

## � Requisitos previos
- Node.js 18+ (recomendado 20+)
- Variables de entorno de Supabase configuradas (ver sección .env)

## ⚙️ Configuración y ejecución
1) Instalar dependencias
```bash
npm install
```
2) Variables de entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # solo en entorno servidor
```
3) Desarrollo
```bash
npm run dev
```
4) Producción
```bash
npm run build
npm start
```

## � Estructura de carpetas (resumen)
```
app/
  layout.tsx, page.tsx, error.tsx, not-found.tsx, global-error.tsx
  login-register/           # Login, registro, reset de contraseña
  admin/                    # Área Admin (pedidos, usuarios, alertas, etc.)
  china/                    # Área China
  venezuela/                # Área Venezuela (reportes, validación de pagos, etc.)
  cliente/                  # Área Cliente (dashboard, mis-pedidos, pagos, tracking)
  api/                      # Rutas API internas (auth/after-signup, admin/orders, etc.)
components/
  ui/                       # shadcn/ui y utilitarios de UI
  layout/                   # Header, Sidebar, theme provider
  alertas/, tracking/, dashboard/, venezuela/, china/, auth/
  shared/configuration/     # Configuración unificada por rol
hooks/                      # Hooks de datos y realtime (admin/china/venezuela/cliente)
lib/
  supabase/                 # Clientes Supabase (browser/server)
  translations/             # i18n (es.json, en.json, zk.json)
  constants/, types/, utils.ts, contexts (Admin/China/Client/Vzla)
public/
  images/, animations/, videos/
styles/
  auth/                     # Estilos específicos para auth
```

## 🔑 Detalles clave
- Configuración unificada: `components/shared/configuration/ConfigurationContent.tsx` maneja avatar (upload/delete con confirmación), idioma, tema y datos de perfil. Reutilizada en Admin/China/Venezuela/Cliente.
- Flujo de nuevo pedido (Admin y Cliente) con animación de éxito al finalizar.
- Paginación en listados (Admin/Venezuela/China/Cliente) y modal cuando falta PDF.
- Endpoint post-registro: `app/api/auth/after-signup/route.ts` (migrado a ruta canónica). 

## 🧹 Limpieza reciente (organización)
- Eliminados mocks, rutas y componentes no utilizados (por ejemplo: `app/other/*`, `components/RealtimeTest.tsx`, API `order-pdf` obsoleta).
- Unificación de configuración y correcciones de i18n.

## 🔍 Consejos de desarrollo
- Preferir `next/image` sobre `<img>` donde sea posible.
- Mantener dependencias de React hooks actualizadas en efectos y callbacks.
- Agregar pruebas ligeras para flujos críticos si se amplía el proyecto.

## ❓ Troubleshooting
- Si el avatar no se actualiza: verificar permisos de bucket en Supabase y claves de entorno.
- Si falla el post-registro: revisar `SUPABASE_SERVICE_ROLE_KEY` y que la tabla `userlevel` exista.
- Realtime: confirmar políticas RLS y suscripciones en canales.

## 📜 Licencia
Privado (uso interno del proyecto).

