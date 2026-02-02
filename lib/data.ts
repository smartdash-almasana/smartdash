// lib/data.ts
// RUBROS: Segmentos de clientes disponibles en Neon DB
// CONFIGURACIONES DE COLOR PARA EL GAUGE

import { RiskLevel } from '@/lib/domain/risk'

export type Rubro = {
  id: string
  label: string
  segment: string
}

export const RUBROS: Rubro[] = [
  { id: 'all', label: 'Todos los rubros', segment: 'all' },
  { id: 'retail', label: 'Retail', segment: 'retail' },
  { id: 'manufacturing', label: 'Manufactura', segment: 'manufacturing' },
  { id: 'services', label: 'Servicios', segment: 'services' },
  { id: 'technology', label: 'Tecnologia', segment: 'technology' },
  { id: 'finance', label: 'Finanzas', segment: 'finance' },
] as const

export type RubroKey = typeof RUBROS[number]['id']

export const RISK_COLORS: Record<RiskLevel, string> = {
  critico: '#ef4444',
  alto: '#f97316',
  moderado: '#eab308',
  bajo: '#3b82f6',
  estable: '#22c55e',
} as const
