// lib/domain/risk.ts
// Tipos de dominio alineados al contrato Supabase (enums en español)

/**
 * Nivel de Riesgo - Enums en español según contrato DashboardRisk
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 */
export type NivelRiesgo = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

/**
 * Estado de Acción - Enums en español según contrato DashboardRisk
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 */
export type EstadoAccion = 'Pendiente' | 'En Proceso' | 'Completado' | 'Descartado';

// Estructura exacta de los JSONB signals en DB
export interface RiskSignal {
  id?: string;
  type: string;
  code?: string;
  value?: number | string;
  weight?: number;
  detected_at?: string;
  description?: string;
}

// Estructura de financial_context JSONB
export interface FinancialContext {
  estimated_cost?: number;
  loss_projection?: number;
  currency?: string;
  [key: string]: any;
}

/**
 * Entidad que representa un snapshot de riesgo de DB
 * Usa nomenclatura snake_case y enums en español
 */
export interface RiskSnapshot {
  id: string;
  client_id: string | null;
  global_score: number;
  nivel_riesgo: NivelRiesgo;
  scenario_description: string | null;
  recommendation_text: string | null;
  recommendation_type: string | null;
  signals: RiskSignal[];
  financial_context: FinancialContext;
  estado_accion: EstadoAccion | null;
  created_at: string;
}

/**
 * Datos para el componente Gauge en UI
 */
export interface RiskEvaluation {
  score: number;
  nivel_riesgo: NivelRiesgo;
  summary: string;
  recommendations: string[];
  color: string;
}

/**
 * Plan de Acción IA
 */
export interface AIActionPlan {
  rationale: string;
  immediateSteps: string[];
  expectedImpact: string;
  riskReductionEstimate: number;
  suggestedMessage: string;
}