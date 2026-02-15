# Health Score Specification

## Fórmula Base
El Health Score es un valor entre 0 y 100 que representa la salud operativa del vendedor.
`Score = 100 - TotalNetPenalty`

### 1. Agregación de Eventos
Se obtienen TODOS los eventos clínicos históricos del seller.
Se agrupan por `scenario_key`.
- `count`: Cantidad de eventos.
- `latest_detected_at`: Fecha del evento más reciente del tipo.

### 2. Cálculo de Penalidad Bruta (Raw Penalty)
Para cada escenario, se calcula `RawPenalty = min(ScenarioCap, Count * ImpactPerEvent)`.
Excepción: `seller_recovery_stable` tiene impacto negativo (bonus -15) y no suma a `TotalRawPositive`.

### 3. Time Decay (Decaimiento Temporal)
Aplicado a `RawPenalty` basado en `latest_detected_at`.
- `HALF_LIFE_HOURS` (Configurable, Def: 24h).
- `lambda = ln(2) / HALF_LIFE_HOURS`.
- `hours = (Now - latest_detected_at)`.
- `Weight = exp(-lambda * hours)`.
- `DecayedPenalty = RawPenalty * Weight`.

### 4. Stability Cap (Techo de Estabilidad)
Previene overflow de penalidad por historial masivo.
Se calcula `TotalRawPositivePenaltyBeforeDecay` (suma de raw penalties > 0).
Si `TotalRawPositive > MAX_TOTAL_RAW` (Def: 300):
- `OverflowRatio = MAX_TOTAL_RAW / TotalRawPositive`.
- `TotalPenalty (Net)` se escala por `OverflowRatio`.
- `TotalRawPositive` se topea a `MAX_TOTAL_RAW`.

### 5. Dynamic Floor (Piso Dinámico / Cicatrización)
Impide recuperación instantánea artificial si hubo daño severo reciente.
- `MaxRecoverableScore = 100 - (TotalRawPositive * FLOOR_FACTOR)`.
  (Donde `FLOOR_FACTOR` Def: 0.1).
- `FinalScore = min(CalculatedScore, MaxRecoverableScore)`.

### 6. Clamping Final
El score final se asegura de estar en rango [0, 100].

## Estructura Drivers Snapshot
Objeto JSON almacenado en telemetría:
```json
[
  {
    "scenario_key": "sla_questions_overdue",
    "count": 5,
    "penalty": 12,           // Decayed
    "raw_penalty": 45,       // Original capped
    "decay_applied": true,
    "example_event_id": "uuid..."
  }
]
```
