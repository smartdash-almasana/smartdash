
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
    // Dynamic imports
    const { runWebhookWorker } = await import('../lib/engine/smartseller/webhook-worker');
    const { supabaseAdmin } = await import('../lib/supabase-server');

    console.log('[Test] Setup: ensuring client exists...');
    // Ensure client exists for linking
    const { error: clientError } = await supabaseAdmin
        .from('clientes')
        .insert({
            nombre_comercial: 'Worker Test Client V2',
            razon_social: 'Worker Test Corp V2',
            segmento: 'E-commerce',
            email_contacto: 'worker2@test.com',
            metadata_negocio: { meli_user_id: 'worker_user_456' }
        });
    if (clientError) console.log('[Test] Client insert info:', clientError.code);

    console.log('[Test] Inserting 2 test webhook events (pending)...');
    const payloads = [
        { topic: 'orders', resource: '/orders/worker-test-v2-1', user_id: 'worker_user_456' },
        { topic: 'orders', resource: '/orders/worker-test-v2-2', user_id: 'worker_user_456' }
    ];

    for (const p of payloads) {
        await supabaseAdmin.from('webhook_events').insert({
            dedupe_key: `worker-test-v2-${Date.now()}-${p.resource}`,
            provider: 'test-worker-v2',
            topic: p.topic,
            resource: p.resource,
            user_id: p.user_id,
            payload: { test: true },
            status: 'pending'
        });
    }

    console.log('[Test] Calling runWebhookWorker(2)...');
    const result = await runWebhookWorker(2);
    console.log('[Test] Result:', result);
}

run();
