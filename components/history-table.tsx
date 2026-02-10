"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { History, Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Activity } from "lucide-react";
import type { HistoryItem } from "@/lib/actions";

interface HistoryTableProps {
  historyData: HistoryItem[];
}

// Diccionario visual con keys en ESPAÑOL (contrato DashboardRisk)
const RISK_CONFIG: Record<string, { class: string, icon: React.ReactNode }> = {
  'Crítico': { class: "bg-red-50 text-red-600 border-red-100", icon: <AlertTriangle size={12} /> },
  'Alto': { class: "bg-orange-50 text-orange-600 border-orange-100", icon: <AlertTriangle size={12} /> },
  'Medio': { class: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: <Shield size={12} /> },
  'Bajo': { class: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle size={12} /> },
};

export function HistoryTable({ historyData }: HistoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!historyData || historyData.length === 0) {
    return (
      <div className="p-12 rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50/50 text-center">
        <History className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-400 italic">
          No hay registros históricos disponibles para este segmento.
        </p>
      </div>
    );
  }

  return (
    <Card className="rounded-[2.5rem] overflow-hidden bg-white border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="divide-y divide-slate-50">
        {historyData.map((item) => {
          // Usa nivel_riesgo directamente (español) - fallback a 'Medio'
          const config = RISK_CONFIG[item.nivel_riesgo] || RISK_CONFIG['Medio'];
          const isExpanded = expandedRows[item.id];
          const hasMitigation = item.mitigation_plan && Array.isArray(item.mitigation_plan) && item.mitigation_plan.length > 0;

          return (
            <div key={item.id} className="transition-all duration-300 hover:bg-slate-50/50">
              {/* Main Row */}
              <div
                onClick={() => hasMitigation && toggleRow(item.id)}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 cursor-pointer",
                  !hasMitigation && "cursor-default"
                )}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      isExpanded ? "bg-orange-500 scale-125" : "bg-slate-200"
                    )} />
                    <p className="font-black text-slate-900 tracking-tight leading-none pt-0.5">
                      {item.scenario_description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pl-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      ID: {item.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 sm:mt-0 ml-5 sm:ml-0">
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {item.global_score.toFixed(0)}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Score
                    </span>
                  </div>

                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                    config.class
                  )}>
                    {config.icon}
                    {item.nivel_riesgo}
                  </div>

                  {hasMitigation && (
                    <div className={cn("text-slate-300 transition-transform duration-300", isExpanded && "rotate-180")}>
                      <ChevronDown size={20} />
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && hasMitigation && (
                <div className="px-8 pb-6 pl-14 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <Activity size={14} className="text-orange-500" />
                      Acciones de Mitigación Registradas
                    </h4>
                    <div className="space-y-2">
                      {(item.mitigation_plan as any[]).map((step: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{step.title}</p>
                            <p className="text-xs text-slate-500">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
