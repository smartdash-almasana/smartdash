import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function runRealSmokeTest() {
    const { supabaseAdmin } = await import("../lib/supabase-server");
    const sellerId = process.env.SELLER_ID || "59925004"; // Un ID real de ML
    const internalSecret = process.env.INTERNAL_SECRET;

    if (!internalSecret) {
        console.error("❌ INTERNAL_SECRET not set in env");
        process.exit(1);
    }

    console.log(`🚀 Iniciando Real Smoke Test para Seller: ${sellerId}`);

    try {
        // 1. Validar unicidad en DB antes de correr
        const { data: duplicates } = await supabaseAdmin
            .from('clinical_events')
            .select('seller_id, scenario_key, entity_type, entity_id')
            .eq('status', 'active');

        // Check for duplicates manually in the result
        const keys = (duplicates || []).map(d => `${d.seller_id}:${d.scenario_key}:${d.entity_type}:${d.entity_id}`);
        const uniqueKeys = new Set(keys);
        if (keys.length !== uniqueKeys.size) {
            console.warn("⚠️ Duplicados detectados en clinical_events activos. La restricción uq_clinical_events_active podría no estar funcionando o ser diferente.");
        } else {
            console.log("✅ No se detectaron duplicados en clinical_events activos.");
        }

        // 2. Ejecutar reval vía fetch (simulado llamando a la lógica para evitar dependencias de red local)
        const { getInternalSellerUuid, loadLatestSnapshots } = await import("../lib/engine/smartseller/snapshots");
        const { computeNextClinicalEvents } = await import("../lib/engine/smartseller/clinical-engine");
        const { reconcileClinicalEvents } = await import("../lib/engine/smartseller/clinical-reconcile");

        const internalUuid = await getInternalSellerUuid(supabaseAdmin, sellerId);
        const snapshots = await loadLatestSnapshots(supabaseAdmin, sellerId);

        if (!snapshots) throw new Error("Snapshots failed");

        const nextEvents = await computeNextClinicalEvents(snapshots);
        const enrichedEvents = nextEvents.map(e => ({
            ...e,
            seller_id: internalUuid,
            evidence: { ...e.evidence, ...snapshots.evidence }
        }));

        const report = await reconcileClinicalEvents(supabaseAdmin, internalUuid, enrichedEvents);

        console.log(`\n📊 Reporte de Reconciliación:`);
        console.log(`   Score: ${report.score} (${report.band})`);
        console.log(`   Eventos Activos: ${report.activeCount}`);
        console.log(`   Eventos Resueltos: ${report.resolvedCount}`);

        // 3. Validar health_scores final
        const { data: scoreRow } = await supabaseAdmin
            .from('health_scores')
            .select('*')
            .eq('seller_id', internalUuid)
            .single();

        if (!scoreRow) {
            console.error("❌ No se encontró health_score para el vendedor.");
            process.exit(1);
        }

        if (scoreRow.score !== report.score || scoreRow.band !== report.band) {
            console.error("❌ Desajuste entre reporte y DB persistida.");
            process.exit(1);
        }

        console.log(`\n✅ Health Score validado en DB: ${scoreRow.score}/100 [${scoreRow.band}]`);
        console.log(`   Drivers: ${scoreRow.drivers.length} detectados.`);

        if (scoreRow.drivers.length > 3) {
            console.error("❌ Error: Más de 3 drivers detectados.");
            process.exit(1);
        }

        console.log("\n✨ SUCCESS: El motor clínico pasó todas las pruebas de endurecimiento.");
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ ERROR en el Smoke Test:", error);
        process.exit(1);
    }
}

runRealSmokeTest().catch(err => {
    console.error(err);
    process.exit(1);
});
