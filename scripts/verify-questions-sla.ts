
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
    const { runWebhookWorker } = await import('../lib/engine/smartseller/webhook-worker');
    const { runDailyHealthScore } = await import('../lib/engine/smartseller/health-score');
    const { supabaseAdmin } = await import('../lib/supabase-server');

    console.log('[Test] Inserting Overdue Question Webhook...');

    // Create client if needed (reuse existing worker client)
    // We assume 'Worker Test Client V2' from previous step exists with 'worker_user_456'.
    // Or create new one to be clean? I'll use a new one to ensure clean slate for score calc.

    const userId = 'user_qa_sla_1';
    const sellerId = 'uuid_placeholder'; // logic will resolve via client table

    // 1. Create Client
    await supabaseAdmin.from('clientes').insert({
        nombre_comercial: 'QA SLA Client',
        razon_social: 'QA Corp',
        segmento: 'E-commerce',
        email_contacto: 'qa@test.com',
        metadata_negocio: { meli_user_id: userId }
    });

    // 2. Insert Webhook
    // date_created 3 hours ago
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin.from('webhook_events').insert({
        dedupe_key: `qa-sla-${Date.now()}`,
        provider: 'test-qa',
        topic: 'questions',
        resource: '/questions/qa-overdue-1',
        user_id: userId,
        payload: {
            id: 'qa-overdue-1',
            status: 'UNANSWERED',
            date_created: threeHoursAgo,
            item_id: 'item-123',
            from: { id: 'buyer-1' }
        },
        status: 'pending'
    });

    console.log('[Test] Running Worker...');
    const workerRes = await runWebhookWorker(5);
    console.log('[Test] Worker Result:', workerRes);

    console.log('[Test] Running Health Score...');
    const healthRes = await runDailyHealthScore(50);
    console.log('[Test] Health Result:', healthRes);
}

run();
