"use client"

import React, { useState, useTransition } from "react"
import { 
  filterByRubro, 
  markAsRead 
} from "@/lib/actions"
import { 
  AIActionPlan, 
  RiskEvaluation, 
  RiskSignal, 
  Message 
} from "@/lib/domain/risk"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { RiskScoreCard } from "@/components/risk-score-card"
import { RiskTable } from "@/components/risk-table"
import { WhatsAppChat } from "@/components/whatsapp-chat"
import { MitigationWizard } from "@/components/mitigation-wizard"
import { ConnectionBanner } from "@/components/connection-banner"
import { ScrollArea } from "@/components/ui/scroll-area"

// Definición del tipo de datos que devuelve filterByRubro
// Esto asegura consistencia estricta con el contrato del backend
type DashboardData = {
  globalScore: RiskEvaluation
  signals: RiskSignal[]
  capitalMetrics: Record<string, any>
  messages: Message[]
  aiPlan: AIActionPlan | null
  alertsPending: number
  context: {
    clientId: string
    clientName: string
  }
} | null

interface DashboardContentProps {
  initialData: DashboardData
  connectionStatus?: {
    connected: boolean
    message: string
  }
}

export function DashboardContent({
  initialData,
  connectionStatus,
}: DashboardContentProps) {
  // Estado local para la UI inmediata
  const [selectedRubro, setSelectedRubro] = useState("Todos los rubros")
  const [riskData, setRiskData] = useState<DashboardData>(initialData)
  
  // Transition para UX fluida (Loading states sin bloquear la UI)
  const [isPending, startTransition] = useTransition()

  // Handler: Cambio de Rubro (Filtro Global)
  const handleRubroChange = (rubro: string) => {
    setSelectedRubro(rubro)
    startTransition(async () => {
      try {
        const newData = await filterByRubro(rubro)
        if (newData) {
          setRiskData(newData)
        }
      } catch (error) {
        console.error("Error al filtrar por rubro:", error)
        // Aquí podrías disparar un toast de error
      }
    })
  }

  // Handler: Marcar mensaje como leído (Persistencia)
  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      try {
        const updatedData = await markAsRead(id, selectedRubro)
        if (updatedData) {
          setRiskData(updatedData)
        }
      } catch (error) {
        console.error("Error al marcar como leído:", error)
      }
    })
  }

  // Fallback crítico si no hay datos iniciales
  if (!riskData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-destructive font-bold text-lg">Error de Carga</div>
          <p className="text-muted-foreground">No se pudieron recuperar los datos de riesgo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Banner de Estado de Conexión (Opcional/Debug) */}
      {connectionStatus && !connectionStatus.connected && (
        <ConnectionBanner message={connectionStatus.message} />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Estático */}
        <aside className="hidden md:block w-16 lg:w-64 border-r border-border bg-card">
          <DashboardSidebar />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header con Selector de Rubro y Estado de Carga Global */}
          <DashboardHeader
            selectedRubro={selectedRubro}
            onRubroChange={handleRubroChange}
            isLoading={isPending}
            alertsCount={riskData.alertsPending}
          />

          {/* Área Principal con Scroll */}
          <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-6">
              
              {/* Sección Superior: Score + Plan IA */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* 1. Global Risk Score */}
                <div className="xl:col-span-4">
                  <RiskScoreCard
                    evaluation={riskData.globalScore}
                    metrics={riskData.capitalMetrics}
                  />
                </div>

                {/* 2. Plan de Mitigación (IA) */}
                <div className="xl:col-span-8">
                  {riskData.aiPlan ? (
                    <MitigationWizard 
                      plan={riskData.aiPlan} 
                      isLoading={isPending}
                    />
                  ) : (
                    <div className="h-full min-h-[200px] rounded-xl border border-dashed border-muted-foreground/25 bg-card/50 flex items-center justify-center">
                      <p className="text-muted-foreground text-sm italic">
                        El servicio de IA no generó un plan para este escenario.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección Inferior: Señales + Chat */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[500px]">
                
                {/* 3. Tabla de Señales de Riesgo */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Señales Detectadas
                    </h2>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {riskData.signals.length} Indicadores Activos
                    </span>
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <ScrollArea className="h-[500px]">
                      <RiskTable signals={riskData.signals} />
                    </ScrollArea>
                  </div>
                </div>

                {/* 4. WhatsApp Chat (Persistencia & Notificaciones) */}
                <div className="lg:col-span-4 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Canal de Alertas
                    </h2>
                    {isPending && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    )}
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden h-[500px]">
                    <WhatsAppChat
                      messages={riskData.messages}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}