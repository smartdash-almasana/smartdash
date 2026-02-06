"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import type { CasoTestigoCard } from "@/lib/types/welcome";

// ============================================================================
// PANTALLA 1B: Cards de Casos Testigo (Indicadores de Riesgo)
// Fuente de la Verdad: vista_dashboard_riesgos_api
// ============================================================================

/**
 * Tokens de color por nivel de riesgo según el blueprint:
 * - Crítico → rojo
 * - Alto → naranja  
 * - Medio → amarillo
 * - Bajo → verde
 */
const RIESGO_TOKENS: Record<string, {
    bg: string;
    bgCard: string;
    text: string;
    border: string;
    badge: string;
    icon: string;
}> = {
    Crítico: {
        bg: "bg-red-500",
        bgCard: "bg-gradient-to-br from-red-50 to-red-100/50",
        text: "text-red-600",
        border: "border-red-200",
        badge: "bg-red-100 text-red-700 border-red-300",
        icon: "text-red-500"
    },
    Alto: {
        bg: "bg-orange-500",
        bgCard: "bg-gradient-to-br from-orange-50 to-amber-100/50",
        text: "text-orange-600",
        border: "border-orange-200",
        badge: "bg-orange-100 text-orange-700 border-orange-300",
        icon: "text-orange-500"
    },
    Medio: {
        bg: "bg-yellow-500",
        bgCard: "bg-gradient-to-br from-yellow-50 to-amber-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "text-yellow-600"
    },
    Bajo: {
        bg: "bg-green-500",
        bgCard: "bg-gradient-to-br from-green-50 to-emerald-50",
        text: "text-green-600",
        border: "border-green-200",
        badge: "bg-green-100 text-green-700 border-green-300",
        icon: "text-green-500"
    }
};

/**
 * Tokens de color por segmento (para etiqueta sutil).
 */
const SEGMENTO_COLORS: Record<string, string> = {
    Pyme: "text-emerald-500",
    "E-commerce": "text-blue-500",
    Startup: "text-orange-500",
    Creador: "text-purple-500"
};

/**
 * Formatea un monto con su moneda.
 */
function formatMonto(monto: number | null, moneda: string | null): string {
    if (monto === null || monto === undefined) return "Sin datos";

    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(monto);

    const symbol = moneda === 'MXN' ? 'MXN $'
        : moneda === 'EUR' ? '€'
            : moneda === 'USD' ? 'USD $'
                : `${moneda || ''} $`;

    return `${symbol}${formatted}`;
}

/**
 * Props del componente CasoTestigoCardUI.
 */
interface CasoTestigoCardProps {
    caso: CasoTestigoCard;
    onClick?: () => void;
    href?: string;
}

/**
 * Card individual de caso testigo para la Pantalla 1B.
 * Muestra: escenario, monto en riesgo, nivel de riesgo, señal principal.
 */
export function CasoTestigoCardUI({ caso, onClick, href }: CasoTestigoCardProps) {
    const riesgoToken = RIESGO_TOKENS[caso.nivel_riesgo] || RIESGO_TOKENS.Medio;
    const segmentoColor = SEGMENTO_COLORS[caso.segmento] || "text-slate-500";

    const CardContent = (
        <Card
            className={cn(
                "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                "shadow-lg hover:shadow-2xl hover:scale-[1.02]",
                "cursor-pointer group",
                riesgoToken.bgCard,
                riesgoToken.border
            )}
            onClick={onClick}
        >
            {/* Barra de riesgo lateral */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                riesgoToken.bg
            )} />

            <div className="pl-5 pr-5 py-5 space-y-4">
                {/* Header: Segmento + Nivel de Riesgo */}
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        segmentoColor
                    )}>
                        {caso.segmento}
                    </span>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] font-black uppercase px-2.5 py-0.5 border",
                            riesgoToken.badge
                        )}
                    >
                        {caso.nivel_riesgo}
                    </Badge>
                </div>

                {/* Título del escenario */}
                <h3 className="text-base font-black text-slate-900 leading-tight line-clamp-2 min-h-[44px] group-hover:text-slate-700 transition-colors">
                    {caso.escenario}
                </h3>

                {/* Monto en Riesgo */}
                <div className="flex items-center gap-2">
                    <DollarSign size={18} className={riesgoToken.icon} strokeWidth={2.5} />
                    <span className={cn(
                        "text-xl font-black",
                        riesgoToken.text
                    )}>
                        {formatMonto(caso.monto_en_riesgo, caso.moneda)}
                    </span>
                </div>

                {/* Señal Principal */}
                {caso.senal_principal && (
                    <div className="flex items-start gap-2 pt-3 border-t border-slate-200/50">
                        <AlertTriangle size={14} className={cn("mt-0.5 flex-shrink-0", riesgoToken.icon)} />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                            {caso.senal_principal}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );

    // Si hay href, envolver en Link
    if (href) {
        return (
            <Link href={href} className="block">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}

/**
 * Skeleton loader para una card de caso testigo.
 */
export function CasoTestigoCardSkeleton() {
    return (
        <Card className="rounded-2xl border-2 border-slate-100 overflow-hidden">
            <div className="pl-5 pr-5 py-5 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-8 w-full" />
            </div>
        </Card>
    );
}

/**
 * Props del grid de casos por segmento.
 */
interface CasosTestigoGridProps {
    casos: CasoTestigoCard[];
    segmento: string;
    loading?: boolean;
    onCasoClick?: (caso: CasoTestigoCard) => void;
    getHref?: (caso: CasoTestigoCard) => string;
}

/**
 * Grid de cards de casos testigo para un segmento específico.
 * Responsive: 4 columnas en desktop, 2 en tablet, 1 en mobile.
 */
export function CasosTestigoGrid({
    casos,
    segmento,
    loading = false,
    onCasoClick,
    getHref
}: CasosTestigoGridProps) {
    const segmentoColor = SEGMENTO_COLORS[segmento] || "text-slate-600";

    if (loading) {
        return (
            <div className="space-y-4">
                <h2 className={cn(
                    "text-sm font-black uppercase tracking-widest",
                    segmentoColor
                )}>
                    {segmento}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <CasoTestigoCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (casos.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className={cn(
                    "text-sm font-black uppercase tracking-widest",
                    segmentoColor
                )}>
                    {segmento}
                </h2>
                <div className="flex items-center justify-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium">
                        No hay casos testigo para este segmento.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <h2 className={cn(
                    "text-sm font-black uppercase tracking-widest",
                    segmentoColor
                )}>
                    {segmento}
                </h2>
                <Badge
                    variant="secondary"
                    className="text-[10px] font-bold bg-slate-100 text-slate-600"
                >
                    {casos.length} casos
                </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {casos.map((caso) => (
                    <CasoTestigoCardUI
                        key={caso.captura_id}
                        caso={caso}
                        onClick={onCasoClick ? () => onCasoClick(caso) : undefined}
                        href={getHref ? getHref(caso) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Props para el panel completo de casos por todos los segmentos.
 */
interface CasosTestigoFullPanelProps {
    casosBySegmento: Record<string, CasoTestigoCard[]>;
    loading?: boolean;
    onCasoClick?: (caso: CasoTestigoCard) => void;
    getHref?: (caso: CasoTestigoCard) => string;
}

/**
 * Panel completo de todos los casos testigo agrupados por segmento.
 * Muestra 4 secciones (Creador, Pyme, Startup, E-commerce) con sus casos.
 */
export function CasosTestigoFullPanel({
    casosBySegmento,
    loading = false,
    onCasoClick,
    getHref
}: CasosTestigoFullPanelProps) {
    const segmentos = ['Creador', 'Pyme', 'Startup', 'E-commerce'];

    return (
        <div className="space-y-10">
            {segmentos.map((seg) => (
                <CasosTestigoGrid
                    key={seg}
                    segmento={seg}
                    casos={casosBySegmento[seg] || []}
                    loading={loading}
                    onCasoClick={onCasoClick}
                    getHref={getHref}
                />
            ))}
        </div>
    );
}

export default CasosTestigoGrid;
