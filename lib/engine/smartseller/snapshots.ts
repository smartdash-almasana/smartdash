import { SupabaseClient } from "@supabase/supabase-js";
import { ScenarioConfig } from "./clinical-types";

export interface SnapshotData {
    sellerId: string;
    unansweredQuestions: Array<{ id: string; date_created: string }>;
    sellerAvgResponseHours: number;
    paidOrdersNotShipped: Array<{
        id: string;
        remaining_time_ms: number;
        total_allowed_time_ms: number
    }>;
    items: Array<{
        id: string;
        available_quantity: number;
        sales_7d: number
    }>;
    reputationStats: {
        total_orders_30d: number;
        late_orders_30d: number;
    };
    scenarioRegistry: Map<string, ScenarioConfig>;
    evidence: Record<string, any>;
}

/**
 * Carga snapshots operativos desde tablas reales de Supabase.
 * Implementa reglas de derivación v1.
 */
export async function loadLatestSnapshots(
    supabaseAdmin: SupabaseClient,
    sellerId: string
): Promise<SnapshotData | null> {
    const evidence: Record<string, any> = {};
    const now = Date.now();

    try {
        // 1. Unanswered Questions (Derivación desde webhook_events)
        const { data: qEvents } = await supabaseAdmin
            .from('webhook_events')
            .select('payload')
            .eq('user_id', sellerId)
            .eq('topic', 'questions')
            .order('created_at', { ascending: false });

        const unansweredQuestions = (qEvents || [])
            .map(e => (e.payload as any))
            .filter(p => p && (p.status === 'unanswered' || p.status === 'UNDER_REVIEW')) // Ajustar según payload real
            .map(p => ({
                id: p.resource?.split('/').pop() || 'unknown',
                date_created: p.sent || new Date().toISOString()
            }));

        if (unansweredQuestions.length === 0) {
            evidence.questions_note = "No se detectaron preguntas pendientes en webhook_events.";
        }

        // 2. Average Response Hours (Default v1)
        const sellerAvgResponseHours = 2; // TODO: Calcular sobre histórico si existe tabla meli_questions
        evidence.avg_response_note = "Usando default clínico de 2h (histórico no disponible).";

        // 3. Paid Orders Not Shipped (Derivación desde order_snapshots)
        const { data: orderRows } = await supabaseAdmin
            .from('order_snapshots')
            .select('*')
            .eq('user_id', sellerId)
            .in('status', ['paid', 'payment_required']); // Estados que requieren acción

        const paidOrdersNotShipped = (orderRows || []).map(row => {
            const payload = (row.raw_payload as any)?.payload || {};
            const createdAt = new Date(row.created_at).getTime();

            // Regla conservadora: 48h desde creación para despacho
            const totalAllowed = 1000 * 60 * 60 * 48;
            const deadline = createdAt + totalAllowed;
            const remaining = Math.max(0, deadline - now);

            evidence.shipping_note = "Deadline aproximado: 48h desde creación.";

            return {
                id: row.order_id,
                remaining_time_ms: remaining,
                total_allowed_time_ms: totalAllowed
            };
        });

        // 4. Items / Stockout (Derivación desde order_snapshots últimos 7 días)
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: lastSales } = await supabaseAdmin
            .from('order_snapshots')
            .select('raw_payload')
            .eq('user_id', sellerId)
            .gt('created_at', sevenDaysAgo);

        // Agrupar ventas por item_id
        const itemSalesMap: Record<string, number> = {};
        (lastSales || []).forEach(s => {
            const items = (s.raw_payload as any)?.order_items || [];
            items.forEach((it: any) => {
                const id = it.item?.id || it.id;
                if (id) itemSalesMap[id] = (itemSalesMap[id] || 0) + (it.quantity || 1);
            });
        });

        const items = Object.entries(itemSalesMap).map(([id, sales]) => ({
            id,
            available_quantity: 10, // Default v1: asumimos 10 si no hay tabla de inventario
            sales_7d: sales
        }));

        if (items.length > 0) {
            evidence.stock_note = "Ventas 7d calculadas desde order_snapshots. Stock asumido 10u.";
        }

        // 5. Reputation Stats (Derivación desde order_snapshots últimos 30 días)
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: orders30d } = await supabaseAdmin
            .from('order_snapshots')
            .select('is_late')
            .eq('user_id', sellerId)
            .gt('created_at', thirtyDaysAgo);

        const allOrders30d = orders30d || [];
        const total_orders_30d = allOrders30d.length;

        // Predicado persistido en order_snapshots.is_late.
        const late_orders_30d = allOrders30d.filter(o => {
            return o.is_late === true;
        }).length;

        if (total_orders_30d > 0) {
            evidence.reputation_note = `Reputación: ${late_orders_30d}/${total_orders_30d} órdenes tardías en 30d.`;
        } else {
            evidence.reputation_note = "Sin órdenes en los últimos 30 días para análisis de reputación.";
        }

        const reputationStats = { total_orders_30d, late_orders_30d };

        // 6. Load Scenario Registry (kill switch + versioning)
        const scenarioRegistry = await loadScenarioRegistry(supabaseAdmin);

        return {
            sellerId,
            unansweredQuestions,
            sellerAvgResponseHours,
            paidOrdersNotShipped,
            items,
            reputationStats,
            scenarioRegistry,
            evidence
        };

    } catch (error) {
        console.error(`[Snapshots] Error loading for seller ${sellerId}:`, error);
        return null;
    }
}

/**
 * Mapeo de ML User ID (String) a Cliente Interno (UUID).
 * En v1, realizamos un lookup o usamos un placeholder persistente.
 */
export async function getInternalSellerUuid(
    supabaseAdmin: SupabaseClient,
    meliUserId: string
): Promise<string> {
    // Intentar buscar en metadatos de clientes
    const { data: client } = await supabaseAdmin
        .from('clientes')
        .select('id')
        .filter('metadata_negocio->>meli_user_id', 'eq', meliUserId)
        .single();

    if (client) return client.id;

    // Fallback: Si no existe, usamos el primer cliente de la tabla como "Tenant Default"
    // o generamos un UUID determinístico para evitar errores de restricción FK.
    const { data: firstClient } = await supabaseAdmin
        .from('clientes')
        .select('id')
        .limit(1)
        .single();

    return firstClient?.id || '00000000-0000-0000-0000-000000000000';
}

/**
 * Loads the scenario registry from public.clinical_scenarios.
 * Returns a Map<key, ScenarioConfig> for O(1) lookups in the engine.
 * Cached per cron invocation (one query per seller batch, not per seller).
 */
let _cachedRegistry: Map<string, ScenarioConfig> | null = null;

export async function loadScenarioRegistry(
    supabaseAdmin: SupabaseClient
): Promise<Map<string, ScenarioConfig>> {
    if (_cachedRegistry) return _cachedRegistry;

    const { data, error } = await supabaseAdmin
        .from('clinical_scenarios')
        .select('key, default_entity_type, severity_model, max_score, is_active, version');

    if (error) {
        console.error('[Snapshots] Failed to load scenario registry, defaulting all active:', error);
        return new Map();
    }

    const registry = new Map<string, ScenarioConfig>();
    for (const row of data || []) {
        registry.set(row.key, row as ScenarioConfig);
    }

    _cachedRegistry = registry;
    return registry;
}

/** Reset the scenario registry cache (for testing or between cron runs). */
export function resetScenarioRegistryCache(): void {
    _cachedRegistry = null;
}
