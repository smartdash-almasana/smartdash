-- ============================================================================
-- Migración: 004_fix_is_late_trigger
-- Descripción: Corrige función de trigger para contemplar raw_payload.payload.shipping.status
-- Fecha: 2026-02-14
-- Aplicar solo si verify_is_late_drift.sql detecta drift > 1%
-- ============================================================================

-- TODO: Solo ejecutar si verificación detectó drift

CREATE OR REPLACE FUNCTION public.set_order_snapshot_is_late()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_late := (
    COALESCE(LOWER(NEW.status), '') LIKE '%delayed%'
    OR COALESCE(NEW.raw_payload->'shipping'->>'status', '') = 'delayed'
    OR COALESCE(NEW.raw_payload->'payload'->'shipping'->>'status', '') = 'delayed'
  );
  RETURN NEW;
END;
$$;

-- Backfill de registros con drift (si aplica)
DO $$
BEGIN
  IF to_regclass('public.order_snapshots') IS NOT NULL THEN
    EXECUTE $upd$
      UPDATE public.order_snapshots
      SET is_late = (
        COALESCE(LOWER(status), '') LIKE '%delayed%'
        OR COALESCE(raw_payload->'shipping'->>'status', '') = 'delayed'
        OR COALESCE(raw_payload->'payload'->'shipping'->>'status', '') = 'delayed'
      )
      WHERE is_late IS DISTINCT FROM (
        COALESCE(LOWER(status), '') LIKE '%delayed%'
        OR COALESCE(raw_payload->'shipping'->>'status', '') = 'delayed'
        OR COALESCE(raw_payload->'payload'->'shipping'->>'status', '') = 'delayed'
      )
    $upd$;
  END IF;
END
$$;
