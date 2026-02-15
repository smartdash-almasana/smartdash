import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    const { supabaseAdmin } = await import("../lib/supabase-server");
    const { loadLatestSnapshots, getInternalSellerUuid } = await import("../lib/engine/smartseller/snapshots");
    const { computeNextClinicalEvents } = await import("../lib/engine/smartseller/clinical-engine");
    const { reconcileClinicalEvents } = await import("../lib/engine/smartseller/clinical-reconcile");

    const meliId = "TEST_USER";
    console.log(`Running clinical engine directly for ${meliId}...`);

    const internalUuid = await getInternalSellerUuid(supabaseAdmin, meliId);
    console.log(`Internal UUID: ${internalUuid} `);

    const snapshots = await loadLatestSnapshots(supabaseAdmin, meliId);
    if (!snapshots) {
        console.error("Failed to load snapshots");
        return;
    }

    console.log("Snapshots loaded:", JSON.stringify(snapshots, null, 2));

    const nextEvents = await computeNextClinicalEvents(snapshots);
    const enrichedEvents = nextEvents.map(e => ({
        ...e,
        seller_id: internalUuid,
        evidence: { ...e.evidence, ...snapshots.evidence }
    }));

    const report = await reconcileClinicalEvents(supabaseAdmin, internalUuid, enrichedEvents);
    console.log("Reconciliation complete:", JSON.stringify(report, null, 2));
}

main().catch(console.error);
