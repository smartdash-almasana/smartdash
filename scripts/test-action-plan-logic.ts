import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    const { supabaseAdmin } = await import("../lib/supabase-server");
    const { getClinicalDashboardPayload } = await import("../lib/engine/smartseller/clinical-dashboard");

    const sellerId = "59925004";
    console.log(`Testing dashboard payload generation for ${sellerId}...`);

    try {
        const payload = await getClinicalDashboardPayload(supabaseAdmin, sellerId);
        console.log("\n🏥 Health Status:");
        console.log(`   Score: ${payload.health.score} [${payload.health.band}]`);

        console.log("\n📋 Action Plan Steps:");
        payload.action_plan.steps.forEach((s, i) => {
            console.log(`${i + 1}. [Urg: ${s.urgency_score}] ${s.title}`);
            console.log(`   Window: ${s.irreversibility_window}`);
            console.log(`   Rationale: ${s.rationale}`);
            if (s.deadline_at) console.log(`   Deadline: ${s.deadline_at} (${s.time_remaining_minutes} min)`);
        });

        if (payload.action_plan.steps.length > 0) {
            console.log("\n✨ SUCCESS: Action Plan generated correctly with Urgency metrics.");
        } else {
            console.log("\n⚠️ No steps generated (Normal for clean account).");
        }

    } catch (err) {
        console.error("❌ Test failed:", err);
    }
}

main();
