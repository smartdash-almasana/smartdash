"use client";

// components/risk-signals.tsx
// Componente de señales críticas con soporte para SignalCard normalizada
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRiskToken } from "@/lib/ui/risk-tokens";
import type { NivelRiesgo } from "@/lib/domain/risk";
import type { SignalCard } from "@/lib/data/normalize-signals";

// Props: ahora recibe SignalCard[] del normalize-signals
interface RiskSignalsProps {
  signals: SignalCard[];
  className?: string;
}

/**
 * Mapea peso numérico (1-10) a NivelRiesgo español
 */
function pesoToNivel(peso?: number): NivelRiesgo {
  if (!peso) return "Medio";
  if (peso >= 8) return "Crítico";
  if (peso >= 6) return "Alto";
  if (peso >= 4) return "Medio";
  return "Bajo";
}

/**
 * Obtiene el componente de ícono dinámicamente por nombre kebab-case
 * Ej: "fuel" -> Fuel, "alert-triangle" -> AlertTriangle
 */
function getDynamicIcon(iconName: string): LucideIcons.LucideIcon {
  // Convertir kebab-case a PascalCase
  const pascalCase = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Buscar en lucide-react
  const IconComponent = (LucideIcons as Record<string, unknown>)[pascalCase];

  if (IconComponent && typeof IconComponent === 'function') {
    return IconComponent as LucideIcons.LucideIcon;
  }

  // Fallback: AlertCircle
  return AlertCircle;
}

/**
 * Tema visual basado en el icono/tipo de señal
 */
function getSignalTheme(iconName: string): { accent: string; iconBg: string; iconText: string } {
  // Mapeo de iconos a temas
  const themeMap: Record<string, { accent: string; iconBg: string; iconText: string }> = {
    'fuel': { accent: 'border-l-amber-500', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
    'battery-low': { accent: 'border-l-red-500', iconBg: 'bg-red-50', iconText: 'text-red-600' },
    'trending-down': { accent: 'border-l-red-500', iconBg: 'bg-red-50', iconText: 'text-red-600' },
    'alert-triangle': { accent: 'border-l-orange-500', iconBg: 'bg-orange-50', iconText: 'text-orange-600' },
    'alert-circle': { accent: 'border-l-yellow-500', iconBg: 'bg-yellow-50', iconText: 'text-yellow-600' },
    'credit-card-off': { accent: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    'package-x': { accent: 'border-l-purple-500', iconBg: 'bg-purple-50', iconText: 'text-purple-600' },
    'package-open': { accent: 'border-l-purple-500', iconBg: 'bg-purple-50', iconText: 'text-purple-600' },
    'star-off': { accent: 'border-l-blue-500', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    'users-round': { accent: 'border-l-cyan-500', iconBg: 'bg-cyan-50', iconText: 'text-cyan-600' },
    'handshake': { accent: 'border-l-teal-500', iconBg: 'bg-teal-50', iconText: 'text-teal-600' },
    'truck': { accent: 'border-l-indigo-500', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600' },
    'scale': { accent: 'border-l-slate-500', iconBg: 'bg-slate-50', iconText: 'text-slate-600' },
    'computer': { accent: 'border-l-gray-500', iconBg: 'bg-gray-50', iconText: 'text-gray-600' },
    'file-badge': { accent: 'border-l-pink-500', iconBg: 'bg-pink-50', iconText: 'text-pink-600' },
    'file-warning': { accent: 'border-l-rose-500', iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
    'link': { accent: 'border-l-sky-500', iconBg: 'bg-sky-50', iconText: 'text-sky-600' },
    'message-circle-warning': { accent: 'border-l-orange-500', iconBg: 'bg-orange-50', iconText: 'text-orange-600' },
    'server-crash': { accent: 'border-l-red-500', iconBg: 'bg-red-50', iconText: 'text-red-600' },
  };

  return themeMap[iconName] || { accent: 'border-l-slate-500', iconBg: 'bg-slate-50', iconText: 'text-slate-600' };
}

/**
 * Icono de tendencia
 */
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  switch (trend) {
    case 'up':
      return <TrendingUp size={12} className="text-red-500" />;
    case 'down':
      return <TrendingDown size={12} className="text-emerald-500" />;
    default:
      return <Minus size={12} className="text-slate-400" />;
  }
}

export function RiskSignals({ signals, className }: RiskSignalsProps) {
  // Manejo defensivo de datos incompletos
  const safeSignals = signals ?? [];

  if (safeSignals.length === 0) {
    return null;
  }

  // Ya vienen ordenadas por peso desde normalize-signals, pero aseguramos orden
  const sortedSignals = [...safeSignals].sort((a, b) => (b.peso ?? 0) - (a.peso ?? 0));

  return (
    <div className={cn("space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-orange-600" />
          Señales Críticas
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Fuente: Auditoría Real-time
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedSignals.map((signal, idx) => {
          const Icon = getDynamicIcon(signal.icono);
          const theme = getSignalTheme(signal.icono);

          // Usar token centralizado para el nivel de riesgo basado en peso
          const nivel = pesoToNivel(signal.peso);
          const riskToken = getRiskToken(nivel);

          return (
            <Card
              key={signal.id ?? idx}
              className={cn(
                "group relative overflow-hidden bg-white p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 rounded-[2rem] border-l-4",
                theme.accent,
                "border-slate-100"
              )}
            >
              <div className="flex items-center justify-between mb-5">
                <div className={cn("p-2.5 rounded-2xl border transition-colors", theme.iconBg, theme.iconText, "border-slate-100")}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>

                {/* Badge con nivel de riesgo usando token centralizado */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest py-1 px-3",
                    riskToken.bg,
                    riskToken.text,
                    riskToken.border
                  )}
                >
                  {riskToken.icon} {riskToken.label}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Título de la señal */}
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <TrendIcon trend={signal.tendencia} />
                  {signal.titulo}
                </div>

                {/* Descripción */}
                <h4 className="font-black text-slate-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
                  {signal.descripcion || "Sin descripción disponible"}
                </h4>

                {/* Indicadores */}
                {signal.indicadores && signal.indicadores.length > 0 && (
                  <ul className="space-y-1.5">
                    {signal.indicadores.slice(0, 3).map((indicador, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-500 flex items-start gap-2"
                      >
                        <span className="text-orange-400 mt-0.5">•</span>
                        {indicador}
                      </li>
                    ))}
                    {signal.indicadores.length > 3 && (
                      <li className="text-[10px] text-slate-400 italic pl-4">
                        +{signal.indicadores.length - 3} indicadores más...
                      </li>
                    )}
                  </ul>
                )}

                {/* Peso visual */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                    Peso: {signal.peso}/10
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
