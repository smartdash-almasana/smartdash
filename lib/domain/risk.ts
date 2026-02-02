// lib/domain/risk.ts
export type RiskSeverity = 'low' | 'medium' | 'high'

export interface RiskSignal {
  id: string
  type: string
  score: number
  description: string
}

export interface Message {
  id: string
  type: 'incoming' | 'outgoing'
  content: string
  timestamp: Date
  priority: RiskSeverity
  status?: 'pending' | 'delivered' | 'read'
}

export interface AIActionPlan {
  rationale: string
  immediate_steps: string[]
  expected_impact: string
  risk_reduction_estimate: number
  suggested_message?: string
}
