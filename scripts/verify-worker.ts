
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
    // Dynamic imports to ensure env loaded
    const { runWebhookWorker } = await import('../lib/engine/smartseller/webhook-worker');
    const { supabaseAdmin } = await import('../lib/supabase-server');

    console.log('[Test] Setup: ensuring client exists...');
    // Ensure client exists for linking
    const { error: clientError } = await supabaseAdmin
        .from('clientes')
        .insert({
            nombre_comercial: 'Worker Test Client',
            razon_social: 'Worker Test Corp',
            segmento: 'E-commerce',
            email_contacto: 'worker@test.com',
            metadata_negocio: { meli_user_id: 'worker_user_123' }
        });
    if (clientError) console.log('[Test] Client insert info:', clientError.code); // likely duplicate

    console.log('[Test] Inserting test webhook events...');
    // Insert 2 pending events
    const payloads = [
        { topic: 'orders', resource: '/orders/worker-test-1', user_id: 'worker_user_123' },
        { topic: 'orders', resource: '/orders/worker-test-2', user_id: 'worker_user_123' }
    ];

    for (const p of payloads) {
        await supabaseAdmin.from('webhook_events').insert({
            dedupe_key: `worker-test-${Date.now()}-${p.resource}`,
            provider: 'test-worker',
            topic: p.topic,
            resource: p.resource,
            user_id: p.user_id,
            payload: { test: true },
            status: 'pending'
        });
    }

    console.log('[Test] Running worker...');
    const result = await runWebhookWorker(5);
    console.log('[Test] Worker Result:', result);
}

run();
