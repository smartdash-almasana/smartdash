import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * Script para validar el endpoint del Dashboard Clínico.
 */
async function runDashboardSmokeTest() {
    const sellerId = process.env.SELLER_ID || "59925004";
    const internalSecret = process.env.INTERNAL_SECRET;
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    if (!internalSecret) {
        console.error("❌ INTERNAL_SECRET not set in env");
        process.exit(1);
    }

    console.log(`🚀 Iniciando Dashboard Smoke Test para Seller: ${sellerId}`);
    console.log(`🔗 URL Base: ${baseUrl}`);

    try {
        // 1. Probar lectura simple (sin refresh)
        console.log("\n[1/2] Probando lectura simple (GET payload)...");
        const res1 = await fetch(`${baseUrl}/api/internal/clinical/dashboard?sellerId=${sellerId}`, {
            headers: { "x-internal-secret": internalSecret }
        });

        if (!res1.ok) {
            const errorText = await res1.text();
            throw new Error(`GET failed (${res1.status}): ${errorText}`);
        }

        const data1 = await res1.json();
        validatePayload(data1, "Lectura Simple");

        // 2. Probar lectura con refresh
        console.log("\n[2/2] Probando lectura con REFRESH=1...");
        const res2 = await fetch(`${baseUrl}/api/internal/clinical/dashboard?sellerId=${sellerId}&refresh=1`, {
            headers: { "x-internal-secret": internalSecret }
        });

        if (!res2.ok) {
            const errorText = await res2.text();
            throw new Error(`GET Refresh failed (${res2.status}): ${errorText}`);
        }

        const data2 = await res2.json();
        validatePayload(data2, "Lectura con Refresh");

        // Validar orden de eventos
        const events = data2.active_events;
        let isSorted = true;
        for (let i = 0; i < events.length - 1; i++) {
            if (events[i].score_impact < events[i + 1].score_impact) {
                isSorted = false;
                break;
            }
        }

        if (isSorted) {
            console.log("✅ Eventos correctamente ordenados por impacto Desc.");
        } else {
            console.warn("⚠️ Advertencia: Eventos no están perfectamente ordenados por impacto.");
        }

        // Mostrar Top 3 Acciones
        console.log("\n📋 Top 3 Acciones sugeridas (Ordenadas por Urgencia):");
        data2.action_plan.steps.slice(0, 3).forEach((s: any, i: number) => {
            console.log(`   ${i + 1}. [Urg: ${s.urgency_score}] ${s.title} (${s.action_type})`);
            console.log(`      Rationale: ${s.rationale}`);
            console.log(`      Window: ${s.irreversibility_window}${s.time_remaining_minutes ? ` (${s.time_remaining_minutes} min left)` : ""}`);
        });

        console.log("\n✨ SUCCESS: El Dashboard Clínico funciona correctamente.");
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ ERROR en el Dashboard Smoke Test:", error.message);
        if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
            console.log("💡 Tip: Asegúrate de que el servidor Next.js esté corriendo (npm run dev).");
        }
        process.exit(1);
    }
}

function validatePayload(data: any, context: string) {
    if (!data.ok) throw new Error(`${context}: 'ok' is false`);
    if (typeof data.health.score !== 'number' || data.health.score < 0 || data.health.score > 100) {
        throw new Error(`${context}: Score inválido (${data.health.score})`);
    }
    if (!["green", "yellow", "red"].includes(data.health.band)) {
        throw new Error(`${context}: Band inválida (${data.health.band})`);
    }
    if (!Array.isArray(data.active_events)) {
        throw new Error(`${context}: active_events debe ser un array`);
    }
    if (!data.summary || typeof data.summary.active_count !== 'number') {
        throw new Error(`${context}: summary inválido`);
    }
    if (!data.action_plan || !Array.isArray(data.action_plan.steps)) {
        throw new Error(`${context}: action_plan.steps debe ser un array`);
    }
    if (data.action_plan.steps.length > 5) {
        throw new Error(`${context}: action_plan no debe exceder 5 steps`);
    }

    let lastUrgency = 101;
    data.action_plan.steps.forEach((s: any) => {
        if (s.priority < 1 || s.priority > 5) throw new Error(`${context}: Prioridad inválida (${s.priority})`);
        if (typeof s.urgency_score !== 'number' || s.urgency_score < 0 || s.urgency_score > 100) {
            throw new Error(`${context}: urgency_score inválida (${s.urgency_score})`);
        }
        if (s.urgency_score > lastUrgency) {
            throw new Error(`${context}: Orden incorrecto por urgency_score (${s.urgency_score} > ${lastUrgency})`);
        }
        lastUrgency = s.urgency_score;

        if (s.action_type === 'dispatch_order' && s.meta?.evidence?.remaining_time_ms !== undefined) {
            if (!s.deadline_at || typeof s.time_remaining_minutes !== 'number') {
                throw new Error(`${context}: Falta deadline_at/time_remaining_minutes para dispatch_order con evidencia`);
            }
        }
    });

    console.log(`✅ ${context}: Payload validado (Score: ${data.health.score}, Eventos: ${data.summary.active_count}, Acciones: ${data.action_plan.steps.length})`);
}

runDashboardSmokeTest();
