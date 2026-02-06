-- ============================================================================
-- SmartDash FV - Schema de Base de Datos
-- Plataforma de Detección, Análisis y Mitigación de Riesgos Empresariales
-- PostgreSQL 14+ / Supabase Compatible
-- ============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECCIÓN 1: DEFINICIÓN DE TABLAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabla: clientes
-- Descripción: Almacena información de los clientes multi-tenant
-- ----------------------------------------------------------------------------
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_comercial TEXT NOT NULL,
    razon_social TEXT NOT NULL,
    segmento TEXT NOT NULL CHECK (segmento IN ('Pyme', 'E-commerce', 'Startup', 'Creador')),
    email_contacto TEXT NOT NULL,
    telefono TEXT,
    img_url TEXT,  -- URL de imagen del cliente (logo o foto del dueño)
    metadata_negocio JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_segmento ON clientes(segmento);
CREATE INDEX idx_clientes_email ON clientes(email_contacto);

-- Comentarios de documentación
COMMENT ON TABLE clientes IS 'Clientes multi-tenant de la plataforma SmartDash FV';
COMMENT ON COLUMN clientes.segmento IS 'Tipo de negocio: Pyme, E-commerce, Startup, Creador';
COMMENT ON COLUMN clientes.metadata_negocio IS 'Información adicional del negocio en formato JSON';

-- ----------------------------------------------------------------------------
-- Tabla: verticales_negocio
-- Descripción: Categorías principales de riesgo empresarial
-- ----------------------------------------------------------------------------
CREATE TABLE verticales_negocio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios de documentación
COMMENT ON TABLE verticales_negocio IS 'Verticales de análisis de riesgo: Financiero, Operaciones, Legal, Reputación';

-- ----------------------------------------------------------------------------
-- Tabla: escenarios_riesgo
-- Descripción: Catálogo de escenarios de riesgo por vertical
-- ----------------------------------------------------------------------------
CREATE TABLE escenarios_riesgo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_id UUID NOT NULL REFERENCES verticales_negocio(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion_base TEXT,
    nivel_riesgo_sugerido TEXT NOT NULL CHECK (nivel_riesgo_sugerido IN ('Bajo', 'Medio', 'Alto', 'Crítico')),
    puntaje_base INTEGER NOT NULL CHECK (puntaje_base >= 0 AND puntaje_base <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para escenarios_riesgo
CREATE INDEX idx_escenarios_vertical ON escenarios_riesgo(vertical_id);
CREATE INDEX idx_escenarios_nivel ON escenarios_riesgo(nivel_riesgo_sugerido);

-- Comentarios de documentación
COMMENT ON TABLE escenarios_riesgo IS 'Catálogo maestro de escenarios de riesgo asociados a verticales';
COMMENT ON COLUMN escenarios_riesgo.puntaje_base IS 'Puntaje de referencia de 0 a 100';

-- ----------------------------------------------------------------------------
-- Tabla: capturas_riesgo
-- Descripción: Eventos de detección de riesgo con métricas y contexto
-- ----------------------------------------------------------------------------
CREATE TABLE capturas_riesgo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    escenario_id UUID NOT NULL REFERENCES escenarios_riesgo(id) ON DELETE CASCADE,
    
    -- Métricas
    puntaje_global INTEGER NOT NULL CHECK (puntaje_global >= 0 AND puntaje_global <= 100),
    nivel_riesgo_actual TEXT NOT NULL CHECK (nivel_riesgo_actual IN ('Bajo', 'Medio', 'Alto', 'Crítico')),
    
    -- Datos dinámicos
    senales JSONB DEFAULT '{}'::jsonb,
    contexto_financiero JSONB DEFAULT '{}'::jsonb,
    
    -- Acción
    texto_recomendacion TEXT,
    estado_accion TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado_accion IN ('Pendiente', 'En Proceso', 'Completado', 'Descartado')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para capturas_riesgo
CREATE INDEX idx_capturas_cliente ON capturas_riesgo(cliente_id);
CREATE INDEX idx_capturas_escenario ON capturas_riesgo(escenario_id);
CREATE INDEX idx_capturas_nivel_riesgo ON capturas_riesgo(nivel_riesgo_actual);
CREATE INDEX idx_capturas_estado ON capturas_riesgo(estado_accion);
CREATE INDEX idx_capturas_puntaje ON capturas_riesgo(puntaje_global);
CREATE INDEX idx_capturas_fecha ON capturas_riesgo(created_at DESC);

-- Índices JSONB para consultas eficientes
CREATE INDEX idx_capturas_senales ON capturas_riesgo USING GIN (senales);
CREATE INDEX idx_capturas_contexto ON capturas_riesgo USING GIN (contexto_financiero);

-- Comentarios de documentación
COMMENT ON TABLE capturas_riesgo IS 'Tabla maestra de eventos de riesgo detectados para cada cliente';
COMMENT ON COLUMN capturas_riesgo.senales IS 'Señales de alerta en formato JSON con icono y detalle';
COMMENT ON COLUMN capturas_riesgo.contexto_financiero IS 'Contexto monetario del riesgo: monto, etiqueta, moneda';

-- ----------------------------------------------------------------------------
-- Tabla: planes_mitigacion
-- Descripción: Planes de acción para mitigar riesgos detectados
-- ----------------------------------------------------------------------------
CREATE TABLE planes_mitigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    captura_id UUID NOT NULL REFERENCES capturas_riesgo(id) ON DELETE CASCADE,
    pasos_accion JSONB DEFAULT '[]'::jsonb,
    fecha_limite DATE,
    responsable TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para planes_mitigacion
CREATE INDEX idx_planes_captura ON planes_mitigacion(captura_id);
CREATE INDEX idx_planes_fecha_limite ON planes_mitigacion(fecha_limite);
CREATE INDEX idx_planes_responsable ON planes_mitigacion(responsable);

-- Comentarios de documentación
COMMENT ON TABLE planes_mitigacion IS 'Planes de acción para mitigar riesgos detectados';
COMMENT ON COLUMN planes_mitigacion.pasos_accion IS 'Array JSON con los pasos del plan de mitigación';

-- ============================================================================
-- SECCIÓN 2: TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabla
CREATE TRIGGER trigger_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_verticales_updated_at
    BEFORE UPDATE ON verticales_negocio
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_escenarios_updated_at
    BEFORE UPDATE ON escenarios_riesgo
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_capturas_updated_at
    BEFORE UPDATE ON capturas_riesgo
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_planes_updated_at
    BEFORE UPDATE ON planes_mitigacion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- ============================================================================
-- SECCIÓN 3: SEED DE DATOS MAESTROS - "FUENTE DE LA VERDAD"
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CLIENTES DE DEMO (4 segmentos)
-- ----------------------------------------------------------------------------

INSERT INTO clientes (nombre_comercial, razon_social, segmento, email_contacto, telefono, metadata_negocio) VALUES
(
    'Distribuidora San Martín',
    'Distribuidora San Martín S.A. de C.V.',
    'Pyme',
    'contacto@distrisanmartin.com',
    '+52-555-1234567',
    '{
        "industria": "Distribución mayorista",
        "empleados": 45,
        "anio_fundacion": 2010,
        "ubicacion": "Ciudad de México"
    }'::jsonb
),
(
    'ModaClick Store',
    'ModaClick E-commerce SpA',
    'E-commerce',
    'soporte@modaclick.com',
    '+56-2-98765432',
    '{
        "industria": "Moda y accesorios",
        "plataforma": "Shopify",
        "mercados": ["Chile", "Argentina", "Perú"],
        "ventas_mensuales_promedio": 85000
    }'::jsonb
),
(
    'FinTech Pro',
    'FinTech Pro Technologies Inc.',
    'Startup',
    'founders@fintechpro.io',
    '+1-415-5551234',
    '{
        "industria": "Tecnología financiera",
        "etapa": "Serie A",
        "empleados": 18,
        "inversion_recibida": 2500000,
        "fundada": 2022
    }'::jsonb
),
(
    'Laura Méndez - Coach Digital',
    'Laura Méndez Coaching Profesional',
    'Creador',
    'hola@lauramendez.coach',
    '+34-612-345678',
    '{
        "nicho": "Desarrollo personal y productividad",
        "seguidores_instagram": 127000,
        "productos": ["Cursos online", "Mentorías 1-1", "E-books"],
        "plataforma_principal": "Instagram"
    }'::jsonb
);

-- ----------------------------------------------------------------------------
-- VERTICALES DE NEGOCIO
-- ----------------------------------------------------------------------------

INSERT INTO verticales_negocio (nombre, descripcion) VALUES
(
    'Financiero',
    'Riesgos relacionados con flujo de caja, rentabilidad, endeudamiento y sostenibilidad financiera'
),
(
    'Operaciones',
    'Riesgos en procesos operativos, cadena de suministro, tecnología y recursos humanos'
),
(
    'Legal',
    'Riesgos de cumplimiento normativo, contratos, propiedad intelectual y litigios'
),
(
    'Reputación',
    'Riesgos relacionados con imagen de marca, relaciones públicas y satisfacción del cliente'
);

-- ============================================================================
-- SECCIÓN 4: ESCENARIOS DE RIESGO (16 escenarios - 4 por segmento)
-- ============================================================================

-- Variables para almacenar IDs de verticales (se usarán en los INSERTs)
DO $$
DECLARE
    v_financiero_id UUID;
    v_operaciones_id UUID;
    v_legal_id UUID;
    v_reputacion_id UUID;
BEGIN
    -- Obtener IDs de verticales
    SELECT id INTO v_financiero_id FROM verticales_negocio WHERE nombre = 'Financiero';
    SELECT id INTO v_operaciones_id FROM verticales_negocio WHERE nombre = 'Operaciones';
    SELECT id INTO v_legal_id FROM verticales_negocio WHERE nombre = 'Legal';
    SELECT id INTO v_reputacion_id FROM verticales_negocio WHERE nombre = 'Reputación';

    -- ----------------------------------------------------------------------------
    -- ESCENARIOS PARA PYME
    -- ----------------------------------------------------------------------------
    
    INSERT INTO escenarios_riesgo (vertical_id, titulo, descripcion_base, nivel_riesgo_sugerido, puntaje_base) VALUES
    (
        v_financiero_id,
        'Crisis de Liquidez - Pyme',
        'Disminución abrupta del flujo de caja que compromete la operación diaria y el pago a proveedores',
        'Crítico',
        85
    ),
    (
        v_operaciones_id,
        'Ruptura de Cadena de Suministro - Pyme',
        'Interrupción en el abastecimiento de productos clave que afecta la continuidad operativa',
        'Alto',
        70
    ),
    (
        v_legal_id,
        'Incumplimiento Fiscal - Pyme',
        'Retrasos o errores en obligaciones fiscales que pueden generar multas y sanciones',
        'Alto',
        75
    ),
    (
        v_reputacion_id,
        'Quejas de Clientes Recurrentes - Pyme',
        'Incremento significativo de reclamos que puede afectar la retención y captación de clientes',
        'Medio',
        55
    );

    -- ----------------------------------------------------------------------------
    -- ESCENARIOS PARA E-COMMERCE
    -- ----------------------------------------------------------------------------
    
    INSERT INTO escenarios_riesgo (vertical_id, titulo, descripcion_base, nivel_riesgo_sugerido, puntaje_base) VALUES
    (
        v_financiero_id,
        'Caída de Conversión de Ventas - E-commerce',
        'Reducción drástica en la tasa de conversión que impacta directamente los ingresos',
        'Alto',
        78
    ),
    (
        v_operaciones_id,
        'Falla en Plataforma de Pago - E-commerce',
        'Problemas técnicos en la pasarela de pago que impiden completar transacciones',
        'Crítico',
        90
    ),
    (
        v_legal_id,
        'Vulneración de Datos de Clientes - E-commerce',
        'Brecha de seguridad que expone información sensible de clientes y compromete el cumplimiento GDPR/LGPD',
        'Crítico',
        95
    ),
    (
        v_reputacion_id,
        'Crisis en Redes Sociales - E-commerce',
        'Viralización negativa en redes sociales por producto defectuoso o mal servicio',
        'Alto',
        72
    );

    -- ----------------------------------------------------------------------------
    -- ESCENARIOS PARA STARTUP
    -- ----------------------------------------------------------------------------
    
    INSERT INTO escenarios_riesgo (vertical_id, titulo, descripcion_base, nivel_riesgo_sugerido, puntaje_base) VALUES
    (
        v_financiero_id,
        'Agotamiento de Runway - Startup',
        'Fondos insuficientes para mantener operaciones sin nueva ronda de inversión',
        'Crítico',
        92
    ),
    (
        v_operaciones_id,
        'Pérdida de Talento Clave - Startup',
        'Salida de miembros fundamentales del equipo técnico o de liderazgo',
        'Alto',
        80
    ),
    (
        v_legal_id,
        'Conflicto de Propiedad Intelectual - Startup',
        'Disputa sobre patentes, código o marca que amenaza el modelo de negocio',
        'Alto',
        82
    ),
    (
        v_reputacion_id,
        'Fracaso de Lanzamiento de Producto - Startup',
        'Recepción negativa del mercado ante un producto o feature esperado',
        'Medio',
        65
    );

    -- ----------------------------------------------------------------------------
    -- ESCENARIOS PARA CREADOR
    -- ----------------------------------------------------------------------------
    
    INSERT INTO escenarios_riesgo (vertical_id, titulo, descripcion_base, nivel_riesgo_sugerido, puntaje_base) VALUES
    (
        v_financiero_id,
        'Dependencia de Plataforma Única - Creador',
        'Más del 80% de ingresos dependen de una sola plataforma digital',
        'Alto',
        76
    ),
    (
        v_operaciones_id,
        'Caída de Engagement de Audiencia - Creador',
        'Disminución sostenida en interacciones y alcance del contenido',
        'Medio',
        58
    ),
    (
        v_legal_id,
        'Infracción de Copyright - Creador',
        'Uso no autorizado de material protegido que puede resultar en penalización o demanda',
        'Alto',
        70
    ),
    (
        v_reputacion_id,
        'Polémica Pública - Creador',
        'Controversia viral que daña la imagen personal y relación con sponsors',
        'Crítico',
        88
    );

END $$;

-- ============================================================================
-- SECCIÓN 5: CAPTURAS DE RIESGO - DATOS DE EJEMPLO
-- ============================================================================

DO $$
DECLARE
    -- IDs de clientes
    v_pyme_id UUID;
    v_ecommerce_id UUID;
    v_startup_id UUID;
    v_creador_id UUID;
    
    -- IDs de escenarios
    v_esc_crisis_liquidez UUID;
    v_esc_caida_conversion UUID;
    v_esc_runway UUID;
    v_esc_dependencia_plataforma UUID;
    v_esc_ruptura_suministro UUID;
    v_esc_falla_pago UUID;
    v_esc_polemica UUID;
    v_esc_incumplimiento_fiscal UUID;
BEGIN
    -- Obtener IDs de clientes
    SELECT id INTO v_pyme_id FROM clientes WHERE nombre_comercial = 'Distribuidora San Martín';
    SELECT id INTO v_ecommerce_id FROM clientes WHERE nombre_comercial = 'ModaClick Store';
    SELECT id INTO v_startup_id FROM clientes WHERE nombre_comercial = 'FinTech Pro';
    SELECT id INTO v_creador_id FROM clientes WHERE nombre_comercial = 'Laura Méndez - Coach Digital';
    
    -- Obtener IDs de escenarios
    SELECT id INTO v_esc_crisis_liquidez FROM escenarios_riesgo WHERE titulo = 'Crisis de Liquidez - Pyme';
    SELECT id INTO v_esc_caida_conversion FROM escenarios_riesgo WHERE titulo = 'Caída de Conversión de Ventas - E-commerce';
    SELECT id INTO v_esc_runway FROM escenarios_riesgo WHERE titulo = 'Agotamiento de Runway - Startup';
    SELECT id INTO v_esc_dependencia_plataforma FROM escenarios_riesgo WHERE titulo = 'Dependencia de Plataforma Única - Creador';
    SELECT id INTO v_esc_ruptura_suministro FROM escenarios_riesgo WHERE titulo = 'Ruptura de Cadena de Suministro - Pyme';
    SELECT id INTO v_esc_falla_pago FROM escenarios_riesgo WHERE titulo = 'Falla en Plataforma de Pago - E-commerce';
    SELECT id INTO v_esc_polemica FROM escenarios_riesgo WHERE titulo = 'Polémica Pública - Creador';
    SELECT id INTO v_esc_incumplimiento_fiscal FROM escenarios_riesgo WHERE titulo = 'Incumplimiento Fiscal - Pyme';

    -- ----------------------------------------------------------------------------
    -- CAPTURAS PARA PYME
    -- ----------------------------------------------------------------------------
    
    INSERT INTO capturas_riesgo (
        cliente_id, escenario_id, puntaje_global, nivel_riesgo_actual,
        senales, contexto_financiero, texto_recomendacion, estado_accion
    ) VALUES
    (
        v_pyme_id,
        v_esc_crisis_liquidez,
        87,
        'Crítico',
        '{
            "icono": "alert-triangle",
            "detalle": "Flujo de caja negativo por 3 meses consecutivos",
            "indicadores": ["Cuentas por cobrar > 90 días: 42%", "Ratio corriente: 0.8"]
        }'::jsonb,
        '{
            "monto": 180000,
            "etiqueta": "Déficit de flujo acumulado",
            "moneda": "MXN"
        }'::jsonb,
        'Negociar extensión de plazos con proveedores principales y activar línea de crédito de emergencia. Implementar cobro anticipado con descuento del 5%.',
        'En Proceso'
    ),
    (
        v_pyme_id,
        v_esc_ruptura_suministro,
        68,
        'Alto',
        '{
            "icono": "package-x",
            "detalle": "Proveedor principal con retraso de 15 días en entregas",
            "indicadores": ["Inventario crítico: 4 productos", "Riesgo de quiebre: 35%"]
        }'::jsonb,
        '{
            "monto": 95000,
            "etiqueta": "Ventas potenciales en riesgo",
            "moneda": "MXN"
        }'::jsonb,
        'Diversificar proveedores para productos críticos. Contactar 2 proveedores alternativos en la región con capacidad de entrega en 72 horas.',
        'Pendiente'
    ),
    (
        v_pyme_id,
        v_esc_incumplimiento_fiscal,
        72,
        'Alto',
        '{
            "icono": "file-warning",
            "detalle": "Declaración anual pendiente por 45 días",
            "indicadores": ["Multas acumuladas: $12,500 MXN", "Riesgo de bloqueo fiscal: Medio"]
        }'::jsonb,
        '{
            "monto": 12500,
            "etiqueta": "Multas y recargos acumulados",
            "moneda": "MXN"
        }'::jsonb,
        'Regularizar declaración de inmediato con asesor fiscal. Evaluar programa de condonación de multas. Implementar calendario automático de obligaciones.',
        'Pendiente'
    );

    -- ----------------------------------------------------------------------------
    -- CAPTURAS PARA E-COMMERCE
    -- ----------------------------------------------------------------------------
    
    INSERT INTO capturas_riesgo (
        cliente_id, escenario_id, puntaje_global, nivel_riesgo_actual,
        senales, contexto_financiero, texto_recomendacion, estado_accion
    ) VALUES
    (
        v_ecommerce_id,
        v_esc_caida_conversion,
        79,
        'Alto',
        '{
            "icono": "trending-down",
            "detalle": "Tasa de conversión cayó de 3.2% a 1.8% en 2 semanas",
            "indicadores": ["Abandono de carrito: 78%", "Tiempo de carga: +4 segundos"]
        }'::jsonb,
        '{
            "monto": 145000,
            "etiqueta": "Ingresos mensuales en riesgo",
            "moneda": "USD"
        }'::jsonb,
        'Optimizar velocidad del sitio con CDN. Revisar UX del checkout. Implementar pop-ups de recuperación de carrito con descuento del 10%.',
        'En Proceso'
    ),
    (
        v_ecommerce_id,
        v_esc_falla_pago,
        92,
        'Crítico',
        '{
            "icono": "credit-card-off",
            "detalle": "Pasarela de pago rechazando 45% de transacciones",
            "indicadores": ["Downtime: 6 horas acumuladas", "Quejas de clientes: 127"]
        }'::jsonb,
        '{
            "monto": 68000,
            "etiqueta": "Ventas perdidas en últimas 24 horas",
            "moneda": "USD"
        }'::jsonb,
        'Activar pasarela de respaldo inmediatamente. Escalar ticket crítico con proveedor principal. Comunicar a clientes afectados con cupón de compensación del 15%.',
        'En Proceso'
    );

    -- ----------------------------------------------------------------------------
    -- CAPTURAS PARA STARTUP
    -- ----------------------------------------------------------------------------
    
    INSERT INTO capturas_riesgo (
        cliente_id, escenario_id, puntaje_global, nivel_riesgo_actual,
        senales, contexto_financiero, texto_recomendacion, estado_accion
    ) VALUES
    (
        v_startup_id,
        v_esc_runway,
        94,
        'Crítico',
        '{
            "icono": "fuel",
            "detalle": "Runway restante: 4.5 meses a burn rate actual",
            "indicadores": ["Burn rate mensual: $85,000", "Conversaciones con inversores: 0 activas"]
        }'::jsonb,
        '{
            "monto": 382500,
            "etiqueta": "Fondos restantes proyectados",
            "moneda": "USD"
        }'::jsonb,
        'URGENTE: Reducir burn rate 30% recortando gastos no críticos. Iniciar conversaciones con 5 VCs esta semana. Considerar bridge round de $500K para extender runway 8 meses.',
        'Pendiente'
    );

    -- ----------------------------------------------------------------------------
    -- CAPTURAS PARA CREADOR
    -- ----------------------------------------------------------------------------
    
    INSERT INTO capturas_riesgo (
        cliente_id, escenario_id, puntaje_global, nivel_riesgo_actual,
        senales, contexto_financiero, texto_recomendacion, estado_accion
    ) VALUES
    (
        v_creador_id,
        v_esc_dependencia_plataforma,
        77,
        'Alto',
        '{
            "icono": "link",
            "detalle": "86% de ingresos provienen exclusivamente de Instagram",
            "indicadores": ["Alcance orgánico: -22% vs mes anterior", "Cambios en algoritmo: Alto impacto"]
        }'::jsonb,
        '{
            "monto": 5800,
            "etiqueta": "Ingresos mensuales en riesgo",
            "moneda": "EUR"
        }'::jsonb,
        'Diversificar ingresos urgente: Lanzar canal de YouTube en 30 días. Crear newsletter propia con 1000 suscriptores objetivo. Explorar TikTok y LinkedIn.',
        'Pendiente'
    ),
    (
        v_creador_id,
        v_esc_polemica,
        89,
        'Crítico',
        '{
            "icono": "message-circle-warning",
            "detalle": "Comentario malinterpretado viral: 2.3M impresiones negativas",
            "indicadores": ["Menciones negativas: +340%", "Unfollows: 8,500 en 48h", "Sponsors preocupados: 2"]
        }'::jsonb,
        '{
            "monto": 15000,
            "etiqueta": "Contratos publicitarios en riesgo",
            "moneda": "EUR"
        }'::jsonb,
        'Publicar video de aclaración en próximas 12 horas con tono empático. Contactar sponsors directamente explicando contexto. Pausar contenido promocional por 1 semana. Contratar asesor de crisis de comunicación.',
        'En Proceso'
    );

END $$;

-- ============================================================================
-- SECCIÓN 6: PLANES DE MITIGACIÓN
-- ============================================================================

DO $$
DECLARE
    v_captura_crisis_liquidez UUID;
    v_captura_runway UUID;
    v_captura_falla_pago UUID;
BEGIN
    -- Obtener IDs de capturas específicas
    SELECT cr.id INTO v_captura_crisis_liquidez 
    FROM capturas_riesgo cr
    JOIN escenarios_riesgo er ON cr.escenario_id = er.id
    WHERE er.titulo = 'Crisis de Liquidez - Pyme';

    SELECT cr.id INTO v_captura_runway 
    FROM capturas_riesgo cr
    JOIN escenarios_riesgo er ON cr.escenario_id = er.id
    WHERE er.titulo = 'Agotamiento de Runway - Startup';

    SELECT cr.id INTO v_captura_falla_pago 
    FROM capturas_riesgo cr
    JOIN escenarios_riesgo er ON cr.escenario_id = er.id
    WHERE er.titulo = 'Falla en Plataforma de Pago - E-commerce';

    -- Plan para Crisis de Liquidez - Pyme
    INSERT INTO planes_mitigacion (captura_id, pasos_accion, fecha_limite, responsable) VALUES
    (
        v_captura_crisis_liquidez,
        '[
            {
                "orden": 1,
                "accion": "Reunión urgente con los 3 proveedores principales para negociar extensión de plazos a 60 días",
                "responsable": "Director Financiero",
                "plazo_dias": 3,
                "completado": false
            },
            {
                "orden": 2,
                "accion": "Activar línea de crédito pre-aprobada de $150,000 MXN con banco principal",
                "responsable": "Director Financiero",
                "plazo_dias": 5,
                "completado": false
            },
            {
                "orden": 3,
                "accion": "Implementar programa de descuento 5% por pago anticipado a clientes con facturación pendiente",
                "responsable": "Gerente de Cobranza",
                "plazo_dias": 7,
                "completado": false
            },
            {
                "orden": 4,
                "accion": "Reducir gastos operativos 15% eliminando servicios no críticos",
                "responsable": "Director General",
                "plazo_dias": 10,
                "completado": false
            },
            {
                "orden": 5,
                "accion": "Establecer revisión semanal de flujo de caja con dashboard en tiempo real",
                "responsable": "Contador",
                "plazo_dias": 14,
                "completado": false
            }
        ]'::jsonb,
        CURRENT_DATE + INTERVAL '21 days',
        'Director Financiero'
    );

    -- Plan para Agotamiento de Runway - Startup
    INSERT INTO planes_mitigacion (captura_id, pasos_accion, fecha_limite, responsable) VALUES
    (
        v_captura_runway,
        '[
            {
                "orden": 1,
                "accion": "Reducir burn rate inmediato: Congelar contrataciones y renegociar contratos SaaS",
                "responsable": "CFO",
                "plazo_dias": 7,
                "completado": true
            },
            {
                "orden": 2,
                "accion": "Iniciar outreach con 10 VCs de lista priorizada para Serie A",
                "responsable": "CEO",
                "plazo_dias": 10,
                "completado": false
            },
            {
                "orden": 3,
                "accion": "Preparar pitch deck actualizado con métricas Q4 y proyecciones conservadoras",
                "responsable": "CEO + CFO",
                "plazo_dias": 5,
                "completado": true
            },
            {
                "orden": 4,
                "accion": "Explorar bridge financing de $500K con inversores actuales",
                "responsable": "CFO",
                "plazo_dias": 14,
                "completado": false
            },
            {
                "orden": 5,
                "accion": "Desarrollar plan B: Acuerdo de revenue share con partner estratégico",
                "responsable": "CEO",
                "plazo_dias": 21,
                "completado": false
            }
        ]'::jsonb,
        CURRENT_DATE + INTERVAL '30 days',
        'CEO'
    );

    -- Plan para Falla en Plataforma de Pago - E-commerce
    INSERT INTO planes_mitigacion (captura_id, pasos_accion, fecha_limite, responsable) VALUES
    (
        v_captura_falla_pago,
        '[
            {
                "orden": 1,
                "accion": "Activar pasarela de respaldo (Stripe) inmediatamente como método principal",
                "responsable": "CTO",
                "plazo_dias": 1,
                "completado": true
            },
            {
                "orden": 2,
                "accion": "Abrir ticket crítico P0 con proveedor actual y exigir call de resolución en 4 horas",
                "responsable": "Product Manager",
                "plazo_dias": 1,
                "completado": true
            },
            {
                "orden": 3,
                "accion": "Enviar email a 127 clientes afectados con disculpa y cupón 15% válido por 7 días",
                "responsable": "Customer Success",
                "plazo_dias": 2,
                "completado": false
            },
            {
                "orden": 4,
                "accion": "Implementar monitoreo proactivo de pasarelas con alertas automáticas vía PagerDuty",
                "responsable": "DevOps Engineer",
                "plazo_dias": 5,
                "completado": false
            },
            {
                "orden": 5,
                "accion": "Revisar SLA con proveedor y negociar compensación por downtime",
                "responsable": "COO",
                "plazo_dias": 7,
                "completado": false
            }
        ]'::jsonb,
        CURRENT_DATE + INTERVAL '10 days',
        'CTO'
    );

END $$;

-- ============================================================================
-- SECCIÓN 7: VISTA CONSOLIDADA PARA DASHBOARD
-- ============================================================================

CREATE OR REPLACE VIEW vista_dashboard_riesgos AS
SELECT 
    -- Información del Cliente
    c.nombre_comercial AS "Nombre Cliente",
    c.segmento AS "Segmento",
    
    -- Información del Riesgo
    vn.nombre AS "Vertical",
    er.titulo AS "Escenario",
    
    -- Métricas de Riesgo
    cr.nivel_riesgo_actual AS "Nivel de Riesgo",
    cr.puntaje_global AS "Puntaje Global",
    
    -- Contexto Financiero
    COALESCE(
        CONCAT(
            (cr.contexto_financiero->>'moneda')::TEXT,
            ' ',
            TO_CHAR((cr.contexto_financiero->>'monto')::NUMERIC, 'FM999,999,999')
        ),
        'N/A'
    ) AS "Monto en Riesgo",
    
    -- Acción y Estado
    cr.texto_recomendacion AS "Recomendación",
    cr.estado_accion AS "Estado Acción",
    
    -- Información adicional útil
    cr.senales->>'detalle' AS "Señal Principal",
    cr.created_at AS "Fecha Detección",
    
    -- IDs para operaciones de frontend
    cr.id AS captura_id,
    c.id AS cliente_id
    
FROM capturas_riesgo cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN escenarios_riesgo er ON cr.escenario_id = er.id
INNER JOIN verticales_negocio vn ON er.vertical_id = vn.id

ORDER BY 
    cr.puntaje_global DESC,
    cr.created_at DESC;

-- Comentario de la vista
COMMENT ON VIEW vista_dashboard_riesgos IS 'Vista consolidada para dashboard con todas las métricas de riesgo listas para visualización';

-- ============================================================================
-- SECCIÓN 8: CONSULTAS ÚTILES PARA VERIFICACIÓN
-- ============================================================================

-- Verificar conteo de registros
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN DE DATOS ===';
    RAISE NOTICE 'Clientes: %', (SELECT COUNT(*) FROM clientes);
    RAISE NOTICE 'Verticales: %', (SELECT COUNT(*) FROM verticales_negocio);
    RAISE NOTICE 'Escenarios: %', (SELECT COUNT(*) FROM escenarios_riesgo);
    RAISE NOTICE 'Capturas de Riesgo: %', (SELECT COUNT(*) FROM capturas_riesgo);
    RAISE NOTICE 'Planes de Mitigación: %', (SELECT COUNT(*) FROM planes_mitigacion);
END $$;

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
