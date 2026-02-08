"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, Target, Zap, 
  AlertTriangle, TrendingUp, Shield 
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
    case "Crítico": return "bg-red-500 text-white";
    case "Alto": return "bg-orange-500 text-white";
    case "Medio": return "bg-amber-500 text-slate-900";
    default: return "bg-emerald-500 text-white";
  }
};

export function CaseSelectorHeader({ casos, currentCaso, clienteNombre, clienteLogo }: CaseSelectorHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LADO IZQUIERDO: LOGO CLIENTE */}
        <div className="flex items-center gap-4">
          <Link href="/demo" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Target size={20} />
          </Link>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <div className="flex items-center gap-3">
            <img src={clienteLogo} alt={clienteNombre} className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-1" />
            <span className="font-black text-slate-900 tracking-tight">{clienteNombre}</span>
          </div>
        </div>

        {/* CENTRO: SELECTOR DE ESCENARIOS (MEGAMENÚ) */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-500 transition-all group"
          >
            <div className={cn("w-2 h-2 rounded-full", getRiskStyles(currentCaso.nivel_riesgo))} />
            <span className="text-sm font-bold text-slate-700">Escenario: {currentCaso.escenario}</span>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
          </button>

          {/* EL MEGAMENÚ */}
          {isOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 p-8 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Escenarios Detectados para este Cliente</p>
              
              <div className="grid grid-cols-2 gap-4">
                {casos.map((caso) => {
                  const isActive = caso.captura_id === currentCaso.captura_id;
                  return (
                    <Link 
                      key={caso.captura_id}
                      href={`/demo/casos/${caso.captura_id}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "p-4 rounded-3xl border transition-all flex flex-col gap-3 group",
                        isActive 
                          ? "bg-slate-900 border-slate-900 shadow-xl" 
                          : "bg-slate-50 border-slate-100 hover:border-orange-300 hover:bg-white"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                          getRiskStyles(caso.nivel_riesgo)
                        )}>
                          {caso.nivel_riesgo}
                        </span>
                        <span className={cn("text-xs font-black", isActive ? "text-orange-400" : "text-slate-400")}>
                          {caso.puntaje_global}/100
                        </span>
                      </div>
                      <h4 className={cn("font-bold text-sm leading-tight", isActive ? "text-white" : "text-slate-900")}>
                        {caso.escenario}
                      </h4>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* LADO DERECHO: ACCIÓN RÁPIDA */}
        <Link href="/demo" className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors uppercase tracking-widest">
          Volver al Panel
        </Link>

      </div>
      
      {/* OVERLAY PARA CERRAR EL MENÚ */}
      {isOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />}
    </header>
  );
}