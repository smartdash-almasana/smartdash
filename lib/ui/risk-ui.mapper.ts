// lib/ui/risk-ui.mapper.ts
// Mapper de dominio a UI - Usa enums en español

import { RiskSnapshot, RiskEvaluation, NivelRiesgo } from '@/lib/domain/risk';

/**
 * Diccionario de colores para nivel de riesgo (español)
 * Keys alineadas al contrato DashboardRisk
 */
const NIVEL_RIESGO_COLORS: Record<NivelRiesgo, string> = {
  'Crítico': '#EF4444', // Red-500
  'Alto': '#F97316',    // Orange-500
  'Medio': '#F59E0B',   // Amber-500
  'Bajo': '#10B981',    // Emerald-500
};

export const RiskUiMapper = {
  /**
   * Convierte nivel_riesgo (español) a color hex
   */
  getLevelColor(nivel: NivelRiesgo | string): string {
    return NIVEL_RIESGO_COLORS[nivel as NivelRiesgo] || '#94A3B8'; // Slate-400 fallback
  },

  /**
   * Obtiene el texto de impacto formateado
   */
  getImpactText(snapshot: RiskSnapshot): string {
    const context = snapshot.financial_context || {};
    const amount = context.estimated_cost ?? context.loss_projection ?? 0;

    if (amount === 0) return "Sin impacto financiero estimado";

    return `$${amount.toLocaleString('en-US')} USD RIESGO PROYECTADO`;
  },

  /**
   * Transforma RiskSnapshot a RiskEvaluation para componente Gauge
   */
  toEvaluation(snapshot: RiskSnapshot): RiskEvaluation {
    return {
      score: snapshot.global_score,
      nivel_riesgo: snapshot.nivel_riesgo,
      summary: snapshot.scenario_description || "Sin descripción disponible",
      recommendations: snapshot.recommendation_text ? [snapshot.recommendation_text] : [],
      color: this.getLevelColor(snapshot.nivel_riesgo),
    };
  }
};
