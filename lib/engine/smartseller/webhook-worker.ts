
import { supabaseAdmin } from '@/lib/supabase-server';
import { processWebhookEvent } from './processor';

export async function runWebhookWorker(limit: number = 25, workerIdParam?: string): Promise<{ claimed: number; processed: number; failed: number }> {
    const workerId = workerIdParam || `worker-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    let claimedCount = 0;
    let processedCount = 0;
    let failedCount = 0;

    try {
        // B) Claim atómico usando RPC standard
        const { data: events, error: claimError } = await supabaseAdmin
            .rpc('claim_webhook_events', {
                batch_size: limit,
                worker_id: workerId
            });

        if (claimError) {
            console.error('[Worker] Claim error:', claimError);
            return { claimed: 0, processed: 0, failed: 0 };
        }

        if (!events || events.length === 0) {
            return { claimed: 0, processed: 0, failed: 0 };
        }

        claimedCount = events.length;

        // C) Procesar cada evento
        for (const event of events) {
            try {
                // Llamar al procesador existente
                await processWebhookEvent(event);

                // Success: status='done', unlock
                await supabaseAdmin
                    .from('webhook_events')
                    .update({
                        status: 'done',
                        locked_at: null,
                        locked_by: null,
                        processed_at: new Date().toISOString(),
                        error_msg: null
                    })
                    .eq('id', event.id);

                processedCount++;

            } catch (err: any) {
                failedCount++;
                // Attempts already incremented by RPC upon claim
                const currentAttempts = event.attempts || 1;
                const isFinalFailure = currentAttempts >= 5;

                await supabaseAdmin
                    .from('webhook_events')
                    .update({
                        status: isFinalFailure ? 'failed' : 'pending',
                        locked_at: null, // Always release lock
                        locked_by: null,
                        error_msg: err.message || 'Unknown error',
                        last_error: err.message || 'Unknown error' // Keep legacy compatible
                    })
                    .eq('id', event.id);
            }
        }
    } catch (error) {
        console.error('[Worker] Fatal error:', error);
    }

    return { claimed: claimedCount, processed: processedCount, failed: failedCount };
}
