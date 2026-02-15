-- ============================================================================
-- Verificación: Webhook End-to-End
-- Descripción: Inserta webhook y verifica propagación a 3 capas
-- Fecha: 2026-02-14
-- ============================================================================

-- 1) Limipieza previa (opcional, cuidado en prod)
-- DELETE FROM public.webhook_events WHERE resource = '/orders/999999999';
-- DELETE FROM public.order_snapshots WHERE order_id = '999999999';
-- DELETE FROM public.clinical_events WHERE entity_id = '999999999';

-- 2) Simulación de Webhook (Insert manual como haría el endpoint si storeMeliWebhookEvent falla o para test directo DB)
-- Nota: La prueba real debe ser vía curl al endpoint.
-- Este script solo verifica el estado final si se ejecutó.

SELECT * FROM public.webhook_events 
WHERE resource LIKE '%/orders/%' 
ORDER BY created_at DESC LIMIT 1;

SELECT * FROM public.order_snapshots 
ORDER BY created_at DESC LIMIT 1;

SELECT * FROM public.clinical_events 
ORDER BY detected_at DESC LIMIT 1;

-- Query de éxito esperado:
-- 1 webhook_event con status='pending' (o 'done' si el worker corrió)
-- 1 order_snapshot con status='from_webhook'
-- 1 clinical_event con scenario_key='sla_breach_risk'
