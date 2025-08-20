# Páginas de Error - Morna Project

## 📋 Descripción General

Se han implementado páginas de error modernas y animadas para mejorar la experiencia del usuario cuando ocurren errores en la aplicación. Todas las páginas incluyen:

- **Diseño moderno** con glassmorphism y gradientes
- **Animaciones fluidas** de entrada y salida
- **Responsive design** para todos los dispositivos
- **Modo oscuro/claro** automático
- **Navegación intuitiva** con botones de acción
- **Información útil** para debugging (solo en desarrollo)

## 🎨 Páginas Implementadas

### 1. **404 - Página No Encontrada**
**Archivo:** `app/not-found.tsx`

**Características:**
- Código de error 404 animado
- Icono de alerta con animación bounce
- Partículas flotantes animadas
- Botones: Volver Atrás, Ir al Inicio, Recargar
- Sección de ayuda con contacto directo
- Indicadores de estado animados

**Uso automático:** Se muestra cuando Next.js no encuentra una ruta

### 2. **Error General (500, etc.)**
**Archivo:** `app/error.tsx`

**Características:**
- Detección automática del tipo de error (red, servidor, cliente)
- Iconos específicos según el tipo de error
- Detalles del error solo en desarrollo
- Botones: Intentar Nuevamente, Volver Atrás, Ir al Inicio
- Sección de ayuda con soporte y reporte de errores
- Indicadores de estado del equipo técnico

**Uso automático:** Se muestra cuando ocurre un error en cualquier página

### 3. **Error Crítico Global**
**Archivo:** `app/global-error.tsx`

**Características:**
- Para errores que afectan toda la aplicación
- Icono crítico con animación pulse
- Contacto urgente por email y WhatsApp
- Botones: Intentar Recuperar, Recargar Aplicación
- Información técnica detallada
- Footer con ID de error y timestamp

**Uso automático:** Se muestra para errores críticos del sistema

### 4. **403 - Acceso Denegado**
**Archivo:** `app/unauthorized/page.tsx`

**Características:**
- Icono de candado con animación
- Código de error 403
- Botones: Iniciar Sesión, Volver Atrás, Ir al Inicio
- Consejos de seguridad
- Solicitud de acceso
- Indicadores de verificación

**Uso manual:** Navegar a `/unauthorized`

## 🔧 Componentes de Utilidad

### ErrorBoundary
**Archivo:** `components/ui/error-boundary.tsx`

**Características:**
- Captura errores en componentes React
- Fallback personalizable
- Detalles del error en desarrollo
- Botones de recuperación

**Uso:**
```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

<ErrorBoundary>
  <ComponenteQuePuedeFallar />
</ErrorBoundary>
```

### useErrorHandler Hook
**Características:**
- Hook para manejar errores en componentes funcionales
- Estado de error y funciones de manejo
- Reset automático del error

**Uso:**
```tsx
import { useErrorHandler } from '@/components/ui/error-boundary';

const { error, handleError, resetError } = useErrorHandler();

// En un try-catch
try {
  // código que puede fallar
} catch (err) {
  handleError(err);
}
```

### SimpleErrorFallback
**Características:**
- Componente de error simple y reutilizable
- Diseño compacto
- Botón de reintento

**Uso:**
```tsx
import { SimpleErrorFallback } from '@/components/ui/error-boundary';

<ErrorBoundary fallback={<SimpleErrorFallback error={error} resetError={resetError} />}>
  <Componente />
</ErrorBoundary>
```

## 🎯 Características Técnicas

### Animaciones
- **Entrada:** Fade-in con slide y scale
- **Partículas:** Flotación con rotación
- **Iconos:** Pulse, bounce, scale
- **Botones:** Hover effects con transform
- **Transiciones:** Suaves y fluidas

### Colores y Temas
- **404:** Azul, púrpura, índigo
- **Error General:** Rojo, naranja, amarillo
- **Error Crítico:** Rojo intenso
- **403:** Púrpura, índigo, azul
- **Modo oscuro:** Automático

### Responsive Design
- **Mobile:** Stack vertical de botones
- **Tablet:** Layout adaptativo
- **Desktop:** Layout horizontal optimizado
- **Breakpoints:** Tailwind CSS estándar

## 🚀 Implementación en el Proyecto

### 1. **Configuración Automática**
Las páginas de error se activan automáticamente:
- `not-found.tsx` → Errores 404
- `error.tsx` → Errores de página
- `global-error.tsx` → Errores críticos

### 2. **Uso Manual**
Para errores específicos:
```tsx
// Redirigir a página 403
router.push('/unauthorized');

// Lanzar error para probar
throw new Error('Error de prueba');
```

### 3. **Personalización**
Cada página puede personalizarse:
- Colores y gradientes
- Mensajes y textos
- Botones y acciones
- Animaciones y efectos

## 📱 Experiencia de Usuario

### Flujo de Recuperación
1. **Usuario encuentra error** → Página de error moderna
2. **Información clara** → Explicación del problema
3. **Opciones de acción** → Botones intuitivos
4. **Ayuda disponible** → Contacto directo
5. **Recuperación exitosa** → Vuelta a la normalidad

### Beneficios
- **Reducción de frustración** → Diseño amigable
- **Información útil** → Contexto del error
- **Recuperación rápida** → Botones de acción
- **Soporte directo** → Contacto inmediato
- **Branding consistente** → Identidad visual

## 🔍 Monitoreo y Debugging

### Información de Desarrollo
- **Detalles del error** → Stack trace completo
- **ID de error** → Para tracking
- **Timestamp** → Cuándo ocurrió
- **Contexto** → Información adicional

### Producción
- **Información mínima** → Sin detalles técnicos
- **Contacto directo** → Soporte disponible
- **Recuperación guiada** → Pasos claros

## 🎨 Personalización Avanzada

### Modificar Colores
```tsx
// En cualquier página de error
<div className="bg-gradient-to-br from-[tu-color-1] via-[tu-color-2] to-[tu-color-3]">
```

### Agregar Animaciones
```tsx
// Nuevas animaciones CSS
<style jsx>{`
  @keyframes tuAnimacion {
    // Definir animación
  }
`}</style>
```

### Personalizar Mensajes
```tsx
// Cambiar textos según el contexto
const mensajePersonalizado = "Mensaje específico para tu caso";
```

## 📞 Soporte y Contacto

### Información de Contacto
- **Email:** soporte@morna.com
- **WhatsApp:** +58 412 123 4567
- **Horarios:** Lunes a Viernes 8:00 AM - 6:00 PM

### Reporte de Errores
- **Desarrollo:** Detalles completos en consola
- **Producción:** Formulario de contacto
- **Urgente:** WhatsApp directo

---

**Nota:** Estas páginas de error están diseñadas para proporcionar una experiencia de usuario excepcional incluso en situaciones de error, manteniendo la identidad visual y funcionalidad de la aplicación Morna. 