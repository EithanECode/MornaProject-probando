# Pita Express - Admin Panel

Sistema de administración para Pita Express, una empresa de logística internacional especializada en envíos entre China y Venezuela.

## 🏗️ Estructura del Proyecto

### 📁 Organización de Carpetas

```
project/
├── app/                          # App Router de Next.js 13+
│   ├── page.tsx                 # Dashboard principal (ruta /)
│   ├── pedidos/                 # Página de pedidos
│   ├── globals.css              # Estilos globales
│   └── layout.tsx               # Layout raíz
├── components/                   # Componentes React
│   ├── layout/                  # Componentes de layout
│   │   ├── Sidebar.tsx          # Barra lateral de navegación
│   │   └── Header.tsx           # Encabezado del dashboard
│   ├── dashboard/               # Componentes específicos del dashboard
│   │   ├── StatsCards.tsx       # Tarjetas de estadísticas
│   │   ├── WorkflowSection.tsx  # Sección del flujo de trabajo
│   │   ├── RecentOrders.tsx     # Pedidos recientes
│   │   └── QuickActions.tsx     # Acciones rápidas
│   ├── orders/                  # Componentes de pedidos (vacío)
│   ├── ui/                      # Componentes de UI reutilizables
│   │   ├── common/              # Componentes comunes
│   │   │   ├── PitaLogo.tsx     # Logo de la empresa
│   │   │   └── VenezuelaFlag.tsx # Bandera de Venezuela
│   │   ├── forms/               # Componentes de formularios (vacío)
│   │   ├── data-display/        # Componentes de visualización (vacío)
│   │   └── [shadcn/ui]          # Componentes de shadcn/ui (completos)
├── lib/                         # Utilidades y configuraciones
│   ├── types/                   # Tipos TypeScript
│   │   ├── dashboard.ts         # Tipos del dashboard
│   │   └── navigation.ts        # Tipos de navegación
│   ├── constants/               # Constantes de la aplicación
│   │   ├── dashboard.ts         # Datos del dashboard
│   │   └── navigation.ts        # Configuración de navegación
│   ├── utils.ts                 # Funciones utilitarias
│   ├── hooks/                   # Custom hooks (vacío)
│   ├── services/                # Servicios y APIs (vacío)
│   └── validations/             # Validaciones (vacío)
├── hooks/                       # Hooks globales
└── public/                      # Archivos estáticos
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

1. María: Dashboard y Pedidos

   - Dashboard
     - Hacer que los botones de "Acciones Rápidas" funcionen:
       - "Nuevo Pedido (China)"
       - "Nuevo Pedido (Vzla)"
       - "Avanzar Todos los Pedidos" //Así como en el index que nos paso Morna o como lo hizo Vicky xd

   - Pedidos
     - Hacer que la tabla sea interactiva y funcional:
       - Al hacer clic en "Ver": Navegar a la página de detalles de ese pedido.
       - Botón "Exportar": Debe implementar la funcionalidad para descargar la lista de pedidos.

2. Marí V: Tracking y Alertas

   - Tracking
     - Propósito: Una herramienta para verificar el seguimiento logístico en detalle.
     - Tareas de Front-end:
       - Diseñar una interfaz que muestre un historial detallado del movimiento de un paquete, incluyendo fechas, ubicaciones y eventos clave.

   - Alertas
     - Propósito: Un sistema para notificar al Master sobre problemas que requieren atención inmediata.
     - Tareas de Front-end:
       - Crear un panel o lista que muestre las alertas críticas, como los pedidos no respondidos a tiempo.
       - Implementar un contador de alertas pendientes en el ítem del sidebar para una visibilidad inmediata.

3. Stefano: Validación de Pagos y Reportes

   - Validación de Pagos
     - Propósito: Supervisar y auditar el proceso de pagos.
     - Tareas de Front-end:
       - Construir una interfaz que muestre todos los pagos pendientes de validación, con botones para aprobar o rechazar cada uno.
       - Crear una vista para auditar y ver los pagos que han sido registrados hacia China.

   - Reportes
     - Propósito: Generar reportes para el análisis de la operación.
     - Tareas de Front-end:
       - Diseñar una interfaz donde el Master pueda seleccionar diferentes tipos de reportes (por mes, por empleado, por estado de pedidos).
       - Implementar una vista que muestre los resultados de estos reportes, posiblemente usando gráficos o tablas.

4. Luis: Usuarios y Configuración

   - Usuarios
     - Propósito: Gestionar a los empleados y sus accesos.
     - Tareas de Front-end:
       - Crear una tabla que liste a todos los empleados del sistema.
       - Desarrollar un formulario para crear, editar o suspender usuarios, y asignar sus roles y niveles de acceso.

   - Configuración
     - Propósito: El centro para definir las reglas y parámetros del negocio.
     - Tareas de Front-end:
       - Construir una interfaz con formularios para que el Master pueda definir y actualizar los parámetros clave, como los costos de envío y los porcentajes de ganancia.
       - Agregar un botón para cambiar a modo oscuro, pero que por los momentos no tenga ninguna funcionalidad activa. A la IA se le debe especificar que no implemente la funcionalidad aún, ya que después se modificarán otros archivos para hacerla funcional.

5. Daniela

   - Rol: Próximamente se le asignarán tareas.

6. Integración

   - Mi rol: Me encargaré de unir todas las páginas, adaptarlas y solucionar los problemas del sidebar y de la navegación entre ellas.

