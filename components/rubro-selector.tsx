"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Store, ShoppingCart, Video, Rocket, ArrowRight } from "lucide-react";
import { RUBRO_TO_SEGMENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

type RubroConfig = {
  id: string;
  label: string;
  description: string;
  icon: any;
  theme: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
};

const RUBROS: RubroConfig[] = [
  {
    id: "Pyme",
    label: "PYME / Local",
    description: "Gestión de logística, recursos humanos y optimización de flujo de caja minorista.",
    icon: Store,
    theme: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", accent: "bg-emerald-500" },
  },
  {
    id: "E-commerce",
    label: "E-commerce",
    description: "Control de stock, pasarelas de pago y mejora de la experiencia de usuario digital.",
    icon: ShoppingCart,
    theme: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", accent: "bg-blue-500" },
  },
  {
    id: "Creadores",
    label: "Creadores",
    description: "Protección de reputación, análisis de algoritmos y gestión inteligente de contratos.",
    icon: Video,
    theme: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", accent: "bg-purple-500" },
  },
  {
    id: "Startups",
    label: "Startups",
    description: "Monitorización de runway, métricas SaaS y estrategias de crecimiento acelerado.",
    icon: Rocket,
    theme: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", accent: "bg-orange-500" },
  },
];

export function RubroSelector() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <div className="mb-20 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
          Protocolo de Auditoría
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none">
          SmartDash <span className="text-orange-600">FV</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-medium text-slate-500 leading-relaxed">
          Selecciona un segmento para verificar los riesgos activos detectados por el motor de la <span className="text-slate-900 font-bold">Fuente de la Verdad</span>.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {RUBROS.map((rubro) => {
          const Icon = rubro.icon;

          return (
            <Link
              key={rubro.id}
              href={`/?rubro=${rubro.id}`}
              className="group block"
            >
              <Card className={cn(
                "h-full border-slate-100 bg-white transition-all duration-500 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-200/30 rounded-[3rem] overflow-hidden p-8 border-2 hover:border-orange-200",
                "relative flex flex-col justify-between"
              )}>
                <div>
                  <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner",
                    rubro.theme.bg, rubro.theme.text
                  )}>
                    <Icon size={32} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-orange-600 transition-colors">
                    {rubro.label}
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {rubro.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ver Escenarios Activos
                  </span>
                  <div className="p-3 bg-slate-50 rounded-full text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

