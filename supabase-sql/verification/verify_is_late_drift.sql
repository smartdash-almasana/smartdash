-- ============================================================================
-- Verificación: is_late drift detection
-- Descripción: Detecta inconsistencias entre is_late persistido y predicado
-- Fecha: 2026-02-14
-- ============================================================================

-- TODO: Ejecutar contra Supabase cuando haya conexión activa

WITH computed_is_late AS (
  SELECT
    id,
    is_late AS persisted_is_late,
    (
      COALESCE(LOWER(status), '') LIKE '%delayed%'
      OR COALESCE(raw_payload->'shipping'->>'status', '') = 'delayed'
      OR COALESCE(raw_payload->'payload'->'shipping'->>'status', '') = 'delayed'
    ) AS computed_is_late
  FROM public.order_snapshots
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN persisted_is_late != computed_is_late THEN 1 ELSE 0 END) AS mismatch_count,
  ROUND(
    100.0 * SUM(CASE WHEN persisted_is_late != computed_is_late THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
    2
  ) AS mismatch_percentage
FROM computed_is_late;

-- Si mismatch_percentage > 1%, ejecutar migración de corrección del trigger
-- Ver: 004_fix_is_late_trigger.sql (si es necesario)
