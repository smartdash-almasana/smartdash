import { SupabaseClient } from "@supabase/supabase-js";
import { ClinicalEventInput, ClinicalEventRow, eventKey } from "./clinical-types";
import * as scoring from "./clinical-scoring";

/**
 * Sincroniza el estado proyectado con la base de datos (Supabase).
 * Implementa lógica de Diff, Upsert y Resolve.
 */
export async function reconcileClinicalEvents(
    supabaseAdmin: SupabaseClient,
    sellerId: string,
    nextEvents: ClinicalEventInput[]
) {
    // 3.1 Leer eventos activos actuales
    const { data: currentActive, error: fetchError } = await supabaseAdmin
        .from('clinical_events')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('status', 'active');

    if (fetchError) throw fetchError;

    const currentActiveRows = (currentActive || []) as ClinicalEventRow[];
    const nextKeys = new Set(nextEvents.map(e => eventKey(e.scenario_key, e.entity_type, e.entity_id)));

    // 3.3 Upsert de nuevos eventos (o actualización de existentes)
    if (nextEvents.length > 0) {
        const payload = nextEvents.map(e => {
            const existing = currentActiveRows.find(
                row => eventKey(row.scenario_key as any, row.entity_type as any, row.entity_id) ===
                    eventKey(e.scenario_key, e.entity_type, e.entity_id)
            );

            return {
                ...e,
                // Si ya existe, mantenemos el detected_at original
                detected_at: existing ? existing.detected_at : new Date().toISOString(),
                // Agregamos una marca de "actualización" en evidence
                evidence: {
                    ...e.evidence,
                    last_reconciliation: new Date().toISOString()
                }
            };
        });

        const { error: upsertError } = await supabaseAdmin
            .from('clinical_events')
            .upsert(
                payload,
                { onConflict: 'seller_id,scenario_key,entity_type,entity_id', ignoreDuplicates: false }
            );

        if (upsertError) {
            console.error("[Clinical Reconcile] Upsert Error:", upsertError);
        }
    }

    // 3.4 Resolve: Marcar como resueltos los eventos que ya no fueron detectados
    const toResolve = currentActiveRows.filter(row => {
        const key = eventKey(row.scenario_key as any, row.entity_type as any, row.entity_id);
        return !nextKeys.has(key);
    });

    if (toResolve.length > 0) {
        const { error: resolveError } = await supabaseAdmin
            .from('clinical_events')
            .update({
                status: 'resolved',
                resolved_at: new Date().toISOString()
            })
            .in('id', toResolve.map(r => r.id))
            .is('resolved_at', null); // Solo si estaba null

        if (resolveError) console.error("[Clinical Reconcile] Resolve Error:", resolveError);
    }

    // 3.5 Recompute Health Score
    // Obtenemos los eventos activos RECIÉN actualizados para el cálculo exacto
    const { data: finalActive } = await supabaseAdmin
        .from('clinical_events')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('status', 'active');

    const activeEvents = (finalActive || []) as ClinicalEventRow[];
    const totalImpact = activeEvents.reduce((sum, e) => sum + (e.score_impact || 0), 0);
    const finalScore = scoring.clampScore(100 - totalImpact);
    const band = scoring.bandFromScore(finalScore);

    // Drivers: Top 3 impactos
    const drivers = activeEvents
        .sort((a, b) => (b.score_impact || 0) - (a.score_impact || 0))
        .slice(0, 3)
        .map(e => ({
            id: e.id,
            scenario_key: e.scenario_key,
            entity_type: e.entity_type,
            entity_id: e.entity_id,
            severity: e.severity,
            score_impact: e.score_impact,
            explanation: e.explanation
        }));

    const { error: scoreError } = await supabaseAdmin
        .from('health_scores')
        .upsert({
            seller_id: sellerId,
            score: finalScore,
            band: band,
            drivers: drivers,
            calculated_at: new Date().toISOString()
        });

    if (scoreError) console.error("[Clinical Reconcile] Score Update Error:", scoreError);

    return {
        sellerId,
        score: finalScore,
        band,
        drivers,
        activeCount: activeEvents.length,
        resolvedCount: toResolve.length
    };
}
