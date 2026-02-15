# Runbook de Verificación y Operación

## Scripts de Operación
Para ejecutar procesos manualmente desde CLI:

1. **Procesar Eventos Pendientes (Worker)**:
   ```bash
   npx tsx scripts/run-worker-now.ts
   ```
   *Procesa webhooks en cola, actualiza snapshots y genera clinical_events.*

2. **Recalcular Health Score**:
   ```bash
   npx tsx scripts/run-health-now.ts
   ```
   *Recalcula el score basándose en clinical_events actuales y registra telemetría.*

## Queries de Verificación (Read-Only)

### 1. Últimos 5 Eventos Clínicos
```sql
SELECT scenario_key, severity, score_impact, detected_at, seller_id
FROM public.clinical_events
ORDER BY detected_at DESC
LIMIT 5;
```

### 2. Últimos 5 Health Scores
```sql
SELECT seller_id, score, calculated_at, drivers
FROM public.health_scores
ORDER BY calculated_at DESC
LIMIT 5;
```

### 3. Telemetría Reciente (Auditoría Cálculo)
```sql
SELECT seller_id, calculated_at, total_penalty, total_raw_positive, floor_factor
FROM public.health_score_telemetry
ORDER BY calculated_at DESC
LIMIT 20;
```

### 4. Snapshots Recientes (Estado Preguntas)
```sql
SELECT question_id, status, date_created, seller_id
FROM public.question_snapshots
ORDER BY updated_at DESC
LIMIT 10;
```
