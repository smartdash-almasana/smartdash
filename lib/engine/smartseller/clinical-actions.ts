import { ClinicalEventRow, ScenarioKey, Severity } from "./clinical-types";

export interface ActionStep {
    id: string;
    priority: 1 | 2 | 3 | 4 | 5;
    title: string;
    action_type: "respond_question" | "dispatch_order" | "replenish_stock" | "reduce_late_dispatch" | "check_connection";
    entity_type: "question" | "order" | "listing" | "seller" | null;
    entity_id: string | null;
    rationale: string;
    checklist: string[];
    urgency_score: number; // 0..100
    deadline_at: string | null;
    time_remaining_minutes: number | null;
    irreversibility_window: string;
    meta: any;
}

export interface ActionPlan {
    generated_at: string;
    steps: ActionStep[];
}

/**
 * Genera un Plan de Acción determinístico basado en eventos activos.
 */
export function buildActionPlan(activeEvents: ClinicalEventRow[], health: any): ActionPlan {
    const steps: ActionStep[] = [];

    // 1. Mapear cada evento activo a una acción con métricas de urgencia
    activeEvents.forEach(event => {
        const step = mapEventToAction(event);
        if (step) steps.push(step);
    });

    // 2. Higiene/Conexión (Heurística simple)
    // Si no hay eventos pero el score es 100, pero tal vez falta data (según evidence del primer evento o health)
    const isDataMissing = activeEvents.some(e => e.evidence?.note?.toLowerCase().includes("default")) ||
        (activeEvents.length === 0 && health.calculated_at === null);

    if (isDataMissing) {
        steps.push({
            id: "check_connection:none:none",
            priority: 2,
            title: "Revisar conexión y permisos",
            action_type: "check_connection",
            entity_type: null,
            entity_id: null,
            rationale: "Sin datos frescos no hay prevención efectiva.",
            checklist: [
                "Verificar tokens activos en Mercado Libre",
                "Reautorizar la aplicación si los permisos han vencido"
            ],
            urgency_score: 50,
            deadline_at: null,
            time_remaining_minutes: null,
            irreversibility_window: "Monitor connection status",
            meta: { reason: "Missing data signals" }
        });
    }

    // 3. Deduplicar y Ordenar
    // ID determinístico: `${action_type}:${entity_type||'none'}:${entity_id||'none'}`
    const uniqueSteps = Array.from(new Map(steps.map(s => [s.id, s])).values());

    const sortedSteps = uniqueSteps
        .sort((a, b) => {
            // Orden por urgencia DESC
            if (b.urgency_score !== a.urgency_score) return b.urgency_score - a.urgency_score;
            // Fallback a impacto ASC (aquí el impacto está en meta)
            if ((b.meta?.score_impact || 0) !== (a.meta?.score_impact || 0)) {
                return (b.meta?.score_impact || 0) - (a.meta?.score_impact || 0);
            }
            return a.title.localeCompare(b.title);
        })
        .slice(0, 5);

    return {
        generated_at: new Date().toISOString(),
        steps: sortedSteps
    };
}

function mapEventToAction(event: ClinicalEventRow): ActionStep | null {
    const id = `${getActionType(event.scenario_key)}:${event.entity_type || 'none'}:${event.entity_id || 'none'}`;
    const now = new Date();

    // Métricas de urgencia base
    let urgency_score = 0;
    let deadline_at: string | null = null;
    let time_remaining_minutes: number | null = null;
    let irreversibility_window = "Normal operational window";

    const evidence = event.evidence || {};

    // Cálculo por escenario
    if (event.scenario_key === 'shipping_deadline') {
        const ratio = evidence.ratio ?? 0.5;
        urgency_score = Math.min(Math.max(Math.round((1 - ratio) * 120), 0), 100);

        if (evidence.remaining_time_ms !== undefined) {
            const deadline = new Date(now.getTime() + evidence.remaining_time_ms);
            deadline_at = deadline.toISOString();
            time_remaining_minutes = Math.floor(evidence.remaining_time_ms / 60000);
        }

        if (ratio < 0.10) irreversibility_window = "Minutes to irreversible damage";
        else if (ratio < 0.25) irreversibility_window = "Hours left to dispatch";
        else irreversibility_window = "Dispatch window shrinking";

    } else if (event.scenario_key === 'sla_question') {
        const t = evidence.t ?? 0;
        const threshold = evidence.threshold ?? 2;
        const factor = t / threshold;
        urgency_score = Math.min(Math.max(Math.round(factor * 35), 0), 100);

        if (factor >= 3) irreversibility_window = "Critical conversion loss risk now";
        else if (factor >= 2) irreversibility_window = "High conversion loss risk today";
        else irreversibility_window = "Response SLA drifting";

    } else if (event.scenario_key === 'stockout_risk') {
        let prob = evidence.probability;
        const days = evidence.days;

        if (prob === undefined && days !== undefined) {
            prob = days >= 7 ? 0 : days >= 3 ? 0.4 : days >= 1 ? 0.7 : 0.9;
        }

        urgency_score = Math.min(Math.max(Math.round((prob ?? 0) * 70), 0), 100);

        if (days !== undefined) {
            const ms = days * 24 * 60 * 60 * 1000;
            deadline_at = new Date(now.getTime() + ms).toISOString();
            time_remaining_minutes = Math.floor(ms / 60000);

            if (days < 1) irreversibility_window = "Stockout imminent (today)";
            else if (days < 3) irreversibility_window = "Stockout risk in days";
            else irreversibility_window = "Monitor replenishment";
        }

    } else if (event.scenario_key === 'reputation_premortem') {
        const projectedRatio = evidence.projected_ratio ?? 0;
        urgency_score = Math.min(Math.max(Math.round(projectedRatio * 100), 0), 100);

        // deadline_at: 7 días a futuro (la ventana de proyección)
        const ms7d = 7 * 24 * 60 * 60 * 1000;
        deadline_at = new Date(now.getTime() + ms7d).toISOString();
        time_remaining_minutes = Math.floor(ms7d / 60000);

        if (projectedRatio > 0.25) irreversibility_window = "Reputation damage imminent (7d)";
        else if (projectedRatio > 0.20) irreversibility_window = "Reputation at high risk this week";
        else irreversibility_window = "Reputation drift detected";
    }

    // Marcar approx si faltan datos
    const note = (event.scenario_key === 'shipping_deadline' && evidence.ratio === undefined) ||
        (event.scenario_key === 'sla_question' && (evidence.t === undefined || evidence.threshold === undefined)) ||
        (event.scenario_key === 'stockout_risk' && evidence.probability === undefined && evidence.days === undefined) ||
        (event.scenario_key === 'reputation_premortem' && evidence.projected_ratio === undefined)
        ? "approx" : undefined;

    const base: ActionStep = {
        id,
        priority: 3, // Default, se sobreescribe abajo
        title: "Action required",
        action_type: "check_connection", // Default
        entity_type: event.entity_type as any,
        entity_id: event.entity_id,
        rationale: event.explanation,
        checklist: [],
        urgency_score,
        deadline_at,
        time_remaining_minutes,
        irreversibility_window,
        meta: {
            score_impact: event.score_impact,
            scenario_key: event.scenario_key,
            evidence: event.evidence,
            note
        }
    };

    switch (event.scenario_key) {
        case 'sla_question':
            return {
                ...base,
                priority: getPriorityBySeverity(event.severity, { critical: 1, high: 2, medium: 3, low: 4 }),
                title: "Responder pregunta pendiente",
                action_type: "respond_question",
                rationale: `${event.explanation}. Evita caída de conversión.`,
                checklist: [
                    "Abrir pregunta en Mercado Libre",
                    "Responder con claridad y una propuesta concreta",
                    "Confirmar envío/plazo si aplica"
                ]
            };

        case 'shipping_deadline':
            return {
                ...base,
                priority: getPriorityBySeverity(event.severity, { critical: 1, high: 1, medium: 2, low: 3 }),
                title: "Despachar orden antes del cierre",
                action_type: "dispatch_order",
                rationale: "Protege reputación y evita penalizaciones operativas.",
                checklist: [
                    "Preparar paquete",
                    "Imprimir etiqueta de envío",
                    "Despachar y confirmar tracking en el punto de entrega"
                ]
            };

        case 'stockout_risk':
            return {
                ...base,
                priority: getPriorityBySeverity(event.severity, { critical: 2, high: 3, medium: 4, low: 5 }),
                title: "Reponer stock (riesgo de quiebre)",
                action_type: "replenish_stock",
                rationale: "Evita pérdida de ventas por falta de disponibilidad de productos.",
                checklist: [
                    "Confirmar stock físico en depósito",
                    "Planificar reposición con el proveedor",
                    "Actualizar cantidad disponible en la publicación"
                ]
            };

        case 'reputation_premortem':
            return {
                ...base,
                priority: getPriorityBySeverity(event.severity, { critical: 1, high: 2, medium: 3, low: 4 }),
                title: "Reducir envíos tardíos para proteger reputación",
                action_type: "reduce_late_dispatch",
                rationale: "El patrón actual de demoras proyecta daño a la reputación en 7 días. Actuar ahora es reversible, después no.",
                checklist: [
                    "Priorizar órdenes críticas con menor tiempo restante",
                    "Ajustar promesas de envío a plazos realistas",
                    "Revisar logística y tiempos de preparación"
                ]
            };

        default:
            return null;
    }
}

function getActionType(scenario: ScenarioKey): string {
    if (scenario === 'sla_question') return 'respond_question';
    if (scenario === 'shipping_deadline') return 'dispatch_order';
    if (scenario === 'stockout_risk') return 'replenish_stock';
    if (scenario === 'reputation_premortem') return 'reduce_late_dispatch';
    return 'unknown';
}

function getPriorityBySeverity(severity: Severity, map: Record<Severity, 1 | 2 | 3 | 4 | 5>): 1 | 2 | 3 | 4 | 5 {
    return map[severity] || 3;
}
