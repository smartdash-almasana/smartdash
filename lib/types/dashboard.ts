/**
 * Interface que representa el contrato de datos crudos de la vista vista_dashboard_riesgos_api.
 * Sigue estrictamente la nomenclatura snake_case de la base de datos (Fuente de la Verdad).
 */
export interface DashboardRisk {
    captura_id: string; // uuid
    cliente_id: string; // uuid

    nombre_cliente: string;
    segmento: string;
    vertical: string;
    escenario: string;

    nivel_riesgo: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
    puntaje_global: number;
    monto_en_riesgo: string;

    recomendacion: string | null;
    estado_accion: 'Pendiente' | 'En Proceso' | 'Completado' | 'Descartado';
    senal_principal: string | null;

    fecha_deteccion: string; // ISO format string

    // Campos técnicos (JSONB crudos de la DB)
    signals: any[] | null;
    financial_context: any;
    escenario_id: string;
}
