-- ============================================================================
-- Migración: 002_order_snapshots_is_late
-- Descripción: Formaliza el predicado de orden tardía como booleano persistido
-- Fecha: 2026-02-14
-- ============================================================================

-- 1) Columna persistida (backward compatible)
ALTER TABLE IF EXISTS public.order_snapshots
ADD COLUMN IF NOT EXISTS is_late BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.order_snapshots.is_late IS
'Predicado persistido de orden tardía. Lógica v1: status ILIKE ''%delayed%'' o raw_payload.shipping.status = ''delayed''.';

-- 2) Backfill con la lógica actual (sin cambiar semántica)
DO $$
BEGIN
  IF to_regclass('public.order_snapshots') IS NOT NULL THEN
    EXECUTE $upd$
      UPDATE public.order_snapshots
      SET is_late = (
        COALESCE(LOWER(status), '') LIKE '%delayed%'
        OR COALESCE(raw_payload->'shipping'->>'status', '') = 'delayed'
      )
      WHERE is_late IS DISTINCT FROM (
        COALESCE(LOWER(status), '') LIKE '%delayed%'
        OR COALESCE(raw_payload->'shipping'->>'status', '') = 'delayed'
      )
    $upd$;
  END IF;
END
$$;

-- 3) Mantener is_late consistente en INSERT/UPDATE futuros
CREATE OR REPLACE FUNCTION public.set_order_snapshot_is_late()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_late := (
    COALESCE(LOWER(NEW.status), '') LIKE '%delayed%'
    OR COALESCE(NEW.raw_payload->'shipping'->>'status', '') = 'delayed'
  );
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.order_snapshots') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM pg_trigger
      WHERE tgname = 'trg_order_snapshots_set_is_late'
        AND tgrelid = 'public.order_snapshots'::regclass
    ) THEN
      EXECUTE 'DROP TRIGGER trg_order_snapshots_set_is_late ON public.order_snapshots';
    END IF;

    EXECUTE '
      CREATE TRIGGER trg_order_snapshots_set_is_late
      BEFORE INSERT OR UPDATE OF status, raw_payload
      ON public.order_snapshots
      FOR EACH ROW
      EXECUTE FUNCTION public.set_order_snapshot_is_late()
    ';
  END IF;
END
$$;

-- 4) Índice parcial para consultas de reputación por tardías (si aplica)
DO $$
BEGIN
  IF to_regclass('public.order_snapshots') IS NOT NULL THEN
    EXECUTE '
      CREATE INDEX IF NOT EXISTS idx_order_snapshots_user_created_late
      ON public.order_snapshots (user_id, created_at DESC)
      WHERE is_late = TRUE
    ';
  END IF;
END
$$;
