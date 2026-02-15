import { SupabaseClient } from "@supabase/supabase-js";
import { ClinicalEventRow, Severity } from "./clinical-types";
import { buildActionPlan, ActionPlan } from "./clinical-actions";

export interface ClinicalDashboardPayload {
    ok: true;
    sellerId: string;
    health: {
        score: number;
        band: "green" | "yellow" | "red";
        calculated_at: string | null;
        drivers: Array<{
            scenario_key: string;
            entity_type: string;
            entity_id: string;
            severity: string;
            score_impact: number;
            explanation: string;
        }>;
    };
    active_events: Array<{
        id: string;
        scenario_key: string;
        entity_type: string;
        entity_id: string;
        severity: string;
        score_impact: number;
        probability: number | null;
        magnitude: number | null;
        detected_at: string;
        evidence: any;
        explanation: string;
    }>;
    summary: {
        active_count: number;
        by_severity: { low: number; medium: number; high: number; critical: number };
        by_scenario: Record<string, number>;
        top_risks: Array<{ scenario_key: string; severity: string; count: number }>;
    };
    action_plan: ActionPlan;
}

/**
 * Obtiene el payload completo para el Dashboard Clínico
 */
export async function getClinicalDashboardPayload(
    supabaseAdmin: SupabaseClient,
    sellerId: string
): Promise<ClinicalDashboardPayload> {
    // 1. Obtener Health Score
    const { data: healthRow } = await supabaseAdmin
        .from('health_scores')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

    const health = {
        score: healthRow?.score ?? 100,
        band: (healthRow?.band as any) ?? "green",
        calculated_at: healthRow?.calculated_at ?? null,
        drivers: healthRow?.drivers || []
    };

    // 2. Obtener Eventos Activos
    const { data: events } = await supabaseAdmin
        .from('clinical_events')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .order('score_impact', { ascending: false })
        .order('detected_at', { ascending: true });

    const activeEvents = (events || []) as ClinicalEventRow[];

    // 3. Construir Resumen
    const summary = buildSummary(activeEvents);

    // 4. Generar Action Plan
    const action_plan = buildActionPlan(activeEvents, health);

    return {
        ok: true,
        sellerId,
        health,
        active_events: activeEvents.map(e => ({
            id: e.id,
            scenario_key: e.scenario_key,
            entity_type: e.entity_type,
            entity_id: e.entity_id,
            severity: e.severity,
            score_impact: e.score_impact,
            probability: e.probability ?? null,
            magnitude: e.magnitude ?? null,
            detected_at: e.detected_at,
            evidence: e.evidence,
            explanation: e.explanation
        })),
        summary,
        action_plan
    };
}

/**
 * Agrega y resume las métricas de los eventos activos
 */
export function buildSummary(activeEvents: ClinicalEventRow[]) {
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    const byScenario: Record<string, number> = {};
    const riskGroups: Record<string, { scenario_key: string; severity: string; count: number }> = {};

    activeEvents.forEach(e => {
        // Por severidad
        const sev = e.severity as keyof typeof bySeverity;
        if (bySeverity[sev] !== undefined) bySeverity[sev]++;

        // Por escenario
        byScenario[e.scenario_key] = (byScenario[e.scenario_key] || 0) + 1;

        // Para riesgos top (Agrupados por escenario + severidad)
        const groupKey = `${e.scenario_key}:${e.severity}`;
        if (!riskGroups[groupKey]) {
            riskGroups[groupKey] = { scenario_key: e.scenario_key, severity: e.severity, count: 0 };
        }
        riskGroups[groupKey].count++;
    });

    const topRisks = Object.values(riskGroups)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        active_count: activeEvents.length,
        by_severity: bySeverity,
        by_scenario: byScenario,
        top_risks: topRisks
    };
}
