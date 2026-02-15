
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
    const { processWebhookEvent } = await import('../lib/engine/smartseller/processor');
    const { supabaseAdmin } = await import('../lib/supabase-server');

    // Create dummy client for linking
    const { error: clientError } = await supabaseAdmin
        .from('clientes')
        .insert({
            nombre_comercial: 'Test Client',
            razon_social: 'Test Client S.A.',
            segmento: 'E-commerce', // Must be valid enum
            email_contacto: 'test@example.com',
            metadata_negocio: { meli_user_id: '123456789' }
        });
    if (clientError) console.log('Client might already exist:', clientError.message);

    const testId = `test-evt-${Date.now()}`;
    const mockEvent = {
        id: testId,
        topic: 'orders',
        resource: '/orders/999999999',
        user_id: '123456789',
        application_id: 'app123',
        payload: {
            test: true,
            shipping: { status: 'pending' }
        },
        attempts: 0
    };

    console.log(`[Test] Processing mock event ${testId}...`);
    try {
        await processWebhookEvent(mockEvent);
        console.log('[Test] Success!');
    } catch (e) {
        console.error('[Test] Failed:', e);
        process.exit(1);
    }

    // Idempotency test
    console.log('[Test] Testing idempotency (second run)...');
    try {
        await processWebhookEvent(mockEvent);
        console.log('[Test] Idempotency Success (no error thrown)!');
    } catch (e) {
        console.error('[Test] Idempotency Failed (error thrown):', e);
        // Don't exit, just log
    }
}

run();
