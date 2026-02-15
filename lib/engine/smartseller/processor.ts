
import { supabaseAdmin } from '@/lib/supabase-server';

// --- HELPERS ---
function cleanResourceId(resource: string | undefined, prefix: string): string | null {
    if (!resource || !resource.includes(prefix)) return null;
    try {
        const after = resource.split(prefix)[1];
        if (!after) return null;
        return after.split('?')[0].split('#')[0];
    } catch { return null; }
}

async function evaluateSellerMomentum(sellerId: string) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const SCENARIOS = ['sla_questions_overdue', 'sla_questions_answer_late', 'questions_backlog_critical'];

    // 1. Count Recent Clinical Events
    const { count } = await supabaseAdmin
        .from('clinical_events')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .in('scenario_key', SCENARIOS)
        .gt('detected_at', fortyEightHoursAgo);

    if (count !== null && count >= 8) { // Threshold 8
        // 2. Idempotency (24h Window)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: existing } = await supabaseAdmin
            .from('clinical_events')
            .select('id', { count: 'exact', head: true })
            .eq('scenario_key', 'seller_risk_momentum')
            .eq('seller_id', sellerId)
            .gt('detected_at', twentyFourHoursAgo);

        if (!existing) {
            await supabaseAdmin.from('clinical_events').insert({
                entity_type: 'seller',
                entity_id: sellerId,
                scenario_key: 'seller_risk_momentum',
                severity: 'high',
                score_impact: 20,
                rule_version: 1,
                seller_id: sellerId,
                detected_at: new Date().toISOString(),
                evidence: {
                    trigger_event_count: count,
                    threshold: 8,
                    window_hours: 48,
                    evaluated_at: new Date().toISOString()
                }
            });
            console.log(`[Processor] DETECTED: seller_risk_momentum for seller ${sellerId} (Count: ${count})`);
        }
    }
}

async function evaluateQuestionsBacklog(sellerId: string) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const OPEN_STATUSES = ['UNANSWERED', 'OPEN', 'PENDING', 'UNANSWERED_QUESTION', 'WAITING_ANSWER'];

    // 1. Count Overdue Questions
    const { count } = await supabaseAdmin
        .from('question_snapshots')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .in('status', OPEN_STATUSES)
        .lt('date_created', twoHoursAgo);

    if (count !== null && count >= 5) { // Threshold 5
        // 2. Idempotency (12h Window for Seller-Level Event)
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        const { count: existing } = await supabaseAdmin
            .from('clinical_events')
            .select('id', { count: 'exact', head: true })
            .eq('scenario_key', 'questions_backlog_critical')
            .eq('entity_id', sellerId)
            .gt('detected_at', twelveHoursAgo);

        if (!existing) {
            await supabaseAdmin.from('clinical_events').insert({
                entity_type: 'seller',
                entity_id: sellerId,
                scenario_key: 'questions_backlog_critical',
                severity: 'high',
                score_impact: 25,
                rule_version: 1,
                seller_id: sellerId,
                detected_at: new Date().toISOString(),
                evidence: {
                    open_count: count,
                    threshold: 5,
                    evaluated_at: new Date().toISOString()
                }
            });
            console.log(`[Processor] DETECTED: questions_backlog_critical for seller ${sellerId} (Count: ${count})`);
        }
    }
}

async function evaluateSellerRecovery(sellerId: string) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const CRITICAL_SCENARIOS = ['sla_questions_overdue', 'questions_backlog_critical', 'seller_risk_momentum'];

    // 1. Check for Critical Events in last 24h (Must be 0)
    const { count: criticalCount } = await supabaseAdmin
        .from('clinical_events')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .in('scenario_key', CRITICAL_SCENARIOS)
        .gt('detected_at', twentyFourHoursAgo);

    if (criticalCount === 0) {
        // 2. Check for Historical Events (Must be > 0)
        const { count: historicalCount } = await supabaseAdmin
            .from('clinical_events')
            .select('id', { count: 'exact', head: true })
            .eq('seller_id', sellerId);

        if (historicalCount && historicalCount > 0) {
            // 3. Idempotency (24h Window)
            const { count: existing } = await supabaseAdmin
                .from('clinical_events')
                .select('id', { count: 'exact', head: true })
                .eq('scenario_key', 'seller_recovery_stable')
                .eq('seller_id', sellerId)
                .gt('detected_at', twentyFourHoursAgo);

            if (!existing) {
                await supabaseAdmin.from('clinical_events').insert({
                    entity_type: 'seller',
                    entity_id: sellerId,
                    scenario_key: 'seller_recovery_stable',
                    severity: 'positive',
                    score_impact: -15,
                    rule_version: 1,
                    seller_id: sellerId,
                    detected_at: new Date().toISOString(),
                    evidence: {
                        critical_last_24h: 0,
                        historical_events: historicalCount,
                        bonus: 'active_recovery',
                        evaluated_at: new Date().toISOString()
                    }
                });
                console.log(`[Processor] DETECTED: seller_recovery_stable for seller ${sellerId}`);
            }
        }
    }
}

/**
 * Procesa un evento de webhook de Mercado Libre y actualiza el estado normalizado y clínico.
 * ...
 */
export async function processWebhookEvent(event: any): Promise<void> {
    // Validaciones iniciales: soportamos orders y questions
    if (!event?.topic || !event?.resource) return;

    // Resolvemos Seller ID (Cliente) tempranamente para vincular snapshots y eventos
    // Robustez: Usamos .limit(1).maybeSingle() para evitar excepciones si hay duplicados
    const { data: clientData } = await supabaseAdmin
        .from('clientes')
        .select('id')
        .filter('metadata_negocio->>meli_user_id', 'eq', event.user_id)
        .limit(1) // Pick first if duplicates exist
        .maybeSingle();

    const sellerId = clientData?.id;
    if (!sellerId) {
        console.warn(`[Processor] SKIP: No linked client for Meli User ID ${event.user_id}`);
        return;
    }

    // --- RAMA: QUESTIONS ---
    if (event.topic === 'questions') {
        const payload = event.payload || {};

        let questionId = cleanResourceId(event.resource, '/questions/');
        if (!questionId && payload.id) questionId = payload.id;
        if (!questionId && payload.question_id) questionId = payload.question_id;

        if (!questionId) {
            console.warn(`[Processor] SKIP: No question_id found in event ${event.id}`);
            return;
        }

        const dateCreated = payload.date_created || payload.question?.date_created;
        const statusRaw = payload.status || payload.question?.status;
        const status = (statusRaw || 'UNANSWERED').toUpperCase();

        const OPEN_STATUSES = ['UNANSWERED', 'OPEN', 'PENDING', 'UNANSWERED_QUESTION', 'WAITING_ANSWER'];
        const CLOSED_STATUSES = ['ANSWERED', 'CLOSED', 'RESOLVED'];

        const isOpen = OPEN_STATUSES.includes(status);
        const isClosed = CLOSED_STATUSES.includes(status);

        const { error: snapError } = await supabaseAdmin.from('question_snapshots').upsert({
            seller_id: sellerId,
            question_id: questionId,
            status: status,
            date_created: dateCreated,
            item_id: payload.item_id || payload.question?.item_id,
            from_id: payload.from?.id || payload.question?.from?.id,
            raw_payload: payload,
            updated_at: new Date().toISOString()
        }, { onConflict: 'question_id' });

        if (snapError) {
            console.error(`[Processor] Snapshot Error: ${snapError.message}`);
            throw snapError;
        }

        const now = Date.now();
        const createdMs = dateCreated ? new Date(dateCreated).getTime() : 0;

        // C1. SLA: Overdue (> 2h & OPEN)
        if (isOpen && createdMs > 0 && (now - createdMs > 2 * 60 * 60 * 1000)) {
            const scenario = 'sla_questions_overdue';
            const window = new Date(now - 24 * 60 * 60 * 1000).toISOString();

            const { count } = await supabaseAdmin.from('clinical_events')
                .select('id', { count: 'exact', head: true })
                .eq('scenario_key', scenario)
                .eq('entity_id', questionId)
                .gt('detected_at', window);

            if (!count) {
                await supabaseAdmin.from('clinical_events').insert({
                    entity_type: 'question',
                    entity_id: questionId,
                    scenario_key: scenario,
                    severity: 'medium',
                    score_impact: 15,
                    rule_version: 1,
                    seller_id: sellerId,
                    detected_at: new Date().toISOString(),
                    evidence: {
                        event_id: event.id,
                        delay_hours: ((now - createdMs) / 3600000).toFixed(1)
                    }
                });
                console.log(`[Processor] DETECTED: ${scenario} for ${questionId}`);
            }
        }

        // C2. SLA: Late Answer (> 2h & CLOSED)
        let answeredAt = payload.date_answered || payload.answered_at;
        if (!answeredAt && isClosed && payload.last_updated) {
            answeredAt = payload.last_updated; // Fallback
        }
        const answeredMs = answeredAt ? new Date(answeredAt).getTime() : 0;

        if (isClosed && createdMs > 0 && answeredMs > 0 && (answeredMs - createdMs > 2 * 60 * 60 * 1000)) {
            const scenario = 'sla_questions_answer_late';
            const window = new Date(now - 24 * 60 * 60 * 1000).toISOString();

            const { count } = await supabaseAdmin.from('clinical_events')
                .select('id', { count: 'exact', head: true })
                .eq('scenario_key', scenario)
                .eq('entity_id', questionId)
                .gt('detected_at', window);

            if (!count) {
                await supabaseAdmin.from('clinical_events').insert({
                    entity_type: 'question',
                    entity_id: questionId,
                    scenario_key: scenario,
                    severity: 'low',
                    score_impact: 10,
                    rule_version: 1,
                    seller_id: sellerId,
                    detected_at: new Date().toISOString(),
                    evidence: {
                        event_id: event.id,
                        response_time_hours: ((answeredMs - createdMs) / 3600000).toFixed(1)
                    }
                });
                console.log(`[Processor] DETECTED: ${scenario} for ${questionId}`);
            }
        }

        // C3. Backlog Check
        try {
            await evaluateQuestionsBacklog(sellerId);
        } catch (err: any) {
            console.error('[Processor] Error evaluating backlog:', err);
        }

        // C4. Momentum Check
        try {
            await evaluateSellerMomentum(sellerId);
        } catch (err: any) {
            console.error('[Processor] Error evaluating momentum:', err);
        }

        // C5. Recovery Check
        try {
            await evaluateSellerRecovery(sellerId);
        } catch (err: any) {
            console.error('[Processor] Error evaluating recovery:', err);
        }

        return;
    }

    // --- RAMA: ORDERS ---
    if (event.topic === 'orders' && event.resource.includes('/orders/')) {
        let orderId = cleanResourceId(event.resource, '/orders/');
        if (!orderId) {
            const match = event.resource.match(/\/orders\/([^/?#]+)/);
            if (match) orderId = match[1];
        }
        if (!orderId) return;

        const { error: snapshotError } = await supabaseAdmin.from('order_snapshots').upsert({
            order_id: orderId,
            user_id: event.user_id,
            application_id: event.application_id,
            status: 'from_webhook',
            total_amount: null,
            currency: null,
            raw_payload: { source: 'webhook_event', webhook_event_id: event.id, payload: event.payload }
        }, { onConflict: 'order_id' });
        if (snapshotError) throw snapshotError;

        try {
            await supabaseAdmin.from('clinical_events').insert({
                entity_type: 'order',
                entity_id: orderId,
                scenario_key: 'sla_breach_risk',
                severity: 'low',
                score_impact: 10,
                rule_version: 1,
                seller_id: sellerId,
                evidence: { webhook_event_id: event.id }
            });
        } catch { /* Ignore duplicados */ }
    }
}
