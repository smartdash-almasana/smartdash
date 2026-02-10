// lib/actions.ts
'use server';

import { getDashboardRisks, getClientes } from '@/lib/data/risks';

/**
 * CLIENTES
 * Fuente: tabla clientes
 */
export async function getClientesFromDB() {
  try {
    return await getClientes();
  } catch (error) {
    console.error('❌ getClientesFromDB:', error);
    return [];
  }
}

/**
 * CAPTURAS DE RIESGO POR CLIENTE
 * Fuente: vista_dashboard_riesgos_api
 */
export async function getCapturasByCliente(clienteId: string) {
  try {
    const risks = await getDashboardRisks();

    return risks
      .filter(r => r.cliente_id === clienteId)
      .map(r => ({
        id: r.captura_id,
        nivel_riesgo_actual: r.nivel_riesgo,
        puntaje_global: Number(r.puntaje_global),
        estado_accion: r.estado_accion,
        escenario: {
          id: r.escenario_id,
          titulo: r.escenario,
          descripcion_base: r.descripcion_escenario || ''
        }
      }));
  } catch (error) {
    console.error('❌ getCapturasByCliente:', error);
    return [];
  }
}
