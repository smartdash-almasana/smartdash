
import { supabaseAdmin } from '@/lib/supabase-server';

export interface HealthScoreResult {
    score: number;
    drivers: any[];
    band: string;
}

const HALF_LIFE_HOURS = Number(process.env.SCORE_HALF_LIFE_HOURS || 24);
const MAX_TOTAL_RAW = Number(process.env.SCORE_MAX_TOTAL_RAW || 300);
const FLOOR_FACTOR = Number(process.env.SCORE_FLOOR_FACTOR || 0.1);

// Helper: Time Decay
function applyTimeDecay(basePenalty: number, detectedAt: string): number {
    const hours = (Date.now() - new Date(detectedAt).getTime()) / (1000 * 60 * 60);
    // lambda = ln(2) / t_half
    const lambda = Math.log(2) / HALF_LIFE_HOURS;
    const weight = Math.exp(-lambda * hours);
    return basePenalty * weight;
}

export async function computeHealthScoreForSeller(sellerId: string): Promise<HealthScoreResult> {
    // 1. Fetch ALL clinical events for seller (decay handles aging)
    // Note: selecting specific columns for efficiency
    const { data: events, error } = await supabaseAdmin
        .from('clinical_events')
        .select('id, scenario_key, severity, detected_at')
        .eq('seller_id', sellerId);

    if (error) {
        console.error(`[HealthScore] Error fetching events for ${sellerId}:`, error);
        throw error;
    }

    // 2. Aggregate penalties by scenario
    const scenarioCounts: Record<string, { count: number, eventId: string, latest_detected_at: string }> = {};
    if (events) {
        for (const ev of events) {
            if (!scenarioCounts[ev.scenario_key]) {
                scenarioCounts[ev.scenario_key] = {
                    count: 0,
                    eventId: ev.id,
                    latest_detected_at: ev.detected_at
                };
            }
            scenarioCounts[ev.scenario_key].count++;
            // Update latest (ISO string comparison works)
            if (ev.detected_at > scenarioCounts[ev.scenario_key].latest_detected_at) {
                scenarioCounts[ev.scenario_key].latest_detected_at = ev.detected_at;
                // Update example event to be the latest one
                scenarioCounts[ev.scenario_key].eventId = ev.id;
            }
        }
    }

    let totalPenalty = 0;
    let totalRawPositivePenaltyBeforeDecay = 0;
    const driversList = [];

    // 3. Calculate penalties
    for (const [key, data] of Object.entries(scenarioCounts)) {
        let rawPenalty = 0;

        if (key === 'sla_breach_risk') {
            // Penalty: 10 per event, cap 30
            rawPenalty = Math.min(30, 10 * data.count);
        } else if (key === 'sla_questions_overdue') {
            // Penalty: 15 per event, cap 45
            rawPenalty = Math.min(45, 15 * data.count);
        } else if (key === 'sla_questions_answer_late') {
            // Penalty: 10 per event, cap 30
            rawPenalty = Math.min(30, 10 * data.count);
        } else if (key === 'questions_backlog_critical') {
            // Penalty: 25 per event, cap 50
            rawPenalty = Math.min(50, 25 * data.count);
        } else if (key === 'seller_risk_momentum') {
            // Penalty: 20 per event, cap 40
            rawPenalty = Math.min(40, 20 * data.count);
        } else if (key === 'seller_recovery_stable') {
            // Bonus: -15 per event (Negative Penalty)
            rawPenalty = -15 * data.count;
        } else {
            // Others: 10 per event, cap 50
            rawPenalty = Math.min(50, 10 * data.count);
        }

        // Apply Time Decay
        const penalty = applyTimeDecay(rawPenalty, data.latest_detected_at);

        totalPenalty += penalty;

        // Only accumulate positive penalties for floor/cap logic
        if (rawPenalty > 0) {
            totalRawPositivePenaltyBeforeDecay += rawPenalty;
        }

        driversList.push({
            scenario_key: key,
            count: data.count,
            penalty: Math.round(penalty), // Round for display
            example_event_id: data.eventId,
            raw_penalty: rawPenalty, // Useful for debugging/audit
            decay_applied: penalty < rawPenalty
        });
    }

    // Stability Cap: prevent extreme historical accumulation
    if (totalRawPositivePenaltyBeforeDecay > MAX_TOTAL_RAW) {
        const overflowRatio = MAX_TOTAL_RAW / totalRawPositivePenaltyBeforeDecay;
        totalPenalty = totalPenalty * overflowRatio;
        totalRawPositivePenaltyBeforeDecay = MAX_TOTAL_RAW;
    }

    // 4. Final Score
    // start with 100, subtract totalPenalty (which might be negative, adding to score)
    // then clamp between 0 and 100
    const calculated = 100 - totalPenalty;
    let finalScore = Math.max(0, Math.min(100, Math.round(calculated)));

    // Dynamic Floor: prevent artificial instant recovery
    // "Scar Tissue": if there is significant historical raw penalty, cap the recovery
    if (totalRawPositivePenaltyBeforeDecay > 0) {
        const maxRecoverableScore = 100 - (totalRawPositivePenaltyBeforeDecay * FLOOR_FACTOR);
        finalScore = Math.min(finalScore, Math.max(0, Math.round(maxRecoverableScore)));
    }

    // 5. Sort drivers by penalty impact
    driversList.sort((a, b) => b.penalty - a.penalty);
    const topDrivers = driversList.slice(0, 3);

    // --- TELEMETRÍA ---
    void supabaseAdmin
        .from('health_score_telemetry' as any)
        .insert({
            seller_id: sellerId,
            calculated_at: new Date().toISOString(),
            total_penalty: Math.round(totalPenalty),
            total_raw_positive: totalRawPositivePenaltyBeforeDecay,
            half_life_hours: HALF_LIFE_HOURS,
            max_total_raw: MAX_TOTAL_RAW,
            floor_factor: FLOOR_FACTOR,
            drivers_snapshot: driversList
        } as any)
        .then((res: any) => {
            if (res?.error) console.error('[HealthScore][Telemetry] API Error:', res.error);
        }, (err: any) => {
            console.error('[HealthScore][Telemetry] Network Error:', err);
        });

    // 6. Determine Band
    let band = 'green';
    if (finalScore < 50) band = 'red';
    else if (finalScore < 80) band = 'yellow';

    return {
        score: finalScore,
        drivers: topDrivers,
        band
    };
}

export async function runDailyHealthScore(limit: number = 50): Promise<{ computed: number }> {
    // 1. List active sellers
    const { data: sellers, error } = await supabaseAdmin
        .from('clientes')
        .select('id')
        .limit(limit);

    if (error) throw error;
    if (!sellers) return { computed: 0 };

    let computedCount = 0;

    // 2. Process each seller
    for (const seller of sellers) {
        try {
            const result = await computeHealthScoreForSeller(seller.id);

            // 3. Upsert health_score
            const { error: upsertError } = await supabaseAdmin
                .from('health_scores')
                .upsert({
                    seller_id: seller.id,
                    score: result.score,
                    band: result.band,
                    drivers: result.drivers,
                    calculated_at: new Date().toISOString()
                }, { onConflict: 'seller_id' });

            if (upsertError) {
                console.error(`[HealthScore] Failed to upsert for ${seller.id}`, upsertError);
            } else {
                computedCount++;
            }
        } catch (err) {
            console.error(`[HealthScore] Failed to compute for ${seller.id}`, err);
        }
    }

    return { computed: computedCount };
}
