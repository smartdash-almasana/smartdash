"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CasoTestigoCardUI } from "@/components/casos-testigo-grid";
// Importamos iconos para mejorar la visualización (asegúrate de tener lucide-react o similar)
import { AlertTriangle, TrendingUp, ShieldAlert, MessageCircle, Activity, Building2, FileText, Wallet } from "lucide-react";

// --- Helpers para UI ---
const getRiskColors = (riesgo: string | undefined) => {
  switch (riesgo) {
    case "Crítico": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-600" };
    case "Alto": return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "text-orange-600" };
    case "Medio": return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "text-yellow-600" };
    case "Bajo": return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "text-green-600" };
    default: return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: "text-slate-500" };
  }
};

// Componente simple para un dato estructurado
const DataPoint = ({ icon: Icon, label, value, highlight = false }: { icon: any, label: string, value: string | number | undefined, highlight?: boolean }) => (
  <div className="flex items-start space-x-3">
    <div className={`mt-1 p-1.5 rounded-lg ${highlight ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
      <Icon size={16} />
    </div>
    <div>
       <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
       <p className={`font-bold ${highlight ? 'text-lg text-blue-900' : 'text-base text-slate-900'}`}>{value || "N/A"}</p>
    </div>
  </div>
);

// --- Componente Principal ---
export default function CasoPage() {
  const { captura_id } = useParams<{ captura_id: string }>();
  const [loading, setLoading] = useState(true);
  const [caso, setCaso] = useState<CasoTestigoCardUI | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCaso() {
      setLoading(true);
      try {
        const res = await fetch(`/api/clientes/casos/${captura_id}`);
        if (!res.ok) throw new Error("Error fetching caso");
        const body = (await res.json()) as { casos?: CasoTestigoCardUI[] };
        const data = body.casos?.[0] || null;
        if (!cancelled) {
          setCaso(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setCaso(null);
          setLoading(false);
        }
      }
    }
    if (captura_id) fetchCaso();
    return () => { cancelled = true; };
  }, [captura_id]);

  const riskStyle = getRiskColors(caso?.nivel_riesgo);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFF] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium animate-pulse">Cargando análisis del caso...</span>
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF]">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md border border-red-100">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Caso no encontrado</h2>
            <p className="text-slate-500">No se pudo localizar la información solicitada. Verifique el ID o intente nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Encabezado con Badge de Riesgo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              <Activity size={14} />
              <span>Análisis de Caso Testigo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {caso.cliente_nombre_comercial}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Building2 size={14} /> {caso.vertical} | ID: {captura_id}
            </p>
          </div>

          <div className={`flex flex-col items-end px-5 py-3 rounded-2xl border ${riskStyle.bg} ${riskStyle.border}`}>
             <span className="text-xs font-semibold uppercase text-slate-500 mb-1">Nivel de Riesgo Detectado</span>
             <div className={`flex items-center gap-2 font-black text-2xl ${riskStyle.text}`}>
                <AlertTriangle size={24} className={riskStyle.icon} />
                {caso.nivel_riesgo}
             </div>
          </div>
        </div>

        {/* Grid Principal de Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Resumen del Cliente (Span 4/12) */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
                <h2 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                   <FileText size={20} className="text-slate-400"/> Resumen del Escenario
                </h2>
                <div className="space-y-5">
                   <DataPoint icon={TrendingUp} label="Puntaje Global" value={`${caso.puntaje_global} / 100`} highlight={true} />
                   <div className="border-t border-slate-100 pt-4"></div>
                   <DataPoint icon={FileText} label="Escenario Analizado" value={caso.escenario} />
                   <DataPoint icon={Building2} label="Vertical / Industria" value={caso.vertical} />
                </div>
             </div>
          </div>

          {/* Columna Derecha: Señales y Mitigación (Span 8/12) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              
              {/* Señal Principal Destacada */}
              <div className={`rounded-2xl p-5 mb-6 border-l-4 ${riskStyle.border} ${riskStyle.bg}`}>
                 <h3 className={`font-bold text-lg flex items-start gap-2 mb-2 ${riskStyle.text}`}>
                    <AlertTriangle size={20} className="mt-1 flex-shrink-0"/> Señal Principal Detectada
                 </h3>
                 <p className="text-slate-800 font-medium text-lg leading-relaxed pl-7">
                    “{caso.senal_principal}”
                 </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Indicadores */}
                {caso.financial_context?.indicadores && (
                 <div>
                    <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Activity size={16}/> Indicadores Clave
                    </h3>
                    <ul className="space-y-3">
                      {caso.financial_context.indicadores.map((i: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl text-sm font-medium">
                          <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                          {i}
                        </li>
                      ))}
                    </ul>
                 </div>
                )}

                {/* Plan de Mitigación */}
                <div>
                   <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ShieldAlert size={16}/> Plan de Mitigación
                   </h3>
                   <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <p className="text-blue-900 font-semibold italic leading-relaxed">
                         "{caso.recomendacion}"
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                         <span className="text-xs font-bold text-slate-500 uppercase">Estado:</span>
                         <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                            {caso.estado_accion}
                         </span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila Inferior: Finanzas y CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Tarjeta Financiera */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
             <div>
                <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Wallet size={18} /> Impacto Financiero Estimado
                </h2>
             </div>
             <div className="mt-4">
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: caso.moneda || 'ARS' }).format(Number(caso.monto_en_riesgo) || 0)}
                   </span>
                   <span className="text-sm font-bold text-slate-500">{caso.moneda} en riesgo</span>
                </div>
             </div>
           </div>

           {/* Tarjeta CTA WhatsApp */}
           <div className="bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 rounded-3xl p-6 shadow-sm border border-[#25D366]/20 flex flex-col justify-center items-center text-center">
             <MessageCircle size={40} className="text-[#128C7E] mb-3" />
             <h3 className="font-bold text-xl text-slate-900 mb-2">Simulación en Tiempo Real</h3>
             <p className="text-sm text-slate-600 mb-6 max-w-sm">
                Vea cómo SmartDash interactúa con este caso específico a través de una simulación de WhatsApp.
             </p>
             
             <button
               className="w-full max-w-xs group flex items-center justify-center gap-3 px-6 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg shadow-[#25D366]/20 hover:shadow-xl transform hover:-translate-y-0.5"
               onClick={() => alert("Simulación de WhatsApp activada")}
             >
               <MessageCircle className="group-hover:animate-pulse" size={24} />
               <span>Ver Simulación WhatsApp</span>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}