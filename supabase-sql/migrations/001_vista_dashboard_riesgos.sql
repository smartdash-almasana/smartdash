-- ============================================================================
-- Migración: 001_vista_dashboard_riesgos
-- Descripción: Añade img_url a clientes y crea vista para dashboard de riesgos
-- Fecha: 2026-02-05
-- ============================================================================

-- 1. Añadir columna img_url a la tabla clientes
-- ---------------------------------------------------------------------------
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS img_url TEXT;

COMMENT ON COLUMN clientes.img_url IS 'URL de imagen del cliente (logo o foto del dueño) en bucket img_clientes';

-- 2. Crear la vista materializada vista_dashboard_riesgos
-- ---------------------------------------------------------------------------
-- Esta vista consolida capturas_riesgo con escenarios y clientes para el dashboard
-- Extrae campos clave del JSONB para facilitar consultas

DROP VIEW IF EXISTS vista_dashboard_riesgos;

CREATE VIEW vista_dashboard_riesgos AS
SELECT 
    -- Identificadores
    cr.id AS captura_id,
    cr.cliente_id,
    cr.escenario_id,
    
    -- Datos del cliente
    c.nombre_comercial,
    c.razon_social,
    c.segmento,
    c.img_url,
    
    -- Datos del escenario
    e.titulo AS escenario,
    e.descripcion_base AS escenario_descripcion,
    vn.nombre AS vertical,
    
    -- Métricas de riesgo
    cr.puntaje_global,
    cr.nivel_riesgo_actual AS nivel_riesgo,
    
    -- Contexto financiero extraído del JSONB
    (cr.contexto_financiero->>'monto')::NUMERIC AS monto_en_riesgo,
    cr.contexto_financiero->>'moneda' AS moneda,
    cr.contexto_financiero->>'etiqueta' AS etiqueta_financiera,
    
    -- Señal principal extraída del JSONB
    cr.senales->>'icono' AS senal_icono,
    cr.senales->>'detalle' AS senal_principal,
    
    -- Estados y fechas
    cr.estado_accion,
    cr.texto_recomendacion,
    cr.created_at,
    cr.updated_at

FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo e ON cr.escenario_id = e.id
INNER JOIN verticales_negocio vn ON e.vertical_id = vn.id;

-- Comentarios de documentación
COMMENT ON VIEW vista_dashboard_riesgos IS 'Vista consolidada para Pantalla 1B: Cards de Casos Testigo con indicadores de riesgo';

-- 3. Función helper para obtener casos por segmento
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION obtener_casos_por_segmento(p_segmento TEXT, p_limite INTEGER DEFAULT 4)
RETURNS TABLE (
    captura_id UUID,
    escenario TEXT,
    monto_en_riesgo NUMERIC,
    moneda TEXT,
    nivel_riesgo TEXT,
    senal_principal TEXT,
    nombre_comercial TEXT,
    segmento TEXT
)
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        vdr.captura_id,
        vdr.escenario,
        vdr.monto_en_riesgo,
        vdr.moneda,
        vdr.nivel_riesgo,
        vdr.senal_principal,
        vdr.nombre_comercial,
        vdr.segmento
    FROM vista_dashboard_riesgos vdr
    WHERE vdr.segmento = p_segmento
    ORDER BY 
        CASE vdr.nivel_riesgo 
            WHEN 'Crítico' THEN 1 
            WHEN 'Alto' THEN 2 
            WHEN 'Medio' THEN 3 
            WHEN 'Bajo' THEN 4 
        END,
        vdr.monto_en_riesgo DESC NULLS LAST
    LIMIT p_limite;
$$;

COMMENT ON FUNCTION obtener_casos_por_segmento IS 'Retorna los N casos más críticos por segmento para la Pantalla 1B';
