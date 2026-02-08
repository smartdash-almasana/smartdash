"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getRiskToken } from "@/lib/ui/risk-tokens";

/**
 * Campos requeridos por FV para render de Caso Testigo.
 * - cliente_nombre_comercial: clientes.nombre_comercial
 * - logo_url: clientes.img_clientes
 * - escenario: escenarios_riesgo.titulo
 * - vertical: verticales_negocio.nombre (mapeado desde escenario.vertical_id)
 * - nivel_riesgo: capturas_riesgo.nivel_riesgo_actual
 * - puntaje_global: capturas_riesgo.puntaje_global
 * - descripcion_base: escenarios_riesgo.descripcion_base
 * - monto_en_riesgo: capturas_riesgo.monto_en_riesgo (si aplica)
 * - captura_id: capturas_riesgo.id
 * - moneda: capturas_riesgo.contexto_financiero?.moneda (si aplica)
 */
export interface CasoTestigoCardUI {
  captura_id: string;
  cliente_nombre_comercial: string;
  logo_url: string | null;
  escenario: string;
  vertical: string;
  nivel_riesgo: "Bajo" | "Medio" | "Alto" | "Crítico";
  puntaje_global?: number | null;
  monto_en_riesgo?: number | null;
  descripcion_base: string | null;
  moneda?: string | null;
}

interface CasoTestigoCardProps {
  caso: CasoTestigoCardUI;
  onClick?: () => void;
  href?: string;
}

export function CasoTestigoCardSkeleton() {
  return (
    <Card className="rounded-3xl border-2 border-slate-100 overflow-hidden">
      <Skeleton className="h-1.5 w-full" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </Card>
  );
}

/**
 * Card individual de caso testigo
 */
export function CasoTestigoCardUI({ caso, onClick, href }: CasoTestigoCardProps) {
  const riskToken = getRiskToken(caso.nivel_riesgo);

  const CardContent = (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl hover:scale-[1.01] cursor-pointer group",
        riskToken.border
      )}
      onClick={onClick}
    >
      <div className={cn("h-1.5 w-full", riskToken.bg)} />
      <div className="p-7 space-y-4 min-h-[320px]">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border border-slate-100 bg-slate-50">
            {caso.logo_url ? (
              <Image src={caso.logo_url} alt={caso.cliente_nombre_comercial} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 font-bold">
                {caso.cliente_nombre_comercial?.[0] ?? "?"}
              </div>
            )}
          </div>
          <p className="text-[15px] font-bold text-slate-900 tracking-tight">
            {caso.cliente_nombre_comercial}
          </p>
        </div>

        <div className="space-y-2 antialiased">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">
            Riesgo: {caso.vertical || "Sin vertical"}
          </p>
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800">
            Nivel de Riesgo: {typeof caso.puntaje_global === "number" ? `${caso.puntaje_global}/100` : "N/A"} {riskToken.icon} {riskToken.label}
          </p>
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800">
            SEÑAL: {caso.escenario?.replace(/\\s*-\\s*startup\\s*$/i, "")}
          </p>
        </div>

        {typeof caso.monto_en_riesgo === "number" && (
          <div className="text-[10px] font-semibold tracking-wide px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-100 inline-flex w-fit">
            Monto: {caso.moneda ? `${caso.moneda} ` : ""}{caso.monto_en_riesgo}
          </div>
        )}
      </div>
    </Card>
  );

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
 * Props del grid de casos por cliente
 */
export interface CasosTestigoGridProps {
  casos: CasoTestigoCardUI[];
  segmento: string;
  loading?: boolean;
  onCasoClick?: (caso: CasoTestigoCardUI) => void;
  getHref?: (caso: CasoTestigoCardUI) => string;
}

/**
 * Grid de cards de casos testigo
 */
export function CasosTestigoGrid({
  casos,
  segmento,
  loading = false,
  onCasoClick,
  getHref
}: CasosTestigoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <CasoTestigoCardSkeleton key={`${segmento}-sk-${i}`} />
        ))}
      </div>
    );
  }

  if (!casos.length) {
    return (
      <div className="flex items-center justify-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-sm text-slate-400 font-medium">
          No hay casos testigo para este cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {casos.map((caso) => {
        const href = getHref ? getHref(caso) : undefined;
        return (
          <CasoTestigoCardUI
            key={caso.captura_id}
            caso={caso}
            onClick={onCasoClick ? () => onCasoClick(caso) : undefined}
            href={href}
          />
        );
      })}
    </div>
  );
}

/**
 * Props para el panel completo de casos por cliente
 */
interface CasosRiesgoPorClienteProps {
  casosByCliente: Record<string, CasoTestigoCardUI[]>;
  loading?: boolean;
  onCasoClick?: (caso: CasoTestigoCardUI) => void;
  getHref?: (caso: CasoTestigoCardUI) => string;
}

/**
 * Panel completo de casos por cliente
 * Reusa CasosTestigoGrid y CasoTestigoCardUI
 */
export default function CasosRiesgoPorCliente({
  casosByCliente,
  loading = false,
  onCasoClick,
  getHref
}: CasosRiesgoPorClienteProps) {
  const clientes = Object.keys(casosByCliente);

  return (
    <div className="space-y-10">
      {clientes.map((cliente) => {
        const casos = casosByCliente[cliente] || [];

        return (
          <div key={cliente} className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
              {cliente}
            </h2>

            {loading ? (
              <CasosTestigoGrid segmento={cliente} casos={[]} loading={true} />
            ) : casos.length === 0 ? (
              <div className="flex items-center justify-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">
                  No hay situaciones de riesgo para este cliente.
                </p>
              </div>
            ) : (
              <CasosTestigoGrid
                segmento={cliente}
                casos={casos}
                loading={false}
                onCasoClick={onCasoClick}
                getHref={getHref}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
