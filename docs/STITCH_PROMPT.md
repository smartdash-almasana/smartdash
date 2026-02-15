# Prompt para Stitch

**Objetivo**: Crear un dashboard "SmartSeller Health" conectado a Supabase Postgres (Read-Only).

**Conexión de Datos**:
- Usar las queries proporcionadas en `docs/STITCH_DATA_QUERIES.sql`.
- Parametrizar con `seller_id` donde corresponda.

**Estructura de Pantallas**:

### 1. Overview (Health Monitor)
- **Grid de Sellers**: Lista de vendedores monitoreados.
  - Columnas: Seller ID (truncado), Score Actual, Badge de Estado (Verde > 80, Amarillo 50-80, Rojo < 50), Top Driver (causa principal de penalidad).
  - Data Source: `Q1`.

### 2. Seller Detail (Clínica)
- **Cabecera**: Score Actual en grande, Gráfico de Tendencia 7 días (`Q5`).
- **Drivers de Penalidad**: Lista de razones actuales que bajan el score (usar campo `drivers` del JSON en `Q1`).
- **Timeline Clínico**: Tabla cronológica de `clinical_events` (`Q2`).
  - Mostrar: Fecha detección, Tipo evento (scenario), Severidad (Color), Impacto score.

### 3. Evidencia (Questions & Telemetry)
- **Backlog de Preguntas**: Tabla de `question_snapshots` (`Q3`).
  - Filtrar visualmente las que tienen status UNANSWERED.
- **Auditoría Técnica**: Tabla de `health_score_telemetry` (`Q4`).
  - Mostrar cómo se calculó el score (raw vs decayed, floor factor). Útil para depuración.

**Estilo UX**:
- Limpio, clínico, orientado a la acción "Early Warning".
- Usar colores semánticos: Rojo (Alerta/High Severity), Naranja (Medium), Verde (Positive/Recovery).
- Sin adornos innecesarios.
