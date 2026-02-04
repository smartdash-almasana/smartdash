'use server';

import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';

/**
 * Normaliza jsonb proveniente de Neon
 */
const normalizeJson = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  return value as T;
};

/**
 * 1. ESCENARIOS
 * Vista: v_latest_risks
 */
export async function getScenariosFromDB(clientId: string) {
  try {
    const rows = await sql`
      SELECT 
        id,
        scenario_id,
        vertical,
        scenario_description AS description,
        global_score AS score,
        risk_level,
        signals,
        financial_context,
        recommendation_text,
        action_status AS status,
        created_at
      FROM v_latest_risks
      WHERE client_id = ${clientId}
      ORDER BY created_at DESC
    `;

    return rows.map(r => ({
      ...r,
      signals: normalizeJson(r.signals, []),
      financial_context: normalizeJson(r.financial_context, {}),
    }));
  } catch (error) {
    console.error('❌ getScenariosFromDB:', error);
    return [];
  }
}

/**
 * 2. DASHBOARD
 * Vista: v_client_risk_summary
 */
export async function getDashboardData() {
  try {
    return await sql`
      SELECT 
        client_id,
        name AS client_name,
        company,
        segment,
        critical_risks,
        high_risks,
        avg_risk_score
      FROM v_client_risk_summary
      ORDER BY critical_risks DESC
    `;
  } catch (error) {
    console.error('❌ getDashboardData:', error);
    return [];
  }
}

/**
 * 3. HISTORIAL
 * Tabla real: capturas_riesgo
 */
export async function getHistoryFromDB(clientId: string) {
  try {
    const rows = await sql`
      SELECT
        id,
        scenario_description,
        global_score,
        risk_level,
        signals,
        created_at
      FROM capturas_riesgo
      WHERE client_id = ${clientId}
      ORDER BY created_at DESC
    `;

    return rows.map(r => ({
      ...r,
      signals: normalizeJson(r.signals, []),
    }));
  } catch (error) {
    console.error('❌ getHistoryFromDB:', error);
    return [];
  }
}

/**
 * 4. PERSISTENCIA
 * Tabla: capturas_riesgo (nombres EXACTOS)
 */
export async function saveRiskAnalysis(data: {
  client_id: string;
  scenario_id: string;
  scenario_description: string;
  global_score: number;
  risk_level: string;
  signals: unknown[];
  financial_context: Record<string, unknown>;
  recommendation_text: string;
  recommendation_type?: string;
  score_version?: string;
  client_name?: string;
  client_company?: string;
  client_segment?: string;
}) {
  try {
    await sql`
      INSERT INTO capturas_riesgo (
        client_id,
        scenario_id,
        scenario_description,
        global_score,
        risk_level,
        signals,
        financial_context,
        recommendation_text,
        recommendation_type,
        score_version,
        client_name,
        client_company,
        client_segment,
        action_status
      ) VALUES (
        ${data.client_id},
        ${data.scenario_id},
        ${data.scenario_description},
        ${data.global_score},
        ${data.risk_level},
        ${data.signals},
        ${data.financial_context},
        ${data.recommendation_text},
        ${data.recommendation_type ?? 'manual'},
        ${data.score_version ?? 'v1'},
        ${data.client_name ?? null},
        ${data.client_company ?? null},
        ${data.client_segment ?? null},
        'pending'
      )
    `;

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('❌ saveRiskAnalysis:', error);
    return { success: false };
  }
}
