// lib/services/health-check.service.ts
"use server";

import { sql } from "@/lib/db";

export interface HealthStatus {
  service: string;
  healthy: boolean;
  issues: string[];
}

/**
 * Verifica la salud de los servicios críticos de infraestructura.
 * No valida lógica de negocio ni existencia de datos de demo.
 */
export async function checkRiskDataHealth(): Promise<HealthStatus[]> {
  const status: HealthStatus[] = [];

  /* ------------------------------------------------------------------
   * Check 1: Database connectivity
   * ------------------------------------------------------------------ */
  try {
    await sql`SELECT 1`;
    status.push({
      service: "Database",
      healthy: true,
      issues: [],
    });
  } catch (error) {
    status.push({
      service: "Database",
      healthy: false,
      issues: ["No se pudo conectar a la base de datos"],
    });

    // Si no hay DB, no tiene sentido seguir
    return status;
  }

  /* ------------------------------------------------------------------
   * Check 2: Critical view availability
   * ------------------------------------------------------------------ */
  try {
    await sql`SELECT 1 FROM v_latest_risks LIMIT 1`;
    status.push({
      service: "Risk View (v_latest_risks)",
      healthy: true,
      issues: [],
    });
  } catch {
    status.push({
      service: "Risk View (v_latest_risks)",
      healthy: false,
      issues: ["La vista v_latest_risks no está disponible"],
    });
  }

  /* ------------------------------------------------------------------
   * Check 3: Base table write access
   * ------------------------------------------------------------------ */
  try {
    await sql`
      SELECT estado_accion
      FROM capturas_riesgo
      LIMIT 1
    `;
    status.push({
      service: "Risk Snapshots Table",
      healthy: true,
      issues: [],
    });
  } catch {
    status.push({
      service: "Risk Snapshots Table",
      healthy: false,
      issues: ["No se puede acceder a capturas_riesgo"],
    });
  }

  /* ------------------------------------------------------------------
   * Check 4: Clients table
   * ------------------------------------------------------------------ */
  try {
    await sql`SELECT 1 FROM clientes LIMIT 1`;
    status.push({
      service: "Clients",
      healthy: true,
      issues: [],
    });
  } catch {
    status.push({
      service: "Clients",
      healthy: false,
      issues: ["No se puede acceder a clientes"],
    });
  }

  /* ------------------------------------------------------------------
   * Check 5: Notifications table
   * ------------------------------------------------------------------ */
  try {
    await sql`SELECT 1 FROM notificaciones LIMIT 1`;
    status.push({
      service: "Notifications",
      healthy: true,
      issues: [],
    });
  } catch {
    status.push({
      service: "Notifications",
      healthy: false,
      issues: ["No se puede acceder a notificaciones"],
    });
  }

  return status;
}
