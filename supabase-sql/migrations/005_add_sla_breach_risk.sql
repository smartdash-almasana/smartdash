-- ============================================================================
-- Migración: 005_add_sla_breach_risk
-- Descripción: Agrega escenario sla_breach_risk e índice de idempotencia por webhook
-- Fecha: 2026-02-14
-- ============================================================================

-- 1) Agregar el escenario sla_breach_risk si no existe
INSERT INTO public.clinical_scenarios (key, default_entity_type, severity_model, max_score, is_active, version)
VALUES ('sla_breach_risk', 'order', 'linear', 30, true, 1)
ON CONFLICT (key) DO NOTHING;

-- 2) Índice único para garantizar idempotencia basada en el ID del webhook original
--    Esto previene que el mismo evento genere múltiples registros clínicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinical_events_webhook_id
ON public.clinical_events ((evidence->>'webhook_event_id'))
WHERE evidence->>'webhook_event_id' IS NOT NULL;
