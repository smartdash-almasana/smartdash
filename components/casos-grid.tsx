"use client";

import Image from "next/image";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

// ============================================================================
// COMPONENTES DE CASOS / ESCENARIOS DE RIESGO
// Fuente de la Verdad: vista_dashboard_riesgos_api
// ============================================================================

/**
 * Colores para nivel de riesgo
 */
const RISK_TOKENS: Record<string, { bg: string; text: string }> = {
  Crítico: { bg: "bg-red-100", text: "text-red-700" },
  Alto: { bg: "bg-orange-100", text: "text-orange-700" },
  Medio: { bg: "bg-yellow-100", text: "text-yellow-800" },
  Bajo: { bg: "bg-green-100", text: "text-green-700" },
};

/**
 * Tipo de datos de cada caso
 */
export interface CasoCard {
  id: string;
  cliente_id?: string;
  nombre_cliente?: string;
  img_cliente?: string;
  escenario: string;
  vertical: string;
  nivel_riesgo: string;
  monto_en_riesgo: string | number;
  descripcion_base?: string;
}

/**
 * Props del card individual de caso
 */
interface CasoCardProps {
  caso: CasoCard;
}

/**
 * Card individual de escenario de riesgo
 */
export function CasoCardUI({ caso }: CasoCardProps) {
  const token = RISK_TOKENS[caso.nivel_riesgo] || RISK_TOKENS.Medio;

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden">
      {/* Header con logo y cliente */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100">
        {caso.img_cliente ? (
          <div className="w-12 h-12 relative rounded-xl overflow-hidden border border-slate-200">
            <Image
              src={caso.img_cliente}
              alt={caso.nombre_cliente}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 font-bold">
            {caso.nombre_cliente?.[0] || "?"}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-600 line-clamp-1">{caso.nombre_cliente}</span>
          <span className="text-xs text-slate-400">{caso.vertical}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{caso.escenario}</h3>

        <div className="flex items-center justify-between mt-1">
          <Badge className={cn("text-xs font-bold px-2 py-1", token.bg, token.text)}>
            {caso.nivel_riesgo}
          </Badge>
          <span className="text-sm font-medium text-slate-700">
            {typeof caso.monto_en_riesgo === "number"
              ? `$${caso.monto_en_riesgo.toLocaleString()}`
              : caso.monto_en_riesgo}
          </span>
        </div>

        {caso.descripcion_base && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-4">{caso.descripcion_base}</p>
        )}
      </div>
    </Card>
  );
}

/**
 * Skeleton loader para cada caso
 */
export function CasoCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-slate-200 overflow-hidden">
      <Skeleton className="h-16 w-full" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full mt-2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </Card>
  );
}

/**
 * Props del grid de casos
 */
interface CasosGridProps {
  casos: CasoCard[];
  loading?: boolean;
}

/**
 * Grid de cards de casos de riesgo
 */
export function CasosGrid({ casos, loading = false }: CasosGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CasoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!casos || casos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-slate-400 text-xl font-bold mb-2">No hay escenarios registrados</span>
        <p className="text-sm text-slate-500 max-w-md">
          Los escenarios de riesgo aparecerán aquí cuando se agreguen a la base de datos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {casos.map((c) => (
        <CasoCardUI key={c.id} caso={c} />
      ))}
    </div>
  );
}

export default CasosGrid;
