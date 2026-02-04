"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  score: number;
  impact: string;
  evaluation: string;
}

type RiskVisualConfig = {
  gradientFrom: string;
  gradientTo: string;
  badgeClass: string;
  label: string;
};

function getRiskVisualConfig(score: number): RiskVisualConfig {
  if (score >= 80)
    return {
      gradientFrom: "hsl(var(--destructive))",
      gradientTo: "hsl(var(--destructive-foreground))",
      badgeClass: "bg-destructive/10 text-destructive",
      label: "Crítico",
    };

  if (score >= 60)
    return {
      gradientFrom: "hsl(var(--warning))",
      gradientTo: "hsl(var(--warning-foreground))",
      badgeClass: "bg-warning/10 text-warning",
      label: "Alto",
    };

  if (score >= 40)
    return {
      gradientFrom: "hsl(var(--accent))",
      gradientTo: "hsl(var(--accent-foreground))",
      badgeClass: "bg-accent/20 text-accent-foreground",
      label: "Medio",
    };

  return {
    gradientFrom: "hsl(var(--primary))",
    gradientTo: "hsl(var(--primary-foreground))",
    badgeClass: "bg-primary/10 text-primary",
    label: "Bajo",
  };
}
export function RiskScoreCard({ score, impact, evaluation }: RiskScoreCardProps) {
  const config = getRiskVisualConfig(score);

  const radius = 85;
  const strokeWidth = 12;
  const center = 100;
  const circumference = Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;

  const angle = 180 - (score / 100) * 180;
  const angleRad = (angle * Math.PI) / 180;
  const needleX = center + radius * Math.cos(angleRad);
  const needleY = center - radius * Math.sin(angleRad);

  return (
    <Card className="rounded-3xl p-8 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Gauge */}
        <div className="relative w-64 h-32 flex-shrink-0">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={config.gradientFrom} />
                <stop offset="100%" stopColor={config.gradientTo} />
              </linearGradient>
            </defs>

            <path
              d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            <path
              d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              className="transition-all duration-700 ease-out"
            />

            <circle
              cx={needleX}
              cy={needleY}
              r="7"
              fill="hsl(var(--card))"
              stroke={config.gradientTo}
              strokeWidth="3"
              className="transition-all duration-700"
            />
          </svg>

          <div className="absolute inset-0 top-6 flex flex-col items-center justify-end text-center">
            <span className="text-5xl font-bold tracking-tight text-foreground">
              {score.toFixed(1)}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Índice de Riesgo
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Badge className={cn("px-4 py-1.5 rounded-full font-semibold", config.badgeClass)}>
              ● {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">Actualizado ahora</span>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Impacto Financiero Proyectado
            </h3>
            <div className="text-3xl font-bold text-foreground">
              {impact}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Detección de desvío:
            </span>{" "}
            {evaluation}
          </div>
        </div>
      </div>
    </Card>
  );
}
