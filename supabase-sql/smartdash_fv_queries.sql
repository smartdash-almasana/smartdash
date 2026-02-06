-- ============================================================================
-- SmartDash FV - Consultas para Dashboard y Análisis
-- Consultas optimizadas para integración con Next.js / React
-- ============================================================================

-- ============================================================================
-- CONSULTA PRINCIPAL: DASHBOARD DE RIESGOS COMPLETO
-- ============================================================================

-- Esta consulta está optimizada para consumo desde el frontend
-- Retorna todos los datos necesarios para renderizar el dashboard principal

SELECT 
    -- Información del Cliente
    c.nombre_comercial AS nombre_cliente,
    c.segmento,
    c.email_contacto,
    
    -- Información del Riesgo
    vn.nombre AS vertical,
    er.titulo AS escenario,
    er.descripcion_base AS descripcion_escenario,
    
    -- Métricas de Riesgo
    cr.nivel_riesgo_actual,
    cr.puntaje_global,
    
    -- Contexto Financiero (extraído de JSONB)
    (cr.contexto_financiero->>'monto')::NUMERIC AS monto_en_riesgo,
    cr.contexto_financiero->>'etiqueta' AS etiqueta_financiera,
    cr.contexto_financiero->>'moneda' AS moneda,
    
    -- Señales de Alerta (extraído de JSONB)
    cr.senales->>'icono' AS icono_señal,
    cr.senales->>'detalle' AS detalle_señal,
    cr.senales->'indicadores' AS indicadores_tecnicos,
    
    -- Acción y Estado
    cr.texto_recomendacion,
    cr.estado_accion,
    
    -- Metadata temporal
    cr.created_at AS fecha_deteccion,
    cr.updated_at AS ultima_actualizacion,
    
    -- IDs para operaciones
    cr.id AS captura_id,
    c.id AS cliente_id,
    er.id AS escenario_id,
    
    -- Indicador visual de criticidad (para UI)
    CASE 
        WHEN cr.puntaje_global >= 85 THEN 'danger'
        WHEN cr.puntaje_global >= 70 THEN 'warning'
        WHEN cr.puntaje_global >= 50 THEN 'info'
        ELSE 'success'
    END AS color_badge

FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
INNER JOIN verticales_negocio vn ON er.vertical_id = vn.id

ORDER BY 
    cr.puntaje_global DESC,
    cr.created_at DESC;


-- ============================================================================
-- CONSULTAS ESPECÍFICAS POR CASO DE USO
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RIESGOS CRÍTICOS ACTIVOS (Puntaje >= 85 y Pendientes)
-- ----------------------------------------------------------------------------

SELECT 
    c.nombre_comercial,
    c.segmento,
    er.titulo AS escenario,
    cr.puntaje_global,
    cr.nivel_riesgo_actual,
    (cr.contexto_financiero->>'monto')::NUMERIC AS monto_riesgo,
    cr.texto_recomendacion,
    cr.created_at
FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
WHERE 
    cr.puntaje_global >= 85 
    AND cr.estado_accion IN ('Pendiente', 'En Proceso')
ORDER BY cr.puntaje_global DESC;


-- ----------------------------------------------------------------------------
-- 2. RESUMEN DE RIESGOS POR SEGMENTO
-- ----------------------------------------------------------------------------

SELECT 
    c.segmento,
    COUNT(*) AS total_riesgos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Crítico') AS riesgos_criticos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Alto') AS riesgos_altos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Medio') AS riesgos_medios,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Bajo') AS riesgos_bajos,
    ROUND(AVG(cr.puntaje_global), 2) AS puntaje_promedio,
    SUM((cr.contexto_financiero->>'monto')::NUMERIC) AS exposicion_total
FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
GROUP BY c.segmento
ORDER BY riesgos_criticos DESC, puntaje_promedio DESC;


-- ----------------------------------------------------------------------------
-- 3. DISTRIBUCIÓN DE RIESGOS POR VERTICAL
-- ----------------------------------------------------------------------------

SELECT 
    vn.nombre AS vertical,
    COUNT(*) AS cantidad_riesgos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Crítico') AS criticos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Alto') AS altos,
    ROUND(AVG(cr.puntaje_global), 2) AS puntaje_promedio
FROM capturas_riesgo cr
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
INNER JOIN verticales_negocio vn ON er.vertical_id = vn.id
GROUP BY vn.nombre
ORDER BY criticos DESC, puntaje_promedio DESC;


-- ----------------------------------------------------------------------------
-- 4. VISTA DETALLADA DE UN CLIENTE ESPECÍFICO
-- ----------------------------------------------------------------------------

-- Reemplazar 'ModaClick Store' con el nombre del cliente deseado
SELECT 
    er.titulo AS escenario,
    vn.nombre AS vertical,
    cr.nivel_riesgo_actual,
    cr.puntaje_global,
    cr.senales->>'detalle' AS señal_principal,
    (cr.contexto_financiero->>'monto')::NUMERIC AS monto_riesgo,
    cr.contexto_financiero->>'moneda' AS moneda,
    cr.texto_recomendacion,
    cr.estado_accion,
    cr.created_at AS fecha_deteccion
FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
INNER JOIN verticales_negocio vn ON er.vertical_id = vn.id
WHERE c.nombre_comercial = 'ModaClick Store'
ORDER BY cr.puntaje_global DESC;


-- ----------------------------------------------------------------------------
-- 5. PLANES DE MITIGACIÓN ACTIVOS CON PROGRESO
-- ----------------------------------------------------------------------------

SELECT 
    c.nombre_comercial AS cliente,
    er.titulo AS escenario_riesgo,
    pm.responsable,
    pm.fecha_limite,
    JSONB_ARRAY_LENGTH(pm.pasos_accion) AS total_pasos,
    (
        SELECT COUNT(*) 
        FROM JSONB_ARRAY_ELEMENTS(pm.pasos_accion) paso 
        WHERE (paso->>'completado')::BOOLEAN = true
    ) AS pasos_completados,
    ROUND(
        (
            (SELECT COUNT(*) FROM JSONB_ARRAY_ELEMENTS(pm.pasos_accion) paso WHERE (paso->>'completado')::BOOLEAN = true)::NUMERIC 
            / JSONB_ARRAY_LENGTH(pm.pasos_accion)::NUMERIC
        ) * 100, 
        2
    ) AS porcentaje_completado,
    CASE 
        WHEN pm.fecha_limite < CURRENT_DATE THEN 'Vencido'
        WHEN pm.fecha_limite <= CURRENT_DATE + INTERVAL '3 days' THEN 'Urgente'
        ELSE 'En Plazo'
    END AS estado_plazo
FROM planes_mitigacion pm
INNER JOIN capturas_riesgo cr ON pm.captura_id = cr.id
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
ORDER BY pm.fecha_limite ASC;


-- ----------------------------------------------------------------------------
-- 6. EXPOSICIÓN FINANCIERA TOTAL POR CLIENTE
-- ----------------------------------------------------------------------------

SELECT 
    c.nombre_comercial,
    c.segmento,
    COUNT(*) AS total_riesgos_activos,
    SUM((cr.contexto_financiero->>'monto')::NUMERIC) AS exposicion_total,
    cr.contexto_financiero->>'moneda' AS moneda,
    MAX(cr.puntaje_global) AS puntaje_maximo,
    STRING_AGG(
        DISTINCT cr.nivel_riesgo_actual, 
        ', ' 
        ORDER BY cr.nivel_riesgo_actual DESC
    ) AS niveles_riesgo_presentes
FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
GROUP BY c.id, c.nombre_comercial, c.segmento, cr.contexto_financiero->>'moneda'
ORDER BY exposicion_total DESC NULLS LAST;


-- ----------------------------------------------------------------------------
-- 7. TIMELINE DE EVENTOS DE RIESGO (últimos 30 días)
-- ----------------------------------------------------------------------------

SELECT 
    DATE(cr.created_at) AS fecha,
    COUNT(*) AS riesgos_detectados,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Crítico') AS criticos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Alto') AS altos,
    ROUND(AVG(cr.puntaje_global), 2) AS puntaje_promedio_dia
FROM capturas_riesgo cr
WHERE cr.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(cr.created_at)
ORDER BY fecha DESC;


-- ----------------------------------------------------------------------------
-- 8. TOP 5 ESCENARIOS MÁS FRECUENTES
-- ----------------------------------------------------------------------------

SELECT 
    er.titulo AS escenario,
    vn.nombre AS vertical,
    COUNT(*) AS veces_detectado,
    ROUND(AVG(cr.puntaje_global), 2) AS puntaje_promedio,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Crítico') AS veces_critico
FROM capturas_riesgo cr
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
INNER JOIN verticales_negocio vn ON er.vertical_id = vn.id
GROUP BY er.id, er.titulo, vn.nombre
ORDER BY veces_detectado DESC
LIMIT 5;


-- ----------------------------------------------------------------------------
-- 9. ANÁLISIS DE EFECTIVIDAD DE MITIGACIÓN
-- ----------------------------------------------------------------------------

SELECT 
    c.nombre_comercial AS cliente,
    er.titulo AS escenario,
    cr.estado_accion,
    cr.puntaje_global AS puntaje_actual,
    pm.responsable,
    ROUND(
        (
            (SELECT COUNT(*) FROM JSONB_ARRAY_ELEMENTS(pm.pasos_accion) paso WHERE (paso->>'completado')::BOOLEAN = true)::NUMERIC 
            / JSONB_ARRAY_LENGTH(pm.pasos_accion)::NUMERIC
        ) * 100, 
        2
    ) AS progreso_plan,
    (CURRENT_DATE - cr.created_at::DATE) AS dias_transcurridos,
    (pm.fecha_limite - CURRENT_DATE) AS dias_restantes
FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
LEFT JOIN planes_mitigacion pm ON pm.captura_id = cr.id
WHERE cr.estado_accion IN ('Pendiente', 'En Proceso')
ORDER BY cr.puntaje_global DESC;


-- ----------------------------------------------------------------------------
-- 10. BÚSQUEDA POR SEÑALES ESPECÍFICAS (usando JSONB)
-- ----------------------------------------------------------------------------

-- Ejemplo: Buscar todos los riesgos relacionados con flujo de caja
SELECT 
    c.nombre_comercial,
    er.titulo,
    cr.senales->>'detalle' AS señal,
    cr.puntaje_global,
    cr.nivel_riesgo_actual
FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
WHERE 
    cr.senales->>'detalle' ILIKE '%flujo%'
    OR cr.contexto_financiero->>'etiqueta' ILIKE '%flujo%'
ORDER BY cr.puntaje_global DESC;


-- ============================================================================
-- FUNCIONES ÚTILES PARA APLICACIÓN
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Función: Obtener scoring de riesgo de un cliente
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION obtener_scoring_cliente(p_cliente_id UUID)
RETURNS TABLE (
    scoring_total NUMERIC,
    nivel_riesgo_general TEXT,
    riesgos_criticos INTEGER,
    riesgos_activos INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(cr.puntaje_global), 2) AS scoring_total,
        CASE 
            WHEN AVG(cr.puntaje_global) >= 85 THEN 'Crítico'
            WHEN AVG(cr.puntaje_global) >= 70 THEN 'Alto'
            WHEN AVG(cr.puntaje_global) >= 50 THEN 'Medio'
            ELSE 'Bajo'
        END AS nivel_riesgo_general,
        COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Crítico')::INTEGER AS riesgos_criticos,
        COUNT(*)::INTEGER AS riesgos_activos
    FROM capturas_riesgo cr
    WHERE cr.cliente_id = p_cliente_id
    AND cr.estado_accion IN ('Pendiente', 'En Proceso');
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT * FROM obtener_scoring_cliente('UUID-del-cliente');


-- ----------------------------------------------------------------------------
-- Función: Registrar nueva captura de riesgo (simplificada)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION registrar_captura_riesgo(
    p_cliente_id UUID,
    p_escenario_id UUID,
    p_puntaje_global INTEGER,
    p_nivel_riesgo TEXT,
    p_senales JSONB,
    p_contexto_financiero JSONB,
    p_recomendacion TEXT
)
RETURNS UUID AS $$
DECLARE
    v_nueva_captura_id UUID;
BEGIN
    INSERT INTO capturas_riesgo (
        cliente_id,
        escenario_id,
        puntaje_global,
        nivel_riesgo_actual,
        senales,
        contexto_financiero,
        texto_recomendacion,
        estado_accion
    ) VALUES (
        p_cliente_id,
        p_escenario_id,
        p_puntaje_global,
        p_nivel_riesgo,
        p_senales,
        p_contexto_financiero,
        p_recomendacion,
        'Pendiente'
    )
    RETURNING id INTO v_nueva_captura_id;
    
    RETURN v_nueva_captura_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================================================

-- Índice compuesto para búsquedas frecuentes por cliente y estado
CREATE INDEX IF NOT EXISTS idx_capturas_cliente_estado 
ON capturas_riesgo(cliente_id, estado_accion);

-- Índice para búsquedas por rango de puntaje
CREATE INDEX IF NOT EXISTS idx_capturas_puntaje_range 
ON capturas_riesgo(puntaje_global DESC);

-- Índice para búsquedas temporales eficientes
CREATE INDEX IF NOT EXISTS idx_capturas_fecha_desc 
ON capturas_riesgo(created_at DESC);


-- ============================================================================
-- VISTAS ADICIONALES PARA REPORTES
-- ============================================================================

-- Vista: Resumen ejecutivo por cliente
CREATE OR REPLACE VIEW vista_resumen_ejecutivo AS
SELECT 
    c.id AS cliente_id,
    c.nombre_comercial,
    c.segmento,
    COUNT(cr.id) AS total_riesgos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Crítico') AS riesgos_criticos,
    COUNT(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Alto') AS riesgos_altos,
    ROUND(AVG(cr.puntaje_global), 2) AS puntaje_promedio,
    MAX(cr.puntaje_global) AS puntaje_maximo,
    SUM((cr.contexto_financiero->>'monto')::NUMERIC) AS exposicion_total_estimada,
    COUNT(*) FILTER (WHERE cr.estado_accion = 'Pendiente') AS acciones_pendientes
FROM clientes c
LEFT JOIN capturas_riesgo cr ON c.id = cr.cliente_id
GROUP BY c.id, c.nombre_comercial, c.segmento;


-- ============================================================================
-- QUERIES PARA MÉTRICAS DE NEGOCIO (KPIs)
-- ============================================================================

-- KPI: Tiempo promedio de resolución
SELECT 
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) AS dias_promedio_resolucion
FROM capturas_riesgo
WHERE estado_accion = 'Completado';

-- KPI: Tasa de riesgos críticos vs totales
SELECT 
    ROUND(
        (COUNT(*) FILTER (WHERE nivel_riesgo_actual = 'Crítico')::NUMERIC / COUNT(*)::NUMERIC) * 100,
        2
    ) AS porcentaje_riesgos_criticos
FROM capturas_riesgo;

-- KPI: Clientes con riesgos críticos activos
SELECT COUNT(DISTINCT cliente_id) AS clientes_con_riesgos_criticos
FROM capturas_riesgo
WHERE nivel_riesgo_actual = 'Crítico'
AND estado_accion IN ('Pendiente', 'En Proceso');


-- ============================================================================
-- FIN DE CONSULTAS
-- ============================================================================
