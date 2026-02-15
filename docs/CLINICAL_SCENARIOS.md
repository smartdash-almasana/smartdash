# Clinical Scenarios Taxonomy

| scenario_key | entity_type | severity | score_impact | max_cap | Condición / Trigger | Ventana / Idempotencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sla_questions_overdue` | question | high | 15 | 45 | Pregunta sin responder > tiempo SLA crítico | 1 evento por pregunta ID |
| `sla_questions_answer_late` | question | medium | 10 | 30 | Pregunta respondida después de SLA | 1 evento por pregunta ID |
| `questions_backlog_critical` | seller | high | 25 | 50 | >10 preguntas pendientes O >5 muy viejas | 1 evento cada 12 horas |
| `seller_risk_momentum` | seller | high | 20 | 40 | ≥ 8 eventos clínicos (Overdue/Late/Backlog) en últimas 48h | 1 evento cada 24 horas |
| `seller_recovery_stable` | seller | positive | -15 (Bonus) | N/A | 0 eventos críticos en 24h Y historial previo > 0 | 1 evento cada 24 horas |

*Nota: Los caps aplican a la suma de penalidades ponderadas (decayed) por ese driver específico en el cálculo del score total.*
