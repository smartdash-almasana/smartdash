
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
    const { runDailyHealthScore } = await import('../lib/engine/smartseller/health-score');

    console.log('[Test] Running Daily Health Score Calculation...');
    const result = await runDailyHealthScore(50);
    console.log('[Test] Computed:', result.computed);
}

run();
