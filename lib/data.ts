// lib/data.ts
// MOCK DATA - Datos de demostración que respetan el contrato RiskSnapshot (español)

import { RiskSnapshot } from '@/lib/domain/risk';

export const MOCK_RISK_SNAPSHOT: RiskSnapshot = {
  id: 'mock-1',
  client_id: 'demo-client',

  scenario_description: 'Falta de liquidez inminente para nómina.',
  nivel_riesgo: 'Crítico', // ES enum
  global_score: 82.4,

  signals: [
    {
      type: 'financial',
      code: 'CASH_FLOW',
      value: 85,
      weight: 9,
      description: 'Flujo de caja negativo proyectado',
    },
  ],

  financial_context: {
    estimated_cost: 18500,
    currency: '$',
  },

  recommendation_type: 'financial_action',
  recommendation_text: 'Contactar clientes clave hoy para asegurar cobros.',

  estado_accion: 'Pendiente', // ES enum

  created_at: new Date().toISOString(),
};
