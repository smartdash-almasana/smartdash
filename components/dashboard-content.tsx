"use client";

import Link from "next/link";
import { ArrowLeft, TrendingDown, DollarSign, FileText } from "lucide-react";
import { RadialGauge } from "@/components/radial-gauge";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { HistoryTable } from "@/components/history-table";
import { RiskSignals } from "@/components/risk-signals";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getRiskToken, isProtocolEnabled } from "@/lib/ui/risk-tokens";
import type { DashboardData, HistoryItem } from "@/lib/actions";

// Tipo local para el JSONB financial_context (viene crudo de DB)
// Estructura REAL según CSV: {monto, moneda, etiqueta}
interface FinancialContextRaw {
  monto?: number;
  moneda?: string;
  etiqueta?: string;
}

interface DashboardContentProps {
  data: DashboardData | null;
  history: HistoryItem[];
  rubro: string;
  isLoading?: boolean;
}

// Skeleton loader para métricas
function MetricCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-full" />
    </Card>
  );
}

export function DashboardContent({ data, history, rubro, isLoading = false }: DashboardContentProps) {
  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-8 space-y-6">
            <Skeleton className="h-64 w-64 mx-auto rounded-full" />
            <Skeleton className="h-32 w-full" />
          </Card>
          <div className="space-y-4">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
          <Card className="p-6">
            <Skeleton className="h-96 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Usa tokens centralizados con fallback seguro
  const riskToken = getRiskToken(data.nivel_riesgo);
  const financialContext = (data.financial_context || {}) as FinancialContextRaw;
  const protocolEnabled = isProtocolEnabled(data.nivel_riesgo);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/?rubro=${rubro}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Volver al Panel de Segmentos</span>
          </Link>
          <Badge variant="outline" className="text-xs font-semibold">
            Sector: {rubro}
          </Badge>
        </div>

        {/* Grid de 3 Columnas - Referencia: modelo-dash3.jpg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA 1: DIAGNÓSTICO E IDENTIFICACIÓN */}
          <div className="space-y-6">

            {/* Card del Gauge - Speedometer */}
            <Card className="p-8 shadow-lg border-2 border-gray-100">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
                Diagnóstico e Identificación
              </h2>

              <div className="flex flex-col items-center space-y-6">
                <RadialGauge
                  value={data.score ?? 0}
                  size={320}
                  label={riskToken.label}
                  color={riskToken.hex}
                />
                <div className="text-center">
                  <div className="text-6xl font-black text-gray-900">
                    {Math.round(data.score ?? 0)}
                    <span className="text-3xl text-gray-400 font-bold">/100</span>
                  </div>
                  <RiskBadge nivel={data.nivel_riesgo} size="lg" className="mt-4" />
                </div>
              </div>
            </Card>

            {/* Card de Traducción IA */}
            <Card className="p-6 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
              <h3 className="text-sm font-black text-blue-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <FileText size={18} className="text-blue-600" />
                Traducción IA
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed font-medium">
                {data.evaluation || 'Análisis no disponible.'}
              </p>
            </Card>
          </div>

          {/* COLUMNA 2: EVIDENCIA DEL ESCENARIO */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
              Evidencia del Escenario
            </h2>

            {/* Tarjeta: Impacto Financiero (datos reales de contexto_financiero) */}
            <Card className={cn(
              "p-5 shadow-md hover:shadow-lg transition-all border-l-4",
              riskToken.border
            )}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className={riskToken.text} />
                    <span className="text-xs font-black text-gray-600 uppercase tracking-wider">
                      {financialContext.etiqueta || 'Impacto Financiero'}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-gray-900">
                    {financialContext.monto != null
                      ? `$${financialContext.monto.toLocaleString('en-US')}`
                      : 'Sin datos'}
                  </div>
                  {financialContext.moneda && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {financialContext.moneda}
                    </p>
                  )}
                </div>
                <div className={riskToken.text}>
                  <TrendingDown size={28} strokeWidth={3} />
                </div>
              </div>
              {/* Barra de severidad basada en nivel de riesgo */}
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", riskToken.bg.replace('bg-', 'bg-'))}
                  style={{ width: `${Math.min(data.score, 100)}%` }}
                />
              </div>
            </Card>

            {/* Señales Críticas - Usa datos normalizados del JSONB */}
            {data.signals && data.signals.length > 0 && (
              <RiskSignals signals={data.signals} className="mt-6" />
            )}
          </div>

          {/* COLUMNA 3: RESOLUCIÓN EN TIEMPO REAL */}
          <div className="space-y-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
              Resolución en Tiempo Real
            </h2>

            <WhatsAppChat
              initialMessages={(data.notifications || []).map(n => ({
                id: n.id,
                role: 'system' as const,
                content: n.text,
                timestamp: n.timestamp,
              }))}
              mitigationSteps={data.mitigationSteps || []}
            />

            {/* Botones CTA Premium - Referencia visual */}
            <div className="space-y-3">
              <Button
                disabled={!protocolEnabled}
                className={cn(
                  "w-full py-5 text-sm font-black uppercase tracking-widest transition-all duration-300 rounded-xl",
                  protocolEnabled
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                {protocolEnabled ? "Iniciar Protocolo de Cobro" : "✓ Sin Acción Requerida"}
              </Button>

              {protocolEnabled && (
                <Button
                  variant="outline"
                  className="w-full py-5 text-sm font-black uppercase tracking-widest rounded-xl border-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Agendar Reunión de Emergencia
                </Button>
              )}
            </div>

            {/* Estado del ciclo */}
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Cierre de Ciclo: Pendiente de acción</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Historia */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900">
            Historial de Escenarios
          </h2>
          <HistoryTable historyData={history || []} />
        </div>
      </div>
    </div>
  );
}
