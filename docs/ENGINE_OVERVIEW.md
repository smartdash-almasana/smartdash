# SmartSeller Engine Overview

## Arquitectura
El motor SmartSeller funciona como un sistema inmunológico para la reputación del vendedor en Mercado Libre.
Flujo de datos:
1.  **Webhook (Mercado Libre)** -> Ingesta en `webhook_events`.
2.  **Processor** (`run-worker-now.ts` / Worker) processa eventos, actualiza `snapshots` y detecta `clinical_events`.
3.  **Health Score Engine** (`health-score.ts` / `run-health-now.ts`) lee eventos clínicos, aplica decaimiento y calcula puntaje 0-100.
4.  **Telemetry**: Cada cálculo guarda un registro en `health_score_telemetry` para auditoría.

## Componentes Críticos
- **Processor**: `lib/engine/smartseller/processor.ts`
  - Maneja lógica de detección (SLA, Backlog, Momentum, Recovery).
  - Idempotencia basada en ventanas de tiempo.
- **Health Score**: `lib/engine/smartseller/health-score.ts`
  - Formula de puntaje.
  - Time Decay (Half-Life).
  - Stability Cap & Dynamic Floor.
- **Scripts**:
  - `scripts/run-worker-now.ts`: Procesa eventos pendientes.
  - `scripts/run-health-now.ts`: Recalcula score.

## Idempotencia
- **Webhooks**: `dedupe_key` evita procesar el mismo evento técnico duplicado.
- **Escenarios Clínicos**:
  - `questions_backlog_critical`: 1 evento cada 12 horas por seller.
  - `seller_risk_momentum`: 1 evento cada 24 horas por seller.
  - `seller_recovery_stable`: 1 evento cada 24 horas por seller.
  - SLA (Questions): 1 evento ID único por pregunta (evita duplicar castigo sobre la misma pregunta).

## Configuración (ENV)
Parámetros sistémicos configurables vía variables de entorno:
- `SCORE_HALF_LIFE_HOURS`: Horas para que el impacto de un evento caiga a la mitad (Def: 24h).
- `SCORE_MAX_TOTAL_RAW`: Límite de "memoria" histórica bruta para penalidades positivas (Def: 300 pts).
- `SCORE_FLOOR_FACTOR`: Factor de cicatrización para el piso dinámico (Def: 0.1).

## Telemetría
Tabla: `health_score_telemetry`
- Propósito: Auditoría completa de cada cálculo de score.
- Campos clave: `seller_id`, `total_penalty`, `total_raw_positive`, `drivers_snapshot` (JSON con detalle de penalidades y decaimiento).
