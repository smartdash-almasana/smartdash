// lib/services/health-check.service.ts
"use server"

import { sql } from "@/lib/db"
import { isDatabaseConnected } from "@/lib/db"

export interface HealthStatus {
  service: string
  healthy: boolean
  issues: string[]
}

/**
 * Verifica la salud de los servicios críticos
 */
export async function checkRiskDataHealth(segment: string): Promise<HealthStatus[]> {
  const status: HealthStatus[] = []
  
  // Check 1: Database connection
  const dbHealthy = isDatabaseConnected()
  status.push({
    service: 'Database',
    healthy: dbHealthy,
    issues: dbHealthy ? [] : ['DATABASE_URL no configurada']
  })
  
  if (!dbHealthy) {
    return status
  }
  
  try {
    // Check 2: Snapshots exist
    const snapshotsResult = await sql`
      SELECT COUNT(*) as count FROM risk_snapshots LIMIT 1
    `
    const hasSnapshots = snapshotsResult[0]?.count > 0
    status.push({
      service: 'Snapshots',
      healthy: hasSnapshots,
      issues: hasSnapshots ? [] : ['No hay snapshots de riesgo']
    })
    
    // Check 3: Clients for segment
    const clientsResult = await sql`
      SELECT COUNT(*) as count FROM clients WHERE segment = ${segment} OR ${segment} = 'all' LIMIT 1
    `
    const hasClients = clientsResult[0]?.count > 0
    status.push({
      service: 'Clients',
      healthy: hasClients,
      issues: hasClients ? [] : [`No hay clientes para el segmento ${segment}`]
    })
    
    // Check 4: Notifications
    const notificationsResult = await sql`
      SELECT COUNT(*) as count FROM notifications WHERE type = 'whatsapp' LIMIT 1
    `
    const hasNotifications = notificationsResult[0]?.count > 0
    status.push({
      service: 'Notifications',
      healthy: true, // Notifications are optional
      issues: hasNotifications ? [] : ['No hay notificaciones']
    })
    
  } catch (error) {
    status.push({
      service: 'Query',
      healthy: false,
      issues: ['Error ejecutando consultas de health check']
    })
  }
  
  return status
}
