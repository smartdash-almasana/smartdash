
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
    const { runDailyHealthScore } = await import('../lib/engine/smartseller/health-score');
    console.log('[Health] Starting single calculation...');
    const res = await runDailyHealthScore(50);
    console.log('[Health] Result:', res);
}
run();
