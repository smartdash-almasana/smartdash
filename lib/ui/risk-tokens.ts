// lib/ui/risk-tokens.ts
// Design Tokens centralizados para niveles de riesgo
// Fuente de la Verdad: Enums en español de Supabase

import type { NivelRiesgo } from '@/lib/domain/risk';

/**
 * Tokens visuales para cada nivel de riesgo
 * - color: clase Tailwind (sin prefijo)
 * - hex: color exacto para componentes que necesitan hex (gauge, charts)
 * - icon: emoji representativo
 * - priority: orden numérico (mayor = más urgente)
 * - label: texto para UI
 * - gradient: clases para botones/cards premium
 */
export const RISK_TOKENS: Record<NivelRiesgo, {
    color: string;
    hex: string;
    icon: string;
    priority: number;
    label: string;
    gradient: string;
    bg: string;
    border: string;
    text: string;
}> = {
    'Crítico': {
        color: 'red-600',
        hex: '#dc2626',
        icon: '🚨',
        priority: 4,
        label: 'CRÍTICO',
        gradient: 'from-red-500 to-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
    },
    'Alto': {
        color: 'orange-500',
        hex: '#f97316',
        icon: '⚠️',
        priority: 3,
        label: 'ALTO',
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
    },
    'Medio': {
        color: 'amber-500',
        hex: '#f59e0b',
        icon: '⚡',
        priority: 2,
        label: 'MEDIO',
        gradient: 'from-amber-400 to-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
    },
    'Bajo': {
        color: 'emerald-500',
        hex: '#10b981',
        icon: '✅',
        priority: 1,
        label: 'BAJO',
        gradient: 'from-emerald-400 to-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
    },
} as const;

/**
 * Tokens para estado de acción
 */
export const ESTADO_TOKENS: Record<string, {
    color: string;
    hex: string;
    icon: string;
    label: string;
    bg: string;
    text: string;
}> = {
    'Completado': {
        color: 'emerald-500',
        hex: '#10b981',
        icon: '✅',
        label: 'Completado',
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
    },
    'En Proceso': {
        color: 'blue-500',
        hex: '#3b82f6',
        icon: '🔄',
        label: 'En Proceso',
        bg: 'bg-blue-100',
        text: 'text-blue-700',
    },
    'Pendiente': {
        color: 'orange-500',
        hex: '#f97316',
        icon: '⏳',
        label: 'Pendiente',
        bg: 'bg-orange-100',
        text: 'text-orange-700',
    },
    'Descartado': {
        color: 'slate-400',
        hex: '#94a3b8',
        icon: '✖️',
        label: 'Descartado',
        bg: 'bg-slate-100',
        text: 'text-slate-500',
    },
} as const;

/**
 * Helper para obtener tokens con fallback seguro
 */
export function getRiskToken(nivel: string | undefined | null) {
    return RISK_TOKENS[nivel as NivelRiesgo] || RISK_TOKENS['Medio'];
}

export function getEstadoToken(estado: string | undefined | null) {
    return ESTADO_TOKENS[estado as string] || ESTADO_TOKENS['Pendiente'];
}

/**
 * Helper para determinar si el protocolo de mitigación debe estar habilitado
 */
export function isProtocolEnabled(nivel: string | undefined | null): boolean {
    const token = getRiskToken(nivel);
    return token.priority >= 3; // Alto o Crítico
}
