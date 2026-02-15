export interface HealthScore {
    score: number;
    label: string;
    description: string;
    drivers: {
        key: string;
        label: string;
        value: string;
        severity: 'critical' | 'warning' | 'optimal';
    }[];
}

export interface Signal {
    id: string;
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low' | 'preventive';
    probability: number;
    type: 'Reputación' | 'Operaciones' | 'Pricing' | 'Financiero';
    status: 'Activo' | 'Monitoreando' | 'Estable' | 'Analizando';
    icon: string;
}

export interface Question {
    id: string;
    text: string;
    publication: string;
    time: string;
    risk: string;
    status: 'overdue' | 'pending' | 'on_time';
}

export interface ClinicalEvent {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'stable';
    icon: string;
    category: string;
}

export interface Telemetry {
    score: number;
    halfLife: string;
    floorFactor: number;
    penalties: number;
    positives: number;
    syncLatency: string;
}

export const mockHealthScore: HealthScore = {
    score: 82,
    label: 'High Health',
    description: 'Operational systems are stable and protected.',
    drivers: [
        { key: 'SLA', label: 'SLA', value: 'Critical', severity: 'critical' },
        { key: 'BACKLOG', label: 'Backlog', value: 'Pending', severity: 'warning' },
        { key: 'MOMENTUM', label: 'Momentum', value: 'Optimal', severity: 'optimal' },
    ],
};

export const mockSignals: Signal[] = [
    {
        id: '1',
        title: 'Riesgo de Incumplimiento SLA',
        description: '"7 envíos demorados detectados. Riesgo inminente de caída en reputación."',
        severity: 'high',
        probability: 92,
        type: 'Operaciones',
        status: 'Activo',
        icon: 'warning',
    },
    {
        id: '2',
        title: 'Pico de Feedback Negativo',
        description: "Detectamos anomalía en reviews de producto 'X'. Posible falla de lote.",
        severity: 'medium',
        probability: 45,
        type: 'Reputación',
        status: 'Monitoreando',
        icon: 'trending_down',
    },
    {
        id: '3',
        title: 'Stock Out Inminente',
        description: 'Ritmo de venta acelerado en 3 SKUs. Sugerencia de reposición enviada.',
        severity: 'preventive',
        probability: 12,
        type: 'Operaciones',
        status: 'Estable',
        icon: 'inventory_2',
    },
    {
        id: '4',
        title: 'Desvío de Margen Neto',
        description: 'Aumento de costos logísticos no reflejado en precio de venta final.',
        severity: 'low',
        probability: 28,
        type: 'Financiero',
        status: 'Analizando',
        icon: 'payments',
    },
];

export const mockQuestions: Question[] = [
    {
        id: 'q1',
        text: '¿Tienen stock del talle L?',
        publication: 'MLA9283...',
        time: '2h 15m',
        risk: 'Venta en peligro',
        status: 'overdue',
    },
    {
        id: 'q2',
        text: '¿Cuándo llega a Córdoba?',
        publication: 'MLA1104...',
        time: '45m',
        risk: 'Chequear Full',
        status: 'pending',
    },
    {
        id: 'q3',
        text: '¿Aceptan mercado pago?',
        publication: 'MLA7742...',
        time: '12m',
        risk: 'A tiempo',
        status: 'on_time',
    },
];

export const mockClinicalHistory: ClinicalEvent[] = [
    {
        id: 'e1',
        timestamp: 'Hoy, 10:45 AM',
        title: '"Detectado un patrón de respuestas demoradas en Categoría Electrónica"',
        description: 'El tiempo de respuesta subió de 8 min a 42 min. Riesgo inminente de caída en reputación "MercadoLíder Platinum".',
        severity: 'critical',
        icon: 'report_problem',
        category: 'Electrónica',
    },
    {
        id: 'e2',
        timestamp: 'Hoy, 08:20 AM',
        title: '"Stock crítico detectado: Auriculares Pro X12"',
        description: 'Solo quedan 4 unidades. Basado en el ritmo de venta actual, se agotarán antes de las 18:00hs.',
        severity: 'warning',
        icon: 'inventory_2',
        category: 'Logística',
    },
    {
        id: 'e3',
        timestamp: 'Ayer, 20:15 PM',
        title: '"Protección activa: El sistema filtró 3 reclamos automáticos"',
        description: 'Los reclamos por demora de correo fueron gestionados y no afectarán tu termómetro de vendedor.',
        severity: 'stable',
        icon: 'verified',
        category: 'Soporte',
    },
];

export const mockTelemetry: Telemetry = {
    score: 98.4,
    halfLife: '74.2h',
    floorFactor: 0.82,
    penalties: 2,
    positives: 412,
    syncLatency: '124ms',
};
