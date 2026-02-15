import { processWebhookEvent } from "../lib/engine/smartseller/processor";
import { computeHealthScoreForSeller } from "../lib/engine/smartseller/health-score";
import { supabaseAdmin } from "../lib/supabase-server";

async function run() {
    const sellerId = "00000000-0000-0000-0000-000000000001";

    // 1. Reset data (solo para seller test)
    await supabaseAdmin.from("clinical_events").delete().eq("seller_id", sellerId);
    await supabaseAdmin.from("question_snapshots").delete().eq("seller_id", sellerId);
    await supabaseAdmin.from("health_scores").delete().eq("seller_id", sellerId);

    // 2. Simular 5 preguntas vencidas
    for (let i = 1; i <= 5; i++) {
        await processWebhookEvent({
            topic: "questions",
            resource: `/questions/test-${i}`,
            payload: {
                id: `test-${i}`,
                status: "UNANSWERED",
                date_created: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            },
            user_id: sellerId
        });
    }

    // 3. Recalcular score
    const result = await computeHealthScoreForSeller(sellerId);

    // 4. Persistir resultado (solo test)
    await supabaseAdmin.from("health_scores").upsert({
        seller_id: sellerId,
        score: result.score,
        drivers: result.drivers,
        band: result.band,
        calculated_at: new Date().toISOString()
    } as any, { onConflict: "seller_id" } as any);

    console.log("RESULT:", result);
}

run().catch(err => {
    console.error("ERROR:", err);
    process.exit(1);
});
