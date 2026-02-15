import { computeNextClinicalEvents } from "../lib/engine/smartseller/clinical-engine";
import { Severity } from "../lib/engine/smartseller/clinical-types";

/**
 * Script de prueba rápida para validar la lógica del motor clínico v1
 */
async function runSmokeTest() {
    console.log("🚀 Iniciando Clinical Engine v1 Smoke Test...");

    const mockParams = {
        sellerId: "test-seller-123",
        unansweredQuestions: [
            { id: "q1", date_created: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() } // 10h hace
        ],
        sellerAvgResponseHours: 2,
        paidOrdersNotShipped: [
            { id: "o1", remaining_time_ms: 1000 * 60 * 60 * 1, total_allowed_time_ms: 1000 * 60 * 60 * 24 } // 1h restante de 24h
        ],
        items: [
            { id: "i1", available_quantity: 5, sales_7d: 35 } // 5 unidades, v=5/día -> Stockout in 1 day
        ]
    };

    console.log("Input:", JSON.stringify(mockParams, null, 2));

    try {
        const events = await computeNextClinicalEvents(mockParams);

        console.log("\n✅ Detecciones del Motor:");
        events.forEach((e, i) => {
            console.log(`[${i + 1}] ${e.scenario_key.toUpperCase()} - Severity: ${e.severity}`);
            console.log(`    Impact: ${e.score_impact} | Expl: ${e.explanation}`);
        });

        const totalImpact = events.reduce((sum, e) => sum + e.score_impact, 0);
        const healthScore = Math.max(0, 100 - totalImpact);

        console.log(`\n🏥 Final Health Score: ${healthScore}/100`);

        if (events.length === 3 && healthScore < 50) {
            console.log("\n✨ Smoke Test CORRECTO: Se detectaron los 3 escenarios esperados.");
        } else {
            console.error("\n❌ Smoke Test FALLIDO: No se detectaron los escenarios esperados.");
        }

    } catch (error) {
        console.error("\n💥 Error durante el Smoke Test:", error);
    }
}

runSmokeTest();
