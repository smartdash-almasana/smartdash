// lib/data/normalize-signals.ts
// Normalización de señales JSONB de Supabase a estructura de tarjetas UI
// Prioridad: Datos → Semántica → UI

import type { NivelRiesgo } from '@/lib/domain/risk';

/**
 * Estructura cruda de "senales" desde la DB
 * Puede venir como objeto con icono/detalle/indicadores
 */
interface RawSenal {
    icono?: string;
    detalle?: string;
    indicadores?: string[];
    tarjetas?: SignalCard[]; // Formato preferido si existe
}

/**
 * Tarjeta de señal normalizada para la UI
 */
export interface SignalCard {
    id: string;
    icono: string;
    titulo: string;
    descripcion: string;
    indicadores: string[];
    tendencia: 'up' | 'down' | 'neutral';
    peso: number; // 1-10, determina orden y prioridad visual
}

/**
 * Mapeo de iconos de Lucide a tendencia implícita
 */
const ICON_TENDENCY_MAP: Record<string, 'up' | 'down' | 'neutral'> = {
    'trending-up': 'up',
    'trending-down': 'down',
    'alert-triangle': 'down',
    'alert-circle': 'down',
    'fuel': 'down',
    'battery-low': 'down',
    'server-crash': 'down',
    'credit-card-off': 'down',
    'package-x': 'down',
    'package-open': 'down',
    'star-off': 'down',
    'message-circle-warning': 'down',
    'file-warning': 'down',
    'scale': 'neutral',
    'users-round': 'neutral',
    'link': 'neutral',
    'handshake': 'down',
    'file-badge': 'neutral',
    'computer': 'neutral',
    'truck': 'down',
};

/**
 * Estima el peso (1-10) de la señal basándose en keywords del contenido
 */
function estimateWeight(detalle: string, indicadores: string[]): number {
    const text = `${detalle} ${indicadores.join(' ')}`.toLowerCase();

    // Keywords críticos → peso alto
    if (/urgente|crítico|emergencia|inmediato|pérdida|canceló|viral/i.test(text)) return 9;
    if (/caída|cayó|retraso|rechazando|negativo|riesgo alto/i.test(text)) return 8;
    if (/aumento|problema|queja|vulnerabilidad/i.test(text)) return 7;
    if (/bajo|menor|moderado|leve/i.test(text)) return 4;

    // Default: peso medio-alto
    return 6;
}

/**
 * Normaliza el JSONB de señales a un array de tarjetas para la UI
 * 
 * @param senales - JSONB crudo de la DB (puede ser objeto u array)
 * @param nivelRiesgo - Nivel de riesgo para ajustar peso base
 * @returns Array de SignalCard ordenadas por peso descendente
 */
export function normalizeSenales(
    senales: RawSenal | RawSenal[] | null | undefined,
    nivelRiesgo?: NivelRiesgo
): SignalCard[] {
    // Guard: null/undefined
    if (!senales) return [];

    // Si ya tiene formato tarjetas, usarlo directamente
    if (typeof senales === 'object' && 'tarjetas' in senales && Array.isArray(senales.tarjetas)) {
        return senales.tarjetas.sort((a, b) => (b.peso ?? 0) - (a.peso ?? 0));
    }

    // Si es array, procesar cada elemento
    if (Array.isArray(senales)) {
        return senales
            .map((s, idx) => normalizeRawSenal(s, idx))
            .sort((a, b) => b.peso - a.peso);
    }

    // Si es objeto único con estructura icono/detalle/indicadores
    if (typeof senales === 'object' && ('detalle' in senales || 'indicadores' in senales)) {
        return [normalizeRawSenal(senales as RawSenal, 0)];
    }

    return [];
}

/**
 * Convierte una señal cruda individual a SignalCard
 */
function normalizeRawSenal(raw: RawSenal, index: number): SignalCard {
    const icono = raw.icono || 'alert-circle';
    const detalle = raw.detalle || 'Sin detalle disponible';
    const indicadores = raw.indicadores || [];

    // Extraer título: primera parte antes de ":"
    const tituloMatch = detalle.match(/^([^:]+):/);
    const titulo = tituloMatch ? tituloMatch[1].trim() : extractFirstWords(detalle, 4);

    return {
        id: `signal-${index}`,
        icono,
        titulo,
        descripcion: detalle,
        indicadores,
        tendencia: ICON_TENDENCY_MAP[icono] || 'neutral',
        peso: estimateWeight(detalle, indicadores),
    };
}

/**
 * Extrae las primeras N palabras de un texto
 */
function extractFirstWords(text: string, n: number): string {
    return text.split(' ').slice(0, n).join(' ') + (text.split(' ').length > n ? '...' : '');
}

/**
 * Normaliza el contexto financiero de la DB
 */
export interface FinancialCardData {
    monto: number;
    moneda: string;
    etiqueta: string;
    formatted: string;
}

export function normalizeFinancialContext(
    ctx: { monto?: number; moneda?: string; etiqueta?: string } | null | undefined
): FinancialCardData | null {
    if (!ctx || typeof ctx !== 'object') return null;

    const monto = ctx.monto ?? 0;
    const moneda = ctx.moneda ?? 'USD';
    const etiqueta = ctx.etiqueta ?? 'Monto en riesgo';

    // Formatear según moneda
    const formatted = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: moneda,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(monto);

    return { monto, moneda, etiqueta, formatted };
}
