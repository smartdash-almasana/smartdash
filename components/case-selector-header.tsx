"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Target,
  Zap,
  AlertTriangle,
  TrendingUp,
  Shield,
} from "lucide-react";

interface CasoSelector {
  captura_id: string;
  escenario: string;
  nivel_riesgo: string;
  puntaje_global: number;
}

interface CaseSelectorHeaderProps {
  casos: CasoSelector[];
  currentCaso: CasoSelector;
  clienteNombre: string;
  clienteLogo: string;
}

const getRiskStyles = (nivel: string) => {
  switch (nivel) {
    case "Crítico":
      return "bg-red-500 text-white";
    case "Alto":
      return "bg-orange-500 text-white";
    case "Medio":
      return "bg-amber-500 text-slate-900";
    default:
      return "bg-emerald-500 text-white";
  }
};

export function CaseSelectorHeader({
  casos,
  currentCaso,
  clienteNombre,
  clienteLogo,
}: CaseSelectorHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* LADO IZQUIERDO: ACCESO RÁPIDO / HOME */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors"
          >
            <Target size={20} />
          </Link>
        </div>

        {/* CENTRO: SELECTOR DE ESCENARIOS (PROTAGONISTA) */}
        <div className="relative flex-none">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-500 transition-all group shadow-sm"
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                getRiskStyles(currentCaso.nivel_riesgo),
              )}
            />
            <span className="text-sm font-bold text-slate-700 truncate max-w-[130px] sm:max-w-[200px] md:max-w-none">
              Escenario: {currentCaso.escenario}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </button>

          {/* EL MEGAMENÚ (RESPONSIVE) */}
          {isOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[90vw] md:w-[600px] bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">
                Escenarios Detectados
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {casos.map((caso) => {
                  const isActive = caso.captura_id === currentCaso.captura_id;
                  return (
                    <Link
                      key={caso.captura_id}
                      href={`/dashboard/casos/${caso.captura_id}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "p-4 rounded-3xl border transition-all flex flex-col gap-3 group",
                        isActive
                          ? "bg-slate-900 border-slate-900 shadow-xl"
                          : "bg-slate-50 border-slate-100 hover:border-orange-300 hover:bg-white",
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                            getRiskStyles(caso.nivel_riesgo),
                          )}
                        >
                          {caso.nivel_riesgo}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-black",
                            isActive ? "text-orange-400" : "text-slate-400",
                          )}
                        >
                          {caso.puntaje_global}/100
                        </span>
                      </div>
                      <h4
                        className={cn(
                          "font-bold text-sm leading-tight",
                          isActive ? "text-white" : "text-slate-900",
                        )}
                      >
                        {caso.escenario}
                      </h4>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* LADO DERECHO: ESPACIADOR O BOTÓN CERRAR */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/demo"
            className="hidden md:block text-[10px] font-black text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-widest"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* OVERLAY PARA CERRAR EL MENÚ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
}
