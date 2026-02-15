import { supabaseAdmin } from '@/lib/supabase-server';

// ========== TYPES ==========

export interface HealthScoreData {
    score: number;
    drivers: Array<{
        scenario_key: string;
        penalty: number;
        description: string;
    }>;
    band: 'critical' | 'warning' | 'stable' | 'optimal';
    calculated_at: string;
}

export interface ClinicalEventData {
    id: string;
    scenario_key: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    score_impact: number;
    evidence: Record<string, unknown>;
    detected_at: string;
}

export interface QuestionSnapshotData {
    id: string;
    question_id: string;
    status: string;
    date_created: string;
    raw_payload: Record<string, unknown>;
    updated_at: string;
}

export interface TelemetryStats {
    count: number;
}

// ========== DATA FETCHERS ==========

export async function getLatestHealthScore(sellerId: string): Promise<HealthScoreData | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('health_scores')
            .select('score, drivers, band, calculated_at')
            .eq('seller_id', sellerId)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('[getLatestHealthScore] Error:', error);
            return null;
        }

        return data as HealthScoreData;
    } catch (err) {
        console.error('[getLatestHealthScore] Exception:', err);
        return null;
    }
}

export async function listActiveSignals(sellerId: string): Promise<ClinicalEventData[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('clinical_events')
            .select('id, scenario_key, severity, score_impact, evidence, detected_at')
            .eq('seller_id', sellerId)
            .order('detected_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('[listActiveSignals] Error:', error);
            return [];
        }

        return (data || []) as ClinicalEventData[];
    } catch (err) {
        console.error('[listActiveSignals] Exception:', err);
        return [];
    }
}

export async function listQuestionsSnapshot(sellerId: string): Promise<QuestionSnapshotData[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('question_snapshots')
            .select('id, question_id, status, date_created, raw_payload, updated_at')
            .eq('seller_id', sellerId)
            .order('updated_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('[listQuestionsSnapshot] Error:', error);
            return [];
        }

        return (data || []) as QuestionSnapshotData[];
    } catch (err) {
        console.error('[listQuestionsSnapshot] Exception:', err);
        return [];
    }
}

export async function getTelemetryCount(sellerId: string): Promise<TelemetryStats> {
    try {
        const { count, error } = await supabaseAdmin
            .from('health_score_telemetry')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', sellerId);

        if (error) {
            console.error('[getTelemetryCount] Error:', error);
            return { count: 0 };
        }

        return { count: count || 0 };
    } catch (err) {
        console.error('[getTelemetryCount] Exception:', err);
        return { count: 0 };
    }
}

export async function getLatestTelemetryEntries(sellerId: string, limit = 10): Promise<Array<Record<string, unknown>>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('health_score_telemetry')
            .select('*')
            .eq('seller_id', sellerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[getLatestTelemetryEntries] Error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[getLatestTelemetryEntries] Exception:', err);
        return [];
    }
}
