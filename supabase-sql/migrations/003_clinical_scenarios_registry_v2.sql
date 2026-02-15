-- ============================================================================
-- Migración: 003_clinical_scenarios_registry_v2
-- Descripción: Escenarios clínicos como tabla de configuración con kill switch
-- Fecha: 2026-02-14
-- ============================================================================

-- 1) Tabla de registro de escenarios clínicos
CREATE TABLE IF NOT EXISTS public.clinical_scenarios (
  key                text        PRIMARY KEY,
  default_entity_type text       NOT NULL,
  severity_model     text        NOT NULL,
  max_score          integer     NOT NULL,
  is_active          boolean     NOT NULL DEFAULT true,
  version            integer     NOT NULL DEFAULT 1,
  created_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clinical_scenarios IS
'Registro de escenarios clínicos con kill switch (is_active) y versionado.';

-- 2) Seed de escenarios actuales (idempotente)
INSERT INTO public.clinical_scenarios (key, default_entity_type, severity_model, max_score)
VALUES
  ('sla_question', 'question', 'exponential', 30),
  ('shipping_deadline', 'order', 'linear', 40),
  ('stockout_risk', 'listing', 'probability', 25),
  ('reputation_premortem', 'seller', 'threshold', 50)
ON CONFLICT (key) DO NOTHING;

-- 3) Agregar columna rule_version a clinical_events (idempotente)
ALTER TABLE public.clinical_events
ADD COLUMN IF NOT EXISTS rule_version integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.clinical_events.rule_version IS
'Versión de la regla del escenario que generó este evento (auditabilidad).';

-- 4) Eliminar CHECK constraints antiguos (si existen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clinical_events_scenario_key_check'
      AND conrelid = 'public.clinical_events'::regclass
  ) THEN
    ALTER TABLE public.clinical_events
    DROP CONSTRAINT clinical_events_scenario_key_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clinical_events_entity_type_check'
      AND conrelid = 'public.clinical_events'::regclass
  ) THEN
    ALTER TABLE public.clinical_events
    DROP CONSTRAINT clinical_events_entity_type_check;
  END IF;
END
$$;

-- 5) Agregar FK a clinical_scenarios (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_clinical_events_scenario'
      AND conrelid = 'public.clinical_events'::regclass
  ) THEN
    ALTER TABLE public.clinical_events
    ADD CONSTRAINT fk_clinical_events_scenario
    FOREIGN KEY (scenario_key) REFERENCES public.clinical_scenarios(key);
  END IF;
END
$$;

-- 6) Índices para optimizar queries del motor clínico
CREATE INDEX IF NOT EXISTS idx_clinical_events_scenario
ON public.clinical_events (scenario_key);

CREATE INDEX IF NOT EXISTS idx_clinical_events_active_entity
ON public.clinical_events (entity_type, entity_id, scenario_key)
WHERE resolved_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_scenario
ON public.clinical_events (scenario_key, entity_type, entity_id)
WHERE resolved_at IS NULL;
