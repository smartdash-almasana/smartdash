// ============================================================================
// TIPOS PARA PANTALLAS 1A y 1B
// Archivo separado para evitar conflictos con Server Actions
// ============================================================================

/**
 * Card de Cliente para Pantalla 1A
 * Fuente de la Verdad: tabla clientes
 */
export interface ClienteCard {
    id: string;
    nombre_comercial: string;
    razon_social: string;
    segmento: 'Pyme' | 'E-commerce' | 'Startup' | 'Creador';
    img_clientes: string | null;
    metadata_negocio?: any;
}

/**
 * Card de Caso Testigo para Pantalla 1B
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 */
export interface CasoTestigoCard {
    captura_id: string;
    cliente_id: string; // Required for navigation
    escenario: string;
    monto_en_riesgo: number | null;
    moneda: string | null;
    nivel_riesgo: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
    nivel_riesgo_sugerido?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo'; // Viene de tabla escenarios
    senal_principal: string | null;
    nombre_comercial: string;
    img_clientes: string | null;
    descripcion_base: string | null;
    segmento: 'Pyme' | 'E-commerce' | 'Startup' | 'Creador';
    puntaje_global: number;
}
