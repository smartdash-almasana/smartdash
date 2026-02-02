import React from 'react'
import { RiskEvaluation } from '@/lib/domain/risk'
import { getRiskLevelUI } from '@/lib/ui/risk-ui.mapper'
import { RadialGauge } from '@/components/radial-gauge'
import { ColoredProgress } from '@/components/colored-progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RiskScoreCardProps {
  evaluation: RiskEvaluation
  metrics: Record<string, unknown>
}

export function RiskScoreCard({ evaluation, metrics }: RiskScoreCardProps) {
  // Unica fuente de verdad visual: El Mapper
  const ui = getRiskLevelUI(evaluation.level)

  // Normalizacion de metricas para las barras de progreso
  const humanCapital = typeof metrics?.human_capital_index === 'number' 
    ? metrics.human_capital_index 
    : 85
  const financialCapital = typeof metrics?.financial_stability_index === 'number'
    ? metrics.financial_stability_index
    : evaluation.score

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-card to-muted/30 shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-center">
          
          {/* LADO IZQUIERDO: El Gauge y el Score */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0">
            <div className="relative h-48 w-48">
              <RadialGauge 
                value={evaluation.score}
                maxValue={100}
                level={evaluation.level as any}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className={`text-5xl font-black tracking-tighter ${evaluation.color}`}>
                  {evaluation.score}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Risk Score
                </span>
              </div>
            </div>
            
            <Badge variant="outline" className={`mt-4 px-4 py-1 text-sm font-bold uppercase tracking-tight ${ui.badge}`}>
              Nivel: {ui.label}
            </Badge>
          </div>

          {/* LADO DERECHO: Analisis y Metricas */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Analisis de Situacion
              </h2>
              <p className="text-xl font-medium leading-tight text-foreground/90">
                {evaluation.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Capital Humano */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span>Capital Humano</span>
                  <span className="text-blue-500">{humanCapital}%</span>
                </div>
                <ColoredProgress value={humanCapital} color="#3b82f6" />
              </div>

              {/* Capital Financiero */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span>Capital Financiero</span>
                  <span className="text-green-500">{financialCapital}%</span>
                </div>
                <ColoredProgress value={financialCapital} color="#22c55e" />
              </div>
            </div>

            {/* Banner Informativo del Mapper */}
            <div className={`flex items-center gap-3 rounded-lg border p-3 ${ui.badge} bg-opacity-30`}>
              <div className="flex-1 text-xs font-medium">
                <strong>Plan de accion:</strong> {ui.description}
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
