"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Scale,
  Users,
  Shield,
  TrendingDown,
  Truck,
  Settings,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScenarioCardData } from "@/lib/actions";

// Mapeo de iconos según el vertical de la DB
const VERTICAL_ICONS: Record<string, typeof AlertTriangle> = {
  "Fiscal": Scale,
  "Legal": Shield,
  "RRHH": Users,
  "Reputación": TrendingDown,
  "Supply Chain": Truck,
  "Operaciones": Settings,
  "Financiero": DollarSign,
};

// Temas de color según nivel de riesgo - Keys en ESPAÑOL (contrato DashboardRisk)
const RISK_THEMES: Record<string, {
  hoverBorder: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
}> = {
  'Crítico': {
    hoverBorder: "hover:border-red-400",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    iconBg: "bg-red-50",
    iconColor: "text-red-600"
  },
  'Alto': {
    hoverBorder: "hover:border-orange-400",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  'Medio': {
    hoverBorder: "hover:border-yellow-400",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-700",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600"
  },
  'Bajo': {
    hoverBorder: "hover:border-green-400",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
    iconBg: "bg-green-50",
    iconColor: "text-green-600"
  },
};

export function CaseSelector({ currentRubro, scenarios }: { currentRubro: string; scenarios: ScenarioCardData[] }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Escenarios en <span className="text-orange-600">{currentRubro}</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Selecciona un caso para analizar el diagnóstico detallado y las acciones de mitigación recomendadas.
        </p>
      </div>

      {/* Grid de Tarjetas */}
      {scenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((scenario) => {
            // Usa nivel_riesgo directamente (español) - fallback a 'Bajo'
            const theme = RISK_THEMES[scenario.nivel_riesgo] || RISK_THEMES['Bajo'];
            const IconComponent = VERTICAL_ICONS[scenario.vertical] || AlertTriangle;

            return (
              <Link
                key={scenario.id}
                href={`/?rubro=${currentRubro}&scenario=${scenario.id}`}
                className="group block"
              >
                <Card
                  className={cn(
                    "relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300",
                    "hover:shadow-lg",
                    theme.hoverBorder
                  )}
                >
                  {/* Badge de Riesgo - Esquina Superior Derecha */}
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full",
                        theme.badgeBg,
                        theme.badgeText
                      )}
                    >
                      {scenario.nivel_riesgo}
                    </Badge>
                  </div>

                  {/* Icono Grande - Lado Izquierdo */}
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                    theme.iconBg
                  )}>
                    <IconComponent className={cn("w-8 h-8", theme.iconColor)} strokeWidth={2.5} />
                  </div>

                  {/* Título */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug min-h-[3.5rem]">
                    {scenario.scenario_description}
                  </h3>

                  {/* Vertical */}
                  <p className="text-sm text-gray-500 mb-4">
                    {scenario.vertical}
                  </p>

                  {/* Footer - Enlace Sutil */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-400 group-hover:text-blue-600 transition-colors font-medium">
                      Analizar Caso
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        // Estado Vacío
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center bg-gray-50/50">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <AlertTriangle className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No hay casos disponibles para este rubro
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No se encontraron escenarios de riesgo para <span className="font-semibold">{currentRubro}</span> en la base de datos.
          </p>
        </div>
      )}
    </div>
  );
}
