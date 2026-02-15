-- Q1: Sellers recientes con score
SELECT seller_id, score, drivers, calculated_at
FROM public.health_scores
ORDER BY calculated_at DESC
LIMIT 50;

-- Q2: Timeline eventos clínicos por seller (Requires param :seller_id)
SELECT scenario_key, entity_type, entity_id, severity, score_impact, detected_at, evidence
FROM public.clinical_events
WHERE seller_id = :seller_id
ORDER BY detected_at DESC
LIMIT 200;

-- Q3: Últimos snapshots de preguntas por seller (Requires param :seller_id)
SELECT question_id, status, date_created, updated_at, item_id
FROM public.question_snapshots
WHERE seller_id = :seller_id
ORDER BY updated_at DESC
LIMIT 200;

-- Q4: Telemetría por seller (Requires param :seller_id)
SELECT calculated_at, total_penalty, total_raw_positive, half_life_hours, max_total_raw, floor_factor, drivers_snapshot
FROM public.health_score_telemetry
WHERE seller_id = :seller_id
ORDER BY calculated_at DESC
LIMIT 200;

-- Q5: Tendencia score 7d por seller (Requires param :seller_id)
SELECT date_trunc('hour', calculated_at) AS bucket, avg(score)::numeric(5,2) AS avg_score
FROM public.health_scores
WHERE seller_id = :seller_id
  AND calculated_at > now() - interval '7 days'
GROUP BY 1
ORDER BY 1;
