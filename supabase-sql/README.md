# 🚀 SmartDash FV - Base de Datos PostgreSQL/Supabase

## Plataforma de Detección, Análisis y Mitigación de Riesgos Empresariales

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-Compatible-green.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)

---

## 📦 Contenido del Proyecto

Este repositorio contiene el **schema completo** y las **consultas optimizadas** para SmartDash FV:

```
📁 smartdash-fv-database/
├── 📄 smartdash_fv_schema.sql          # Schema completo con datos de prueba
├── 📄 smartdash_fv_queries.sql         # Consultas para dashboard y reportes
├── 📄 DOCUMENTACION_TECNICA.md         # Documentación técnica completa
└── 📄 README.md                        # Este archivo
```

---

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Pre-requisitos

- Cuenta de [Supabase](https://supabase.com) (gratis)
- Proyecto creado en Supabase

### 2️⃣ Instalación

1. **Accede a tu proyecto de Supabase**
   - Ve a SQL Editor (ícono de base de datos en la barra lateral)

2. **Ejecuta el schema**
   - Crea un nuevo query
   - Copia todo el contenido de `smartdash_fv_schema.sql`
   - Presiona **Run** o `Ctrl/Cmd + Enter`

3. **Verifica la instalación**
   
   Ejecuta esta query:
   
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
   
   | tabla | registros |
   |-------|-----------|
   | Clientes | 4 |
   | Verticales | 4 |
   | Escenarios | 16 |
   | Capturas | 8 |
   | Planes | 3 |

### 3️⃣ Prueba el Dashboard

Ejecuta esta consulta para ver los datos del dashboard:

```sql
SELECT * FROM vista_dashboard_riesgos;
```

¡Listo! 🎉 Tu base de datos está lista para usar.

---

## 🎯 Características Principales

### ✨ Multi-Tenant
- Soporte para múltiples clientes aislados
- 4 segmentos: **Pyme**, **E-commerce**, **Startup**, **Creador**

### 📊 Scoring Dinámico
- Puntajes de **0 a 100**
- Niveles: Bajo, Medio, Alto, **Crítico**
- Cálculo en tiempo real

### 🔍 Detección Inteligente
- **16 escenarios de riesgo** pre-configurados
- **4 verticales**: Financiero, Operaciones, Legal, Reputación
- Contexto financiero en JSONB para máxima flexibilidad

### 📋 Planes de Acción
- Planes de mitigación con pasos detallados
- Seguimiento de progreso
- Responsables y fechas límite

### 🚀 Performance Optimizado
- Índices estratégicos en todas las tablas
- Índices GIN para búsquedas JSONB
- Triggers automáticos para `updated_at`
- Vistas pre-calculadas para dashboards

---

## 📐 Modelo de Datos

```
clientes (4 segmentos)
    ↓
capturas_riesgo (eventos de detección)
    ├── escenarios_riesgo (16 escenarios)
    │       ↓
    │   verticales_negocio (4 áreas)
    └── planes_mitigacion (acciones)
```

### Tablas Principales

| Tabla | Propósito | Registros Demo |
|-------|-----------|----------------|
| **clientes** | Información de clientes multi-tenant | 4 |
| **verticales_negocio** | Categorías de análisis | 4 |
| **escenarios_riesgo** | Catálogo de escenarios | 16 |
| **capturas_riesgo** | Eventos de detección | 8 |
| **planes_mitigacion** | Planes de acción | 3 |

---

## 💻 Integración con Frontend

### Next.js + TypeScript + Supabase

#### Instalación

```bash
npm install @supabase/supabase-js
```

#### Cliente Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### Ejemplo de Query

```typescript
// Obtener riesgos del dashboard
const { data: riesgos } = await supabase
  .from('vista_dashboard_riesgos')
  .select('*')
  .order('Puntaje Global', { ascending: false })

// Obtener riesgos de un cliente específico
const { data: riesgosCliente } = await supabase
  .from('capturas_riesgo')
  .select(`
    *,
    escenarios_riesgo (titulo, descripcion_base),
    clientes (nombre_comercial)
  `)
  .eq('cliente_id', clienteId)
  .gte('puntaje_global', 70)
```

---

## 📊 Consultas Predefinidas

Todas estas consultas están disponibles en `smartdash_fv_queries.sql`:

### 🔥 Top Queries

```sql
-- 1. Riesgos críticos activos
SELECT * FROM vista_dashboard_riesgos 
WHERE "Nivel de Riesgo" = 'Crítico' 
AND "Estado Acción" != 'Completado';

-- 2. Resumen por segmento
SELECT segmento, COUNT(*) as total_riesgos, AVG(puntaje_global) as puntaje_promedio
FROM capturas_riesgo cr
JOIN clientes c ON cr.cliente_id = c.id
GROUP BY segmento;

-- 3. Planes de mitigación con progreso
SELECT 
    c.nombre_comercial,
    er.titulo,
    pm.responsable,
    JSONB_ARRAY_LENGTH(pm.pasos_accion) as total_pasos
FROM planes_mitigacion pm
JOIN capturas_riesgo cr ON pm.captura_id = cr.id
JOIN clientes c ON cr.cliente_id = c.id
JOIN escenarios_riesgo er ON cr.escenario_id = er.id;
```

---

## 🔒 Seguridad (Row-Level Security)

### Configurar RLS para Multi-Tenant

```sql
-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE capturas_riesgo ENABLE ROW LEVEL SECURITY;

-- Política: Clientes solo ven sus datos
CREATE POLICY "Usuarios ven solo su cliente"
ON clientes FOR SELECT
USING (auth.uid()::text = (metadata_negocio->>'user_id'));

CREATE POLICY "Usuarios ven solo sus riesgos"
ON capturas_riesgo FOR SELECT
USING (
    cliente_id IN (
        SELECT id FROM clientes 
        WHERE auth.uid()::text = (metadata_negocio->>'user_id')
    )
);
```

---

## 📈 Datos de Demostración

### Clientes Incluidos

1. **Distribuidora San Martín** (Pyme)
   - Crisis de liquidez
   - Ruptura de cadena de suministro
   - Incumplimiento fiscal

2. **ModaClick Store** (E-commerce)
   - Caída de conversión de ventas
   - Falla en plataforma de pago

3. **FinTech Pro** (Startup)
   - Agotamiento de runway

4. **Laura Méndez - Coach Digital** (Creador)
   - Dependencia de plataforma única
   - Polémica pública

### Escenarios por Vertical

- **Financiero**: 4 escenarios
- **Operaciones**: 4 escenarios
- **Legal**: 4 escenarios
- **Reputación**: 4 escenarios

---

## 🛠️ Mantenimiento

### Backup

```bash
# Backup completo
pg_dump -h db.xxx.supabase.co -U postgres > backup.sql

# Restore
psql -h db.xxx.supabase.co -U postgres < backup.sql
```

### Monitoreo de Tamaño

```sql
-- Ver tamaño de tablas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📚 Documentación Completa

Para detalles técnicos, arquitectura, y ejemplos avanzados, consulta:

📖 **[DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md)**

Incluye:
- Arquitectura completa del sistema
- Diagramas de entidad-relación
- Ejemplos de integración con React/Next.js
- Optimización y performance
- Estrategias de escalabilidad
- Mejores prácticas de seguridad

---

## 🎨 Casos de Uso

### 1. Dashboard Ejecutivo
Visualiza todos los riesgos activos con métricas consolidadas.

```sql
SELECT * FROM vista_dashboard_riesgos;
```

### 2. Alertas Automáticas
Detecta riesgos críticos para notificaciones en tiempo real.

```sql
SELECT * FROM capturas_riesgo 
WHERE nivel_riesgo_actual = 'Crítico' 
AND estado_accion = 'Pendiente';
```

### 3. Análisis por Segmento
Compara rendimiento de diferentes tipos de cliente.

```sql
SELECT segmento, AVG(puntaje_global) as puntaje_promedio
FROM capturas_riesgo cr
JOIN clientes c ON cr.cliente_id = c.id
GROUP BY segmento;
```

### 4. Tracking de Mitigación
Monitorea el progreso de planes de acción.

```sql
SELECT * FROM planes_mitigacion
WHERE fecha_limite <= CURRENT_DATE + INTERVAL '7 days';
```

---

## 🔧 Tecnologías

- **PostgreSQL 14+** - Base de datos relacional
- **Supabase** - Backend as a Service
- **JSONB** - Almacenamiento flexible de datos
- **UUID** - Identificadores únicos seguros
- **Triggers** - Automatización de procesos

---

## 📞 Soporte

Para preguntas, mejoras o reportar bugs:

- 📧 Email: soporte@smartdashfv.com
- 💬 Slack: #smartdash-fv-db
- 📖 Docs: [supabase.com/docs](https://supabase.com/docs)

---

## 📝 Licencia

Este proyecto es propiedad de **SmartDash FV**. Todos los derechos reservados.

---

## ✅ Checklist de Implementación

- [ ] Cuenta de Supabase creada
- [ ] Schema ejecutado en SQL Editor
- [ ] Verificación de datos completada
- [ ] API keys copiadas (.env)
- [ ] RLS configurado (opcional)
- [ ] Integración con frontend iniciada
- [ ] Primera query de prueba exitosa

---

**🎉 ¡Felicidades! Tu base de datos SmartDash FV está lista para producción.**

Para comenzar a construir tu frontend, revisa los ejemplos en `DOCUMENTACION_TECNICA.md`.

---

**Versión**: 1.0.0  
**Fecha**: Febrero 2026  
**Mantenido por**: SmartDash FV Engineering Team
