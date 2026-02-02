"use server"

import { revalidatePath } from "next/cache"
import { getRiskDashboardBySegment, updateNotificationStatus } from "@/lib/services/risk.service"
import { generateMitigationPlan } from "@/lib/services/ai.service"
import { 
  Message, 
  AIActionPlan, 
  RiskEvaluation, 
  RiskSignal 
} from "@/lib/domain/risk"

/**
 * ------------------------------------------------------------------
 * SERVER ACTIONS - CAPA DE TRANSPORTE
 * Único punto de entrada para la UI del Dashboard.
 * Orquesta: Neon DB (Risk Engine) + OpenAI (Intelligence)
 * ------------------------------------------------------------------
 */

/**
 * Obtiene el estado completo del dashboard filtrado por rubro.
 * @param rubro - Segmento de cliente (ej: "E-commerce", "Todos los rubros")
 */
export async function filterByRubro(rubro: string) {
  try {
    // 1. Obtener Snapshot de la Fuente de la Verdad (Neon)
    const data = await getRiskDashboardBySegment(rubro)
    
    if (!data) return null

    // 2. Generar Plan de Mitigación con IA (OpenAI JSON Mode)
    // Se inyecta el contexto financiero real para evitar alucinaciones.
    let aiPlan: AIActionPlan;
    try {
      aiPlan = await generateMitigationPlan({
        id: data.clientContext.clientId,
        clientId: data.clientContext.clientId,
        globalScore: data.evaluation.score,
        signals: data.signals,
        financialContext: data.metrics,
        scenarioDescription: data.evaluation.summary,
        recommendationText: data.evaluation.recommendations[0] || "",
        actionStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (aiError) {
      console.error("AI_SERVICE_WARNING: Fallback activado.", aiError);
      // Fallback seguro en caso de error de API de OpenAI para no romper la UI
      aiPlan = {
        rationale: "El servicio de inteligencia está temporalmente no disponible.",
        immediate_steps: ["Revisar manualmente las señales críticas."],
        expected_impact: "N/A",
        risk_reduction_estimate: 0,
        suggested_message: ""
      }
    }

    // 3. Construir y devolver el DTO consolidado para la UI
    return {
      globalScore: data.evaluation as RiskEvaluation,
      signals: data.signals as RiskSignal[],
      capitalMetrics: data.metrics,
      messages: data.notifications.map((n): Message => ({
        id: n.id,
        type: 'incoming', // Asumimos incoming por defecto para notificaciones
        content: n.message,
        timestamp: n.createdAt,
        priority: n.priority,
        status: n.status
      })),
      aiPlan,
      alertsPending: data.stats.pending,
      context: {
        clientId: data.clientContext.clientId,
        clientName: data.clientContext.segment // O el nombre real si estuviera en la query
      }
    }

  } catch (error) {
    console.error("ACTION_ERROR (filterByRubro):", error)
    throw new Error("Error crítico al procesar datos del dashboard.")
  }
}

/**
 * Marca una notificación como leída y refresca el estado.
 * @param notificationId - ID de la notificación en Neon
 * @param currentRubro - Rubro actual para devolver datos frescos
 */
export async function markAsRead(notificationId: string, currentRubro: string) {
  try {
    await updateNotificationStatus(notificationId, 'read')
    revalidatePath('/') // Revalida la cache de Next.js
    return await filterByRubro(currentRubro)
  } catch (error) {
    console.error("ACTION_ERROR (markAsRead):", error)
    throw error
  }
}

/**
 * Carga inicial del Dashboard (Server Side).
 */
export async function getInitialDashboardData() {
  return await filterByRubro("Todos los rubros")
}