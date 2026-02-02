import { sql } from "@/lib/db";
import { 
  RiskEvaluation, 
  RiskSignal, 
  RiskSeverity, 
  RiskLevel 
} from "@/lib/domain/risk";

/**
 * SERVICIO DE RIESGO (SOURCE OF TRUTH)
 * Conexión directa a Neon DB. 
 * Estricto: Sin 'any', todo mapeado a interfaces del dominio.
 */

// 1. Definición estricta del JSONB 'financial_context'
export interface FinancialContext {
  human_capital_index?: number;
  financial_stability_index?: number;
  burn_rate?: number;
  runway_months?: number;
  [key: string]: number | string | undefined; // Flexibilidad controlada para métricas extra
}

// 2. Tipado de la fila cruda de base de datos
interface RiskSnapshotRow {
  id: string;
  client_id: string;
  client_name: string;
  segment: string;
  global_score: number;
  risk_level: string; // Se validará contra el tipo RiskLevel
  scenario_description: string;
  recommendation_text: string;
  recommendation_type: string;
  signals: RiskSignal[]; 
  financial_context: FinancialContext;
  created_at: Date;
}

interface NotificationRow {
  id: string;
  message: string;
  severity: string;
  status: string;
  created_at: Date;
  notification_type: string;
}

// Interfaz de retorno para estadísticas
interface StatsRow {
  pending_count: string; // Postgres COUNT devuelve string (bigint)
}

/**
 * Obtiene el dashboard completo basado en el segmento (rubro).
 */
export async function getRiskDashboardBySegment(segment: string) {
  try {
    // 1. Consulta Principal (Snapshot)
    const snapshotResult = await sql`
      SELECT 
        rs.id,
        rs.client_id,
        c.name as client_name,
        c.segment,
        rs.global_score,
        rs.risk_level,
        rs.scenario_description,
        rs.recommendation_text,
        rs.recommendation_type,
        rs.signals,
        rs.financial_context,
        rs.created_at
      FROM risk_snapshots rs
      JOIN clients c ON rs.client_id = c.id
      WHERE (${segment} = 'Todos los rubros' OR c.segment = ${segment})
      ORDER BY rs.created_at DESC
      LIMIT 1
    `;

    if (snapshotResult.length === 0) {
      return null;
    }

    // Casting seguro a la interfaz definida (Sin 'any')
    const row = snapshotResult[0] as unknown as RiskSnapshotRow;

    // 2. Consulta de Notificaciones
    const notificationsResult = await sql`
      SELECT 
        id, 
        message, 
        severity, 
        status, 
        created_at, 
        notification_type
      FROM notifications
      WHERE client_id = ${row.client_id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    // 3. Consulta de Estadísticas
    const statsResult = await sql`
      SELECT COUNT(*) as pending_count
      FROM notifications
      WHERE client_id = ${row.client_id} AND status = 'pending'
    `;
    
    const statsRow = statsResult[0] as unknown as StatsRow;

    // 4. Mapeo a Dominio (Validación de tipos en tiempo de ejecución si es necesario)
    return {
      clientContext: {
        clientId: row.client_id,
        clientName: row.client_name,
        segment: row.segment
      },
      evaluation: {
        score: Number(row.global_score),
        // Asumimos que la DB guarda strings compatibles con RiskLevel ('low'|'medium'|'high'|'critical')
        level: row.risk_level as RiskLevel, 
        summary: row.scenario_description,
        recommendations: [row.recommendation_text],
        color: mapScoreToColor(Number(row.global_score))
      } as RiskEvaluation,
      signals: (row.signals || []) as RiskSignal[],
      // Aquí está la clave: metrics ahora es FinancialContext, no any
      metrics: row.financial_context || {},
      notifications: notificationsResult.map((n) => {
        const notif = n as unknown as NotificationRow;
        return {
          id: notif.id,
          message: notif.message,
          priority: notif.severity as RiskSeverity,
          status: notif.status as 'pending' | 'read' | 'delivered',
          createdAt: notif.created_at,
          type: notif.notification_type
        };
      }),
      stats: {
        pending: Number(statsRow.pending_count)
      }
    };

  } catch (error) {
    console.error("RISK_SERVICE_ERROR:", error);
    throw error;
  }
}

export async function updateNotificationStatus(notificationId: string, status: string) {
  try {
    await sql`
      UPDATE notifications
      SET 
        status = ${status},
        read_at = CASE WHEN ${status} = 'read' THEN NOW() ELSE read_at END,
        updated_at = NOW()
      WHERE id = ${notificationId}
    `;
    return true;
  } catch (error) {
    console.error("UPDATE_NOTIFICATION_ERROR:", error);
    throw error;
  }
}

// --- Helpers Privados ---

function mapScoreToColor(score: number): string {
  if (score >= 80) return "text-red-500";
  if (score >= 50) return "text-orange-500";
  if (score >= 30) return "text-yellow-500";
  return "text-emerald-500";
}