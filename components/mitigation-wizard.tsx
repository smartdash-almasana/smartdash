// components/mitigation-wizard.tsx
// Wizard de pasos de mitigación con tokens centralizados
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, ShieldAlert, ArrowRight } from "lucide-react";
import { getEstadoToken, ESTADO_TOKENS } from "@/lib/ui/risk-tokens";
import type { MitigationStep } from "@/lib/actions";

interface MitigationWizardProps {
  steps: MitigationStep[];
  className?: string;
}

export function MitigationWizard({ steps, className }: MitigationWizardProps) {
  // Manejo defensivo de datos incompletos
  const safeSteps = steps ?? [];

  if (safeSteps.length === 0) {
    return (
      <div className={cn("p-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 text-center", className)}>
        <div className="flex flex-col items-center gap-3">
          <ShieldAlert size={32} className="text-slate-300" />
          <p className="text-sm font-bold text-slate-400 italic">
            No hay acciones de mitigación registradas para este escenario.
          </p>
        </div>
      </div>
    );
  }

  // Ordenar: incompletos primero, completados al final
  const sortedSteps = [...safeSteps].sort((a, b) => {
    const aCompleted = a.estado === "Completado" ? 1 : 0;
    const bCompleted = b.estado === "Completado" ? 1 : 0;
    return aCompleted - bCompleted;
  });

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      {sortedSteps.map((step, idx) => {
        // Usa token centralizado para el estado
        const estadoToken = getEstadoToken(step.estado);
        const isCompleted = step.estado === "Completado";
        const stepNumber = step.step_number ?? idx + 1;

        return (
          <div
            key={stepNumber}
            className={cn(
              "group relative p-6 rounded-[2rem] border transition-all duration-500",
              isCompleted
                ? "bg-emerald-50/30 border-emerald-100/50 hover:bg-emerald-50/50"
                : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
            )}
          >
            <div className="flex items-start gap-5">
              {/* Marcador de número de paso */}
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg transition-all duration-500 group-hover:rotate-6",
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                    : "bg-slate-900 text-white shadow-lg shadow-slate-200"
                )}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : stepNumber}
              </div>

              {/* Contenido */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-black text-slate-900 tracking-tight leading-none pt-1 truncate">
                    {step.title || "Sin título"}
                  </h4>

                  {/* Badge de estado con token centralizado */}
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0",
                      estadoToken.bg,
                      estadoToken.text
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <Clock size={10} />
                    )}
                    {estadoToken.label}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {step.description || "Sin descripción"}
                </p>

                {/* CTA para acciones pendientes */}
                {!isCompleted && (
                  <button className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors group/btn">
                    <span>Ejecutar Acción</span>
                    <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Decoración de fondo sutil */}
            <div className="absolute top-2 right-2 opacity-5 text-slate-900">
              <ShieldAlert size={40} strokeWidth={1} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
