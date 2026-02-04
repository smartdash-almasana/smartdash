"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";

/**
 * Traducción técnica → label humano
 */
const SIGNAL_LABELS: Record<string, string> = {
  CASH_FLOW: "Flujo de Caja",
  TAX_LIMIT: "Límite Fiscal",
  REVENUE_RISK: "Riesgo de Ingresos",
  RUNWAY: "Runway Financiero",
  BURNOUT: "Agotamiento Laboral",
  WORKLOAD: "Carga de Trabajo",
  STOCK_LEVEL: "Nivel de Stock",
  DELAY: "Retraso en Proyecto",
  CHURN: "Tasa de Cancelación",
  NPS_DROP: "Caída de NPS",
  REACH: "Alcance Orgánico",
  UX_FAIL: "Falla de UX",
};

/**
 * Iconos por dominio
 */
const SIGNAL_ICONS: Record<string, any> = {
  financial: DollarSign,
  human: Users,
  operational: Zap,
  reputation: Activity,
};

/**
 * 🎯 MAPEO A TOKENS SEMÁNTICOS
 * No colores explícitos. El theme decide.
 */
const SIGNAL_TOKENS: Record<string, string> = {
  financial: "bg-primary/10 text-primary border-primary/20",
  human: "bg-accent/20 text-accent-foreground border-accent/30",
  operational: "bg-warning/15 text-warning border-warning/30",
  reputation: "bg-destructive/10 text-destructive border-destructive/20",
};

interface RiskSignal {
  type: string;
  code: string;
  value: string | number;
  description: string;
}

interface RiskSignalsProps {
  signals: RiskSignal[];
}

export function RiskSignals({ signals }: RiskSignalsProps) {
  if (!signals || signals.length === 0) return null;

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700 delay-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          Señales Detectadas
        </h3>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Fuente: SmartDash Engine
        </Badge>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((signal, idx) => {
          const Icon = SIGNAL_ICONS[signal.type] || AlertCircle;
          const colorClass =
            SIGNAL_TOKENS[signal.type] ??
            "bg-muted text-muted-foreground border-border";

          const translatedLabel =
            SIGNAL_LABELS[signal.code] || signal.code;

          return (
            <Card
              key={idx}
              className="relative overflow-hidden border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2.5 rounded-xl border ${colorClass}`}
                >
                  <Icon size={22} />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                  {translatedLabel}
                </span>
              </div>

              {/* Body */}
              <div className="space-y-4">
                <h4 className="font-bold text-foreground text-lg leading-snug">
                  {signal.description}
                </h4>

                <div className="flex items-center gap-3 text-sm">
                  {typeof signal.value === "number" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-2 font-mono"
                    >
                      {signal.value > 0 ? (
                        <TrendingDown
                          size={16}
                          className="text-destructive"
                        />
                      ) : (
                        <TrendingUp
                          size={16}
                          className="text-primary"
                        />
                      )}
                      Impacto: {Math.abs(signal.value)}%
                    </Badge>
                  )}

                  {typeof signal.value === "string" && (
                    <Badge
                      variant="secondary"
                      className="font-semibold"
                    >
                      Estado:{" "}
                      <span className="text-foreground ml-1">
                        {signal.value}
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
