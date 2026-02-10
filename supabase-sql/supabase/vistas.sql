| table_name                  |
| --------------------------- |
| vista_dashboard_riesgos     |
| vista_resumen_ejecutivo     |
| vista_dashboard_riesgos_api |

| 
vista_dashboard_riesgos.sql
view_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  SELECT c.nombre_comercial AS "Nombre Cliente",
    c.segmento AS "Segmento",
    vn.nombre AS "Vertical",
    er.titulo AS "Escenario",
    cr.nivel_riesgo_actual AS "Nivel de Riesgo",
    cr.puntaje_global AS "Puntaje Global",
    COALESCE(concat(cr.contexto_financiero ->> 'moneda'::text, ' ', to_char((cr.contexto_financiero ->> 'monto'::text)::numeric, 'FM999,999,999'::text)), 'N/A'::text) AS "Monto en Riesgo",
    cr.texto_recomendacion AS "Recomendación",
    cr.estado_accion AS "Estado Acción",
    cr.senales ->> 'detalle'::text AS "Señal Principal",
    cr.created_at AS "Fecha Detección",
    cr.id AS captura_id,
    c.id AS cliente_id
   FROM capturas_riesgo cr
     JOIN clientes c ON cr.cliente_id = c.id
     JOIN escenarios_riesgo er ON cr.escenario_id = er.id
     JOIN verticales_negocio vn ON er.vertical_id = vn.id
  ORDER BY cr.puntaje_global DESC, cr.created_at DESC; |


  
 vista_resumen_ejecutivo.sql
  | view_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  SELECT c.id AS cliente_id,
    c.nombre_comercial,
    c.segmento,
    count(cr.id) AS total_riesgos,
    count(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Crítico'::text) AS riesgos_criticos,
    count(*) FILTER (WHERE cr.nivel_riesgo_actual = 'Alto'::text) AS riesgos_altos,
    round(avg(cr.puntaje_global), 2) AS puntaje_promedio,
    max(cr.puntaje_global) AS puntaje_maximo,
    sum((cr.contexto_financiero ->> 'monto'::text)::numeric) AS exposicion_total_estimada,
    count(*) FILTER (WHERE cr.estado_accion = 'Pendiente'::text) AS acciones_pendientes
   FROM clientes c
     LEFT JOIN capturas_riesgo cr ON c.id = cr.cliente_id
  GROUP BY c.id, c.nombre_comercial, c.segmento; |

 
 
 vista_dashboard_riesgos_api.sql
  | view_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  SELECT cr.id AS captura_id,
    cr.cliente_id,
    cr.escenario_id,
    c.nombre_comercial AS nombre_cliente,
    c.segmento,
    c.img_clientes AS logo_url,
    vn.nombre AS vertical,
    er.titulo AS escenario,
    er.descripcion_base AS descripcion_base,
    cr.nivel_riesgo_actual AS nivel_riesgo,
    cr.puntaje_global,
    COALESCE(concat(cr.contexto_financiero ->> 'moneda'::text, ' ', to_char((cr.contexto_financiero ->> 'monto'::text)::numeric, 'FM999,999,999'::text)), 'N/A'::text) AS monto_en_riesgo,
    cr.texto_recomendacion AS recomendacion,
    cr.estado_accion,
    cr.senales ->> 'detalle'::text AS senal_principal,
    cr.created_at AS fecha_deteccion,
    cr.senales AS signals,
    cr.contexto_financiero AS financial_context
   FROM capturas_riesgo cr
     LEFT JOIN clientes c ON cr.cliente_id = c.id
     LEFT JOIN escenarios_riesgo er ON cr.escenario_id = er.id
     LEFT JOIN verticales_negocio vn ON er.vertical_id = vn.id
  ORDER BY cr.puntaje_global DESC, cr.created_at DESC; |
