# Pita Express - Admin Panel

Sistema de administración para Pita Express, una empresa de logística internacional especializada en envíos entre China y Venezuela.

## 🏗️ Estructura del Proyecto

### 📁 Organización de Carpetas

```
project/
├── app/                                # App Router de Next.js
│   ├── layout.tsx                      # Layout raíz
│   ├── globals.css                     # Estilos globales
│   ├── page.tsx                        # Dashboard principal (ruta /)
│   ├── login-register/                 # Flujo de autenticación (UI)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── AuthPage.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── PasswordReset/
│   │       ├── PasswordReset.tsx
│   │       └── FormPanel.tsx
│   ├── pedidos/                        # Página de pedidos (ruta /pedidos)
│   │   └── page.tsx
│   ├── tracking/                       # Placeholder de tracking (ruta /tracking)
│   │   └── page.tsx
│   ├── alertas/                        # Placeholder de alertas (ruta /alertas)
│   │   └── page.tsx
│   ├── validacion-pagos/               # Placeholder de validación de pagos (ruta /validacion-pagos)
│   │   └── page.tsx
│   ├── reportes/                       # Placeholder de reportes (ruta /reportes)
│   │   └── page.tsx
│   ├── usuarios/                       # Placeholder de usuarios (ruta /usuarios)
│   │   └── page.tsx
│   ├── configuracion/                  # Placeholder de configuración (ruta /configuracion)
│   └── styles/
│       └── auth/
│           ├── AuthPage.css
│           └── PasswordReset.css
├── components/                         # Componentes React
│   ├── auth/
│   │   └── AnimatedPanel.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── WorkflowSection.tsx
│   │   ├── RecentOrders.tsx
│   │   └── QuickActions.tsx
│   ├── orders/                         # (vacío)
│   └── ui/                             # Componentes shadcn/ui + comunes
│       ├── common/
│       │   ├── PitaLogo.tsx
│       │   └── VenezuelaFlag.tsx
│       └── ...                         # botones, cards, select, etc.
├── lib/                                # Utilidades y configuraciones
│   ├── constants/
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   └── navigation.ts
│   ├── types/
│   │   ├── dashboard.ts
│   │   └── navigation.ts
│   ├── hooks/                          # (vacío)
│   ├── services/                       # (vacío)
│   ├── validations/                    # (vacío)
│   └── utils.ts
├── hooks/
│   └── use-toast.ts
├── public/                             # Archivos estáticos
│   ├── animations/
│   │   ├── login.json
│   │   ├── Register.json
│   │   └── Success.json
│   ├── images/
│   │   ├── background.jpg
│   │   ├── escudo.gif
│   │   └── logos/
│   │       ├── pita_logo.png
│   │       ├── pita_logo.svg
│   │       └── PitaSinFondo.svg
│   └── videos/
│       └── wait.mp4
├── UsuarioP-front/                     # App React separada (cliente)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

## 🚀 Tecnologías Utilizadas

- **Node.js 20.19.4** - Runtime de JavaScript
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Iconos
- **React Hooks** - Gestión de estado

## 🎯 Características Implementadas

### 📊 Dashboard
- **Estadísticas básicas** - Total de pedidos, pendientes, completados y en tránsito
- **Flujo de trabajo visual** - Seguimiento del proceso de pedidos con 8 pasos
- **Pedidos recientes** - Lista de pedidos con progreso y ETA
- **Acciones rápidas** - Botones para crear nuevos pedidos (China/Vzla)

### 🧭 Navegación
- **Sidebar funcional** - Navegación principal con expansión/contracción automática
- **Dashboard en ruta raíz** - Acceso directo a `/` para el dashboard
- **Página de pedidos** - Gestión completa de pedidos con filtros y paginación
- **Transiciones básicas** - Animaciones simples entre páginas

### 🎨 Diseño
- **Gradientes modernos** - Diseño visual atractivo con efectos glassmorphism
- **Animaciones básicas** - Transiciones y efectos visuales optimizados
- **Tema consistente** - Paleta de colores unificada (azul, naranja, verde, gris)
- **Iconografía** - Iconos Lucide React con colores específicos por estado

## 🔧 Configuración del Proyecto

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```

### Construcción
```bash
npm run build
```

## 📋 Mejores Prácticas Implementadas

### 🏗️ Arquitectura
- **Separación de responsabilidades** - Componentes modulares y reutilizables
- **Tipos TypeScript** - Definición clara de interfaces y tipos
- **Constantes centralizadas** - Datos y configuraciones organizadas en `/lib/constants`
- **Dashboard integrado** - Página principal con sidebar incluido
- **Rutas simplificadas** - Dashboard directamente en `/`
- **Componentes shadcn/ui** - Biblioteca completa de componentes UI

### 🎯 Componentes
- **Componentes específicos** - Cada funcionalidad tiene su componente
- **Props tipadas** - Interfaces claras para props
- **Reutilización** - Componentes modulares y flexibles
- **Composición** - Uso de composición sobre herencia

### 🎨 Estilos
- **Tailwind CSS** - Utilidades CSS consistentes y responsive
- **Animaciones optimizadas** - Transiciones de 200ms con ease-out
- **Accesibilidad básica** - Consideraciones básicas de UX/UI
- **Glassmorphism** - Efectos de transparencia y blur

## 🚀 Próximas Mejoras

- [ ] Implementar diseño responsive completo
- [ ] Agregar páginas faltantes (tracking, chat, reportes, clientes, documentos, configuración)
- [ ] Agregar autenticación
- [ ] Implementar base de datos
- [ ] Sistema de notificaciones en tiempo real
- [ ] Reportes avanzados
- [ ] Entre otros

## 👥 Asignación de Tareas

### María — Dashboard y Pedidos
- **Dashboard**
  - **Acciones Rápidas**:
    - "Nuevo Pedido (China)": abrir interfaz de creación de pedido al detal.
    - "Nuevo Pedido (Vzla)": abrir interfaz de creación de pedido al por mayor.
    - "Avanzar Todos los Pedidos": avanzar todos los pedidos activos a la siguiente etapa del flujo (como en el index de Morna / propuesta de Vicky).
- **Pedidos**
  - **Interactividad**:
    - "Ver": navegar a la página de detalles del pedido.
    - "Exportar": descargar la lista de pedidos.

### Marí V — Tracking y Alertas
- **Tracking**
  - Página/panel con búsqueda por código de tracking.
  - Historial detallado de movimientos (fechas, ubicaciones, eventos clave).
- **Alertas**
  - Panel/lista de alertas críticas (p. ej. pedidos fuera de SLA).
  - Contador de alertas pendientes en el ítem del sidebar.

### Stefano — Validación de Pagos y Reportes
- **Validación de Pagos**: listado de pagos pendientes con acciones Aprobar/Rechazar; vista de auditoría de pagos realizados hacia China.
- **Reportes**: selector de tipo (por mes, por empleado, por estado); resultados con gráficos/tablas.

### Luis — Usuarios y Configuración
- **Usuarios**: tabla de empleados; formulario para crear/editar/suspender; asignación de roles y niveles de acceso.
- **Configuración**: formularios para parámetros del negocio (costos de envío, porcentajes, valor del dólar, descuentos); botón “modo oscuro” deshabilitado por ahora.

### Daniela
- Próximas asignaciones.

---

> [!IMPORTANT]
> RECUERDEN PASAR ANTES DE PEDIRLE ALGO A LA IA EL ARCHIVO `contexto.txt` (está en la raíz del proyecto).
> PARA EJECUTAR EL PROGRAMA SE UTILIZA NPM RUN DEV

> [!NOTE]
> Activos estáticos: todas las imágenes, animaciones y videos deben colocarse en `public/` (por ejemplo, `public/images`, `public/animations`, `public/videos`).

> [!TIP]
> Si necesitan ayuda en algo, no duden en avisarme ;D ¡Ustedes pueden!

