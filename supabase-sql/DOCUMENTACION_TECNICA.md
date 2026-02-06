# SmartDash FV - Documentación Técnica de Base de Datos

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Datos](#arquitectura-de-datos)
3. [Guía de Implementación](#guía-de-implementación)
4. [Modelo de Datos](#modelo-de-datos)
5. [Seguridad y Row-Level Security](#seguridad-y-row-level-security)
6. [Integración con Frontend](#integración-con-frontend)
7. [Optimización y Performance](#optimización-y-performance)
8. [Mantenimiento y Escalabilidad](#mantenimiento-y-escalabilidad)

---

## Resumen Ejecutivo

**SmartDash FV** es una plataforma de detección, análisis y mitigación de riesgos empresariales basada en PostgreSQL y diseñada para Supabase.

### Características Clave

✅ **Multi-tenant**: Soporte para múltiples clientes aislados
✅ **Scoring dinámico**: Puntajes de 0-100 con niveles de riesgo
✅ **Tiempo real**: Capturas de riesgo con contexto financiero en JSONB
✅ **Historización**: Persistencia completa de análisis temporales
✅ **Planes accionables**: Sistema de mitigación con seguimiento de progreso

### Métricas del Sistema

- **5 Tablas principales** con relaciones FK consistentes
- **16 Escenarios de riesgo** pre-cargados
- **4 Verticales de análisis**: Financiero, Operaciones, Legal, Reputación
- **4 Segmentos de cliente**: Pyme, E-commerce, Startup, Creador

---

## Arquitectura de Datos

### Diagrama de Entidad-Relación

```
┌─────────────────┐
│    clientes     │
├─────────────────┤
│ id (PK)         │
│ nombre_comercial│
│ segmento        │◄───────┐
│ metadata_negocio│        │
└─────────────────┘        │
                           │
┌──────────────────────┐   │
│ verticales_negocio   │   │
├──────────────────────┤   │
│ id (PK)              │   │
│ nombre               │   │
└──────────────────────┘   │
         │                 │
         │                 │
         ▼                 │
┌──────────────────────┐   │
│ escenarios_riesgo    │   │
├──────────────────────┤   │
│ id (PK)              │   │
│ vertical_id (FK) ────┤   │
│ titulo               │   │
│ puntaje_base         │   │
└──────────────────────┘   │
         │                 │
         │                 │
         ▼                 │
┌──────────────────────┐   │
│  capturas_riesgo     │   │
├──────────────────────┤   │
│ id (PK)              │   │
│ cliente_id (FK) ─────┼───┘
│ escenario_id (FK) ───┤
│ puntaje_global       │
│ senales (JSONB)      │
│ contexto_financiero  │
└──────────────────────┘
         │
         │
         ▼
┌──────────────────────┐
│ planes_mitigacion    │
├──────────────────────┤
│ id (PK)              │
│ captura_id (FK) ─────┤
│ pasos_accion (JSONB) │
│ responsable          │
└──────────────────────┘
```

### Flujo de Datos

1. **Onboarding**: Registro de cliente con metadata de negocio
2. **Detección**: Captura de riesgo vinculada a escenario y cliente
3. **Análisis**: Cálculo de puntaje y nivel de riesgo
4. **Acción**: Generación de plan de mitigación
5. **Seguimiento**: Actualización de estado y progreso

---

## Guía de Implementación

### Paso 1: Configuración Inicial en Supabase

1. Accede a tu proyecto de Supabase
2. Ve a **SQL Editor** (ícono de base de datos)
3. Crea un nuevo query
4. Copia y pega el contenido de `smartdash_fv_schema.sql`
5. Ejecuta el script completo (Run)

### Paso 2: Verificación

Ejecuta esta query para confirmar la instalación:

```sql
SELECT 
    'Clientes' AS tabla, COUNT(*) AS registros FROM clientes
UNION ALL
SELECT 'Verticales', COUNT(*) FROM verticales_negocio
UNION ALL
SELECT 'Escenarios', COUNT(*) FROM escenarios_riesgo
UNION ALL
SELECT 'Capturas', COUNT(*) FROM capturas_riesgo
UNION ALL
SELECT 'Planes', COUNT(*) FROM planes_mitigacion;
```

**Resultado esperado:**

```
tabla       | registros
------------|----------
Clientes    | 4
Verticales  | 4
Escenarios  | 16
Capturas    | 8
Planes      | 3
```

### Paso 3: Configurar Row-Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE capturas_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_mitigacion ENABLE ROW LEVEL SECURITY;

-- Política ejemplo: Los clientes solo ven sus propios datos
CREATE POLICY "Clientes ven solo su info"
ON clientes FOR SELECT
USING (auth.uid()::TEXT = (metadata_negocio->>'user_id'));

-- Política para capturas_riesgo
CREATE POLICY "Clientes ven solo sus riesgos"
ON capturas_riesgo FOR SELECT
USING (
    cliente_id IN (
        SELECT id FROM clientes 
        WHERE auth.uid()::TEXT = (metadata_negocio->>'user_id')
    )
);
```

### Paso 4: Configurar API en Supabase

En tu proyecto de Supabase:

1. Ve a **Settings** → **API**
2. Copia la **URL** del proyecto
3. Copia la **anon/public key**

---

## Modelo de Datos

### Tabla: `clientes`

**Propósito**: Almacenar información de clientes multi-tenant

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| id | UUID | PK | Identificador único |
| nombre_comercial | TEXT | NOT NULL | Nombre del negocio |
| razon_social | TEXT | NOT NULL | Razón social legal |
| segmento | TEXT | CHECK | Pyme, E-commerce, Startup, Creador |
| email_contacto | TEXT | NOT NULL | Email principal |
| metadata_negocio | JSONB | - | Datos adicionales flexibles |

**Ejemplo de metadata_negocio:**

```json
{
  "industria": "Tecnología financiera",
  "empleados": 18,
  "etapa": "Serie A",
  "user_id": "auth0|abc123"
}
```

### Tabla: `capturas_riesgo`

**Propósito**: Eventos de detección de riesgo con contexto completo

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| id | UUID | PK | Identificador único |
| cliente_id | UUID | FK, NOT NULL | Referencia a cliente |
| escenario_id | UUID | FK, NOT NULL | Referencia a escenario |
| puntaje_global | INTEGER | CHECK 0-100 | Scoring de riesgo |
| nivel_riesgo_actual | TEXT | CHECK | Bajo, Medio, Alto, Crítico |
| senales | JSONB | - | Señales de alerta |
| contexto_financiero | JSONB | - | Contexto monetario |
| estado_accion | TEXT | CHECK | Pendiente, En Proceso, etc. |

**Ejemplo de senales:**

```json
{
  "icono": "alert-triangle",
  "detalle": "Flujo de caja negativo por 3 meses",
  "indicadores": [
    "Cuentas por cobrar > 90 días: 42%",
    "Ratio corriente: 0.8"
  ]
}
```

**Ejemplo de contexto_financiero:**

```json
{
  "monto": 180000,
  "etiqueta": "Déficit de flujo acumulado",
  "moneda": "MXN"
}
```

### Tabla: `planes_mitigacion`

**Propósito**: Planes de acción para mitigar riesgos

**Ejemplo de pasos_accion:**

```json
[
  {
    "orden": 1,
    "accion": "Negociar con proveedores",
    "responsable": "Director Financiero",
    "plazo_dias": 3,
    "completado": false
  },
  {
    "orden": 2,
    "accion": "Activar línea de crédito",
    "responsable": "CFO",
    "plazo_dias": 5,
    "completado": true
  }
]
```

---

## Integración con Frontend

### Setup con Next.js y Supabase

#### 1. Instalación

```bash
npm install @supabase/supabase-js
```

#### 2. Cliente de Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### 3. Tipado TypeScript

```typescript
// types/database.ts
export interface Cliente {
  id: string
  nombre_comercial: string
  razon_social: string
  segmento: 'Pyme' | 'E-commerce' | 'Startup' | 'Creador'
  email_contacto: string
  telefono?: string
  metadata_negocio?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CapturaRiesgo {
  id: string
  cliente_id: string
  escenario_id: string
  puntaje_global: number
  nivel_riesgo_actual: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
  senales?: {
    icono: string
    detalle: string
    indicadores?: string[]
  }
  contexto_financiero?: {
    monto: number
    etiqueta: string
    moneda: string
  }
  texto_recomendacion?: string
  estado_accion: 'Pendiente' | 'En Proceso' | 'Completado' | 'Descartado'
  created_at: string
  updated_at: string
}
```

#### 4. Queries de Ejemplo

```typescript
// services/riesgos.ts
import { supabase } from '@/lib/supabase'

// Obtener todos los riesgos de un cliente
export async function getRiesgosCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('capturas_riesgo')
    .select(`
      *,
      escenarios_riesgo (
        titulo,
        descripcion_base,
        verticales_negocio (nombre)
      )
    `)
    .eq('cliente_id', clienteId)
    .order('puntaje_global', { ascending: false })

  if (error) throw error
  return data
}

// Obtener dashboard completo
export async function getDashboardData() {
  const { data, error } = await supabase
    .from('vista_dashboard_riesgos')
    .select('*')
    .order('Puntaje Global', { ascending: false })

  if (error) throw error
  return data
}

// Actualizar estado de una acción
export async function actualizarEstadoAccion(
  capturaId: string, 
  nuevoEstado: string
) {
  const { data, error } = await supabase
    .from('capturas_riesgo')
    .update({ estado_accion: nuevoEstado })
    .eq('id', capturaId)
    .select()

  if (error) throw error
  return data
}

// Obtener métricas agregadas
export async function getMetricasSegmento() {
  const { data, error } = await supabase
    .rpc('obtener_metricas_por_segmento')

  if (error) throw error
  return data
}
```

#### 5. Componente React de Ejemplo

```typescript
// components/DashboardRiesgos.tsx
'use client'

import { useEffect, useState } from 'react'
import { getDashboardData } from '@/services/riesgos'

interface RiesgoDashboard {
  nombre_cliente: string
  segmento: string
  vertical: string
  escenario: string
  nivel_riesgo_actual: string
  puntaje_global: number
  monto_en_riesgo: string
  texto_recomendacion: string
  estado_accion: string
}

export default function DashboardRiesgos() {
  const [riesgos, setRiesgos] = useState<RiesgoDashboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRiesgos() {
      try {
        const data = await getDashboardData()
        setRiesgos(data)
      } catch (error) {
        console.error('Error fetching riesgos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRiesgos()
  }, [])

  if (loading) return <div>Cargando...</div>

  return (
    <div className="grid gap-4">
      {riesgos.map((riesgo, idx) => (
        <div 
          key={idx} 
          className={`p-4 rounded-lg border ${
            riesgo.puntaje_global >= 85 ? 'border-red-500 bg-red-50' :
            riesgo.puntaje_global >= 70 ? 'border-orange-500 bg-orange-50' :
            'border-yellow-500 bg-yellow-50'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{riesgo.escenario}</h3>
              <p className="text-sm text-gray-600">
                {riesgo.nombre_cliente} • {riesgo.vertical}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{riesgo.puntaje_global}</div>
              <div className="text-sm">{riesgo.nivel_riesgo_actual}</div>
            </div>
          </div>
          <p className="mt-2 text-sm">{riesgo.texto_recomendacion}</p>
          <div className="mt-2 flex justify-between text-sm">
            <span className="font-medium">{riesgo.monto_en_riesgo}</span>
            <span className={`px-2 py-1 rounded ${
              riesgo.estado_accion === 'Completado' ? 'bg-green-200' :
              riesgo.estado_accion === 'En Proceso' ? 'bg-blue-200' :
              'bg-gray-200'
            }`}>
              {riesgo.estado_accion}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Optimización y Performance

### Índices Críticos

Los siguientes índices están pre-configurados para máximo rendimiento:

```sql
-- Búsquedas por cliente (muy frecuente)
CREATE INDEX idx_capturas_cliente ON capturas_riesgo(cliente_id);

-- Ordenamiento por puntaje (dashboard)
CREATE INDEX idx_capturas_puntaje ON capturas_riesgo(puntaje_global DESC);

-- Filtrado por estado
CREATE INDEX idx_capturas_estado ON capturas_riesgo(estado_accion);

-- Búsquedas en JSONB (avanzado)
CREATE INDEX idx_capturas_senales ON capturas_riesgo USING GIN (senales);
CREATE INDEX idx_capturas_contexto ON capturas_riesgo USING GIN (contexto_financiero);
```

### Query Performance Tips

1. **Usa vistas materializadas** para reportes complejos:

```sql
CREATE MATERIALIZED VIEW mv_metricas_diarias AS
SELECT 
    DATE(created_at) AS fecha,
    COUNT(*) AS total_riesgos,
    AVG(puntaje_global) AS puntaje_promedio
FROM capturas_riesgo
GROUP BY DATE(created_at);

-- Refrescar diariamente vía cron
REFRESH MATERIALIZED VIEW mv_metricas_diarias;
```

2. **Limita resultados** en frontend:

```typescript
const { data } = await supabase
  .from('capturas_riesgo')
  .select('*')
  .limit(50) // Paginación
  .range(0, 49)
```

3. **Select específico** en lugar de `SELECT *`:

```sql
-- ❌ Evitar
SELECT * FROM capturas_riesgo;

-- ✅ Mejor
SELECT id, puntaje_global, nivel_riesgo_actual, estado_accion 
FROM capturas_riesgo;
```

---

## Mantenimiento y Escalabilidad

### Backup Automático

Supabase realiza backups automáticos, pero puedes configurar tu propia estrategia:

```bash
# Backup manual
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Restore
psql -h db.xxx.supabase.co -U postgres -d postgres < backup_20240205.sql
```

### Archivado de Datos Históricos

Para mantener performance óptima, archiva capturas antiguas:

```sql
-- Crear tabla de archivo
CREATE TABLE capturas_riesgo_archivo (LIKE capturas_riesgo INCLUDING ALL);

-- Mover capturas > 1 año
INSERT INTO capturas_riesgo_archivo
SELECT * FROM capturas_riesgo
WHERE created_at < NOW() - INTERVAL '1 year'
AND estado_accion = 'Completado';

-- Eliminar de tabla principal
DELETE FROM capturas_riesgo
WHERE created_at < NOW() - INTERVAL '1 year'
AND estado_accion = 'Completado';
```

### Monitoreo de Crecimiento

```sql
-- Tamaño de tablas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Conteo de registros
SELECT 
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Alertas Automáticas

Configura alertas para riesgos críticos:

```sql
-- Función para enviar notificación
CREATE OR REPLACE FUNCTION notificar_riesgo_critico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nivel_riesgo_actual = 'Crítico' AND NEW.puntaje_global >= 90 THEN
        PERFORM pg_notify(
            'riesgo_critico',
            json_build_object(
                'captura_id', NEW.id,
                'cliente_id', NEW.cliente_id,
                'puntaje', NEW.puntaje_global
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_notificar_critico
AFTER INSERT OR UPDATE ON capturas_riesgo
FOR EACH ROW
EXECUTE FUNCTION notificar_riesgo_critico();
```

---

## Seguridad y Mejores Prácticas

### Checklist de Seguridad

- [x] RLS habilitado en tablas sensibles
- [x] Constraints en campos críticos
- [x] UUIDs en lugar de integers secuenciales
- [x] JSONB validado en aplicación
- [x] Triggers para `updated_at`
- [x] Índices en columnas FK
- [x] Backup automático configurado

### Variables de Entorno Recomendadas

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Solo backend
DATABASE_URL=postgresql://...  # Para migraciones
```

---

## Próximos Pasos

### Fase 2: Funcionalidades Avanzadas

1. **Sistema de notificaciones**
   - Webhooks para eventos críticos
   - Emails automáticos vía Supabase Edge Functions

2. **Machine Learning**
   - Predicción de riesgos con histórico
   - Scoring automatizado

3. **Integraciones**
   - Conectores con ERP/CRM
   - API pública para partners

4. **Analytics**
   - Dashboard ejecutivo con métricas KPI
   - Exportación a Power BI / Tableau

---

## Soporte y Recursos

- **Documentación Supabase**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Next.js + Supabase**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Autor**: SmartDash FV Team
