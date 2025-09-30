# 🪙 Instrucciones para Activar la Tasa de Binance P2P

## 🎯 ¿Qué se implementó?

Se agregó un **sistema completo** para obtener la tasa de cambio **USDT → VES** desde **Binance P2P** usando la API de **Monitor Venezuela**.

---

## 🚀 Paso 1: Ejecutar SQL en Supabase

1. Ve a tu **dashboard de Supabase**
2. Navega a **SQL Editor** (en el menú lateral)
3. Copia y pega el contenido completo del archivo:
   ```
   sql/create_exchange_rates_binance_table.sql
   ```
4. Haz clic en **"Run"** para ejecutar el SQL

### ✅ ¿Qué hace el SQL?
- Crea la tabla `exchange_rates_binance`
- Configura índices para performance
- Establece políticas de seguridad (RLS)
- Crea funciones SQL útiles
- Inserta una tasa inicial por defecto (42.00 VES/USDT)

---

## 🎨 Paso 2: Verifica la Interfaz

Después de ejecutar el SQL, reinicia tu aplicación:

```bash
npm run dev
```

Luego ve a:
```
/admin/gestion → Tab "Financiero"
```

### 📊 Verás el nuevo layout:

**Primera Fila:**
- 🇻🇪 Tasa Venezuela (USD → Bs)
- 🇨🇳 Tasa China (USD → CNY)

**Segunda Fila:** ← **NUEVO**
- 🪙 **Tasa Binance** (USDT → VES)
- 💰 **Margen de Ganancia** (movido aquí)

---

## 🔧 Funcionalidades de la Tasa Binance

### ✅ Auto-actualización
- **Switch ON** → Campo bloqueado, actualiza automáticamente cada 30 min
- **Switch OFF** → Campo desbloqueado, edición manual

### ✅ Actualización Manual
- Botón **⟳** (negro) para refrescar la tasa manualmente
- Muestra toast con la tasa actualizada

### ✅ Indicadores
- 📶 **Wi-Fi verde**: Auto-actualización activa
- 📶 **Wi-Fi gris**: Modo manual
- ⏰ **Badge naranja**: Tiempo desde última actualización
- 📊 **Fuente**: Muestra de dónde viene la tasa

---

## 🌐 Fuentes de Datos (en orden de prioridad)

1. **Monitor Venezuela API** (principal)
   - Endpoint: `https://monitorvenezuela.com/api/binance`
   - Datos: Tasas reales de Binance P2P Venezuela

2. **AirTM API** (fallback)
   - Si Monitor Venezuela falla
   - Endpoint: `https://rates.airtm.com/api/v1/rates`

3. **Base de Datos** (último recurso)
   - Usa última tasa válida guardada (< 24 horas)
   - Muestra advertencia con antigüedad

4. **Tasa por defecto** (emergencia)
   - Solo si todo lo demás falla
   - Valor: 42.00 VES/USDT

---

## 📊 ¿Cómo se usa la tasa?

La tasa de Binance se guarda en la configuración global y se puede usar en:

- **Cálculo de precios en bolívares** (alternativa al BCV)
- **Comparación de tasas** (BCV vs Binance)
- **Reportes financieros**
- **Dashboard de estadísticas**

---

## 🗄️ Historial en Supabase

Toda actualización de tasa se guarda en la tabla `exchange_rates_binance`:

### Consultar historial:
```sql
-- Ver últimas 20 tasas
SELECT * FROM get_binance_rate_history(20, false);

-- Ver solo tasas válidas (no fallback)
SELECT * FROM get_binance_rate_history(20, true);

-- Ver tasa más reciente válida
SELECT * FROM get_latest_valid_binance_rate();
```

---

## 🔍 Datos que se guardan:

| Campo | Descripción |
|-------|-------------|
| `rate` | Tasa USDT → VES |
| `source` | Monitor Venezuela / AirTM / Manual |
| `timestamp` | Fecha y hora de la tasa |
| `is_fallback` | Si es fallback (true/false) |
| `metadata` | Info adicional (errores, warnings, etc.) |

---

## 🎯 Panel de Resumen

El panel de resumen ahora muestra **6 tarjetas**:

1. 🚁 Envío Aéreo
2. 🚢 Envío Marítimo  
3. 🇻🇪 USD → Bs (BCV)
4. 🇨🇳 USD → CNY
5. 🪙 USDT → VES (Binance) ← **NUEVO**
6. 💰 Margen de Ganancia

---

## ⚙️ Configuración en `/api/config`

La API de configuración ahora también guarda:
- `binance_rate` (decimal)
- `auto_update_binance_rate` (boolean)

---

## 🧪 Probar Manualmente

### 1. Activar auto-actualización:
- Ve a `/admin/gestion`
- Tab "Financiero"
- En "Tasa Binance", activa el switch
- Espera unos segundos y verás la tasa actualizada

### 2. Actualización manual:
- Desactiva el switch
- Haz clic en el botón ⟳
- Verás un toast con la nueva tasa

### 3. Edición manual:
- Desactiva el switch
- Escribe una tasa manualmente
- Se guardará automáticamente en 1.5 segundos

---

## 🚨 Solución de Problemas

### ❌ **Error: "No se pudo obtener tasa"**
**Solución**: Verifica que ejecutaste el SQL en Supabase

### ❌ **Error: "Monitor Venezuela no responde"**
**Solución**: El sistema usará automáticamente el fallback (última tasa guardada)

### ❌ **Campo siempre bloqueado**
**Solución**: Desactiva el switch de auto-actualización

### ❌ **No se guarda la configuración**
**Solución**: Haz clic en "Guardar Configuración" en el header

---

## 📈 Beneficios

✅ **Tasa más real**: Binance P2P refleja el mercado negro real de Venezuela  
✅ **Comparación**: Puedes comparar BCV vs Binance  
✅ **Historial completo**: Todas las tasas se guardan para análisis  
✅ **Fallback robusto**: Nunca te quedas sin tasa  
✅ **Auto-actualización**: Siempre datos frescos  
✅ **UI consistente**: Mismo diseño que las otras tasas  

---

## 🎉 ¡Listo!

Ejecuta el SQL en Supabase y recarga la aplicación. La nueva tasa de Binance estará funcionando automáticamente.

**¿Dudas o problemas?** Revisa los logs en la consola del navegador (F12).
