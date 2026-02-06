'use server';

import { revalidatePath } from 'next/cache';
import { getDashboardRisks, saveRiskSnapshot } from '@/lib/data/risks';
import { normalizeSenales, type SignalCard } from '@/lib/data/normalize-signals';
import type { NivelRiesgo } from '@/lib/domain/risk';

/**
 * Interfaces para la UI - Usando enums en español del contrato DashboardRisk
 */
export interface ScenarioDetail {
  id: string;
  client_id: string;
  scenario_id: string;
  scenario_description: string;
  vertical: string;
  global_score: number;
  nivel_riesgo: string; // ES: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
  financial_context: any;
  signals: any[];
  recommendation_text: string;
  recommendation_type: string;
  estado_accion: string; // ES: 'Pendiente' | 'En Proceso' | 'Completado' | 'Descartado'
  created_at: string;
  notifications?: Notification[];
}

export interface Notification {
  id: string;
  mensaje: string;
  severidad: string;
  tipo_notificacion: string;
  created_at: string;
}

export interface ScenarioCardData {
  id: string;
  scenario_description: string;
  vertical: string;
  nivel_riesgo: string; // ES: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
  global_score: number;
}

export interface DashboardData {
  id: string;
  client_id: string;
  scenario_id: string;
  evaluation: string;
  impact: string;
  score: number;
  nivel_riesgo: string; // ES: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
  signals: SignalCard[]; // Señales normalizadas con peso y tendencia
  financial_context: any;
  mitigationSteps: MitigationStep[];
  notifications: {
    id: string;
    text: string;
    type: 'incoming' | 'system';
    timestamp: string;
    severity: string;
  }[];
}

export interface MitigationStep {
  step_number: number;
  title: string;
  description: string;
  estado: string; // ES: 'Pendiente' | 'En Proceso' | 'Completado' | 'Descartado'
}

export interface HistoryItem {
  id: string;
  scenario_description: string;
  global_score: number;
  nivel_riesgo: string; // ES: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
  created_at: string;
  mitigation_plan: any;
}

/**
 * 1. ESCENARIOS (Pantalla 2)
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 * Pasa nivel_riesgo TAL CUAL viene de la DB (español)
 */
export async function getScenariosFromDB(segment: string): Promise<ScenarioCardData[]> {
  try {
    const risks = await getDashboardRisks();

    // Filtrar por segmento y limitar a 6 como la query original
    return risks
      .filter(r => r.segmento === segment)
      .slice(0, 6)
      .map(r => ({
        id: r.captura_id,
        scenario_description: r.escenario,
        vertical: r.vertical,
        nivel_riesgo: r.nivel_riesgo, // Sin mapeo - valor directo de DB
        global_score: Number(r.puntaje_global)
      }));
  } catch (error) {
    console.error('❌ getScenariosFromDB:', error);
    return [];
  }
}

/**
 * 2. DASHBOARD DATA (Pantalla 3)
 * Orquestador que consume la vista API
 * Pasa nivel_riesgo y estado_accion TAL CUAL vienen de la DB (español)
 */
export async function getDashboardData(scenarioRecordId: string): Promise<DashboardData | null> {
  try {
    const risks = await getDashboardRisks();
    const s = risks.find(r => r.captura_id === scenarioRecordId);

    if (!s) return null;

    // Mapeo al formato que esperan los componentes del dashboard
    // Sin transformaciones ES→EN - valores directos de la DB
    // Señales normalizadas usando la función centralizada
    const normalizedSignals = normalizeSenales(
      s.signals,
      s.nivel_riesgo as NivelRiesgo
    );

    return {
      id: s.captura_id,
      client_id: s.cliente_id,
      scenario_id: s.escenario_id,
      evaluation: s.escenario,
      impact: s.vertical,
      score: Number(s.puntaje_global),
      nivel_riesgo: s.nivel_riesgo, // Sin mapeo - valor directo de DB
      signals: normalizedSignals, // Señales normalizadas con peso para ordenar por prioridad
      financial_context: s.financial_context || {},
      mitigationSteps: [
        {
          step_number: 1,
          title: "Acción Prioritaria",
          description: s.recomendacion || "Revisión manual requerida.",
          estado: s.estado_accion // Sin mapeo - valor directo de DB
        },
        {
          step_number: 2,
          title: "Monitoreo Continuo",
          description: "Activar alertas de señales para variaciones > 5% en tiempo real.",
          estado: 'Pendiente'
        }
      ],
      notifications: [] // No existe tabla de notificaciones en Supabase actualmente
    };
  } catch (error) {
    console.error('❌ getDashboardData:', error);
    return null;
  }
}

/**
 * 3. HISTORIAL
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 * Pasa nivel_riesgo TAL CUAL viene de la DB (español)
 */
export async function getHistoryFromDB(segment: string): Promise<HistoryItem[]> {
  try {
    const risks = await getDashboardRisks();

    // Filtramos por segmento y retornamos los últimos 10
    return risks
      .filter(r => r.segmento === segment)
      .slice(0, 10)
      .map(r => ({
        id: r.captura_id,
        scenario_description: r.escenario,
        global_score: Number(r.puntaje_global),
        nivel_riesgo: r.nivel_riesgo, // Sin mapeo - valor directo de DB
        created_at: r.fecha_deteccion,
        mitigation_plan: null // No implementado en la vista consolidada v1
      }));
  } catch (error) {
    console.error('❌ getHistoryFromDB:', error);
    return [];
  }
}

/**
 * 4. PERSISTENCIA
 * Coordina con la capa de datos de Supabase
 */
export async function saveRiskAnalysis(data: {
  client_id: string;
  scenario_id: string;
  scenario_description: string;
  global_score: number;
  nivel_riesgo: string; // ES: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
  signals: any[];
  financial_context: any;
  recommendation_text: string;
  vertical?: string;
}) {
  try {
    const result = await saveRiskSnapshot({
      client_id: data.client_id,
      scenario_id: data.scenario_id,
      global_score: data.global_score,
      risk_level: data.nivel_riesgo,
      signals: data.signals,
      financial_context: data.financial_context,
      recommendation_text: data.recommendation_text,
      estado_accion: 'Pendiente'
    });

    if (result.success) {
      revalidatePath('/');
    }

    return result;
  } catch (error) {
    console.error('❌ saveRiskAnalysis:', error);
    return { success: false };
  }
}

// ============================================================================
// 5. PANTALLA 1A: CLIENTES
// Server Action para obtener clientes desde Client Components
// NOTA: Los tipos ClienteCard y CasoTestigoCard deben importarse desde @/lib/types/welcome
// ============================================================================

import { getClientes, getAllCasosTestigo } from '@/lib/data/risks';
import type { ClienteCard, CasoTestigoCard } from '@/lib/types/welcome';

/**
 * Server Action: Obtener todos los clientes.
 * Fuente de la Verdad: tabla clientes
 */
export async function getClientesAction(): Promise<ClienteCard[]> {
  try {
    return await getClientes();
  } catch (error) {
    console.error('❌ getClientesAction:', error);
    return [];
  }
}

// ============================================================================
// 6. PANTALLA 1B: CASOS TESTIGO
// Server Action para obtener casos testigo desde Client Components
// ============================================================================

/**
 * Server Action: Obtener todos los casos testigo agrupados por segmento.
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 */
export async function getAllCasosTestigoAction(
  limitePorSegmento: number = 4
): Promise<Record<string, CasoTestigoCard[]>> {
  try {
    return await getAllCasosTestigo(limitePorSegmento);
  } catch (error) {
    console.error('❌ getAllCasosTestigoAction:', error);
    return {};
  }
}

/**
 * Server Action: Obtener casos testigo filtrados por segmento.
 * Útil para la navegación dinámica (/demo?segmento=X)
 */
import { getCasosTestigoBySegmento } from '@/lib/data/risks';

export async function getCasosTestigoBySegmentoAction(
  segmento: string,
  limite: number = 4 // Se puede aumentar si es vista completa
): Promise<CasoTestigoCard[]> {
  try {
    return await getCasosTestigoBySegmento(segmento, limite);
  } catch (error) {
    console.error('❌ getCasosTestigoBySegmentoAction:', error);
    return [];
  }
}

