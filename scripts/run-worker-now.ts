
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
    const { runWebhookWorker } = await import('../lib/engine/smartseller/webhook-worker');
    console.log('[Worker] Starting single processing batch...');
    const res = await runWebhookWorker(50);
    console.log('[Worker] Result:', res);
}
run();
