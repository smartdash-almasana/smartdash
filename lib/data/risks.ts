import { supabase } from '@/lib/supabase';
import { DashboardRisk } from '@/lib/types/dashboard';
import type { ClienteCard, CasoTestigoCard } from '@/lib/types/welcome';

// Re-exportar tipos para compatibilidad con código existente
export type { ClienteCard, CasoTestigoCard };

/**
 * Servicio de acceso a datos de riesgos (Capa de Datos).
 * 
 * REGLAS DE ORO (No romper):
 * ❌ No convertir a camelCase (mantener snake_case de la DB).
 * ❌ No mapear enums en esta capa (devolver los valores crudos de la DB).
 * ❌ No agregar defaults ("N/A", etc.) - devolver null si la DB devuelve null.
 */

/**
 * Obtiene todos los riesgos consolidados desde la vista de API.
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 * 
 * @returns {Promise<DashboardRisk[]>} Lista de riesgos en formato crudo.
 * @throws {Error} Si existe un error en la consulta a Supabase.
 */
export async function getDashboardRisks(): Promise<DashboardRisk[]> {
    const { data, error } = await supabase
        .from('vista_dashboard_riesgos_api')
        .select('*')
        .order('puntaje_global', { ascending: false });

    if (error) {
        console.error('❌ Error fetching dashboard risks:', error);
        throw new Error(`Error fetching dashboard risks: ${error.message}`);
    }

    return (data as any[]) || [];
}

/**
 * Persiste una nueva captura de riesgo en la base de datos.
 * Tabla: capturas_riesgo
 * 
 * @param {any} data Datos del riesgo a guardar.
 * @returns {Promise<{ success: boolean, id?: string }>} Resultado de la operación.
 */
export async function saveRiskSnapshot(data: any): Promise<{ success: boolean; id?: string }> {
    const { data: inserted, error } = await supabase
        .from('capturas_riesgo')
        .insert({
            cliente_id: data.client_id,
            escenario_id: data.scenario_id,
            puntaje_global: data.global_score,
            nivel_riesgo_actual: data.risk_level,
            senales: data.signals,
            contexto_financiero: data.financial_context,
            texto_recomendacion: data.recommendation_text,
            estado_accion: data.estado_accion || 'Pendiente'
        })
        .select('id')
        .single();

    if (error) {
        console.error('❌ saveRiskSnapshot:', error);
        return { success: false };
    }

    return { success: true, id: inserted?.id };
}

/**
 * Actualiza el estado de acción de una captura de riesgo específica.
 * Tabla: capturas_riesgo
 * 
 * @param {string} capturaId UUID de la captura.
 * @param {string} nuevoEstado Valor para la columna estado_accion (Pendiente, En Proceso, Completado, Descartado).
 * @returns {Promise<void>}
 * @throws {Error} Si existe un error en la actualización.
 */
export async function updateRiskActionStatus(capturaId: string, nuevoEstado: string): Promise<void> {
    const { error } = await supabase
        .from('capturas_riesgo')
        .update({
            estado_accion: nuevoEstado,
            updated_at: new Date().toISOString()
        })
        .eq('id', capturaId);

    if (error) {
        console.error('❌ updateRiskActionStatus:', error);
        throw new Error(`Error al actualizar el estado del riesgo: ${error.message}`);
    }
}

// ============================================================================
// PANTALLA 1A: Clientes con Perfil Compuesto
// Tipos importados desde @/lib/types/welcome
// ============================================================================


/**
 * Obtiene todos los clientes para la Pantalla 1A.
 * Fuente de la Verdad: tabla clientes
 * 
 * @returns {Promise<ClienteCard[]>} Lista de clientes en formato crudo.
 */
export async function getClientes(): Promise<ClienteCard[]> {
    const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre_comercial, razon_social, segmento, img_clientes, metadata_negocio')
        .order('nombre_comercial', { ascending: true });

    if (error) {
        console.error('❌ Error fetching clientes:', error);
        throw new Error(`Error fetching clientes: ${error.message}`);
    }

    const BASE_STORAGE_URL = 'https://amygbmnjjwtnyjclghok.supabase.co/storage/v1/object/public/img_clientes/logos-perfil/';

    const clientes = (data as any[])?.map(c => ({
        ...c,
        img_clientes: c.img_clientes
            ? (c.img_clientes.startsWith('http') ? c.img_clientes : `${BASE_STORAGE_URL}${c.img_clientes}`)
            : null
    }));

    return clientes || [];
}

// ============================================================================
// PANTALLA 1B: Casos Testigo por Segmento
// Tipos importados desde @/lib/types/welcome
// ============================================================================


/**
 * Obtiene los casos testigo más críticos por segmento para la Pantalla 1B.
 * Fuente de la Verdad: vista_dashboard_riesgos_api
 * 
 * @param {string} segmento Segmento de negocio (Pyme, E-commerce, Startup, Creador)
 * @param {number} limite Número máximo de casos a retornar (default: 4)
 * @returns {Promise<CasoTestigoCard[]>} Lista de casos ordenados por criticidad.
 */
export async function getCasosTestigoBySegmento(
    segmento: string,
    limite: number = 4
): Promise<CasoTestigoCard[]> {
    segmento = decodeURIComponent(segmento).trim();
    // Fix for potential case sensitivity or special char issues
    if (segmento.toLowerCase() === 'e-commerce') segmento = 'E-commerce';

    const BASE_STORAGE_URL = 'https://amygbmnjjwtnyjclghok.supabase.co/storage/v1/object/public/img_clientes/logos-perfil/';

    // Consulta directa a tablas FV para asegurar consistencia
    // Usamos puntaje_global de capturas_riesgo para ordenar por relevancia
    // MODIFICACION: Usamos Constraints explícitos para asegurar el JOIN correcto
    const { data, error } = await supabase
        .from('capturas_riesgo')
        .select(`
            id,
            cliente_id,
            puntaje_global,
            nivel_riesgo_actual,
            clientes!capturas_riesgo_cliente_id_fkey!inner(segmento, nombre_comercial, img_clientes),
            escenarios_riesgo!capturas_riesgo_escenario_id_fkey!inner(titulo, descripcion_base, nivel_riesgo_sugerido),
            contexto_financiero,
            senales
        `)
        .eq('clientes.segmento', segmento)
        .order('puntaje_global', { ascending: false })
        .limit(limite);

    if (error) {
        console.error('❌ Error fetching casos testigo:', error);
        throw new Error(`Error fetching casos testigo: ${error.message}`);
    }

    if (!data) return [];

    return data.map((item: any) => {
        // Extraer monto y moneda del contexto financiero (JSONB)
        const ctx = item.contexto_financiero || {};
        const rawMonto = ctx.monto || ctx.amount || ctx.value || 0;
        const monto = typeof rawMonto === 'number' ? rawMonto : parseFloat(rawMonto) || 0;
        const moneda = ctx.moneda || ctx.currency || 'USD';

        // Normalizar URL de imagen
        const rawImg = item.clientes?.img_clientes;
        const imgUrl = rawImg
            ? (rawImg.startsWith('http') ? rawImg : `${BASE_STORAGE_URL}${rawImg}`)
            : null;

        return {
            captura_id: item.id,
            cliente_id: item.cliente_id,
            puntaje_global: item.puntaje_global || 0,
            escenario: item.escenarios_riesgo?.titulo || 'Escenario de Riesgo',
            descripcion_base: item.escenarios_riesgo?.descripcion_base || null,
            monto_en_riesgo: monto,
            moneda: moneda,
            // Prioridad: sugerido > actual (visual)
            nivel_riesgo: item.nivel_riesgo_actual as any,
            nivel_riesgo_sugerido: item.escenarios_riesgo?.nivel_riesgo_sugerido as any,
            senal_principal: item.senales?.principal || null,
            nombre_comercial: item.clientes?.nombre_comercial || 'Cliente Confidencial',
            segmento: item.clientes?.segmento || segmento,
            img_clientes: imgUrl
        };
    });
}

/**
 * Obtiene todos los casos testigo agrupados por segmento para la Pantalla 1B.
 * Útil para cargar todos los segmentos en una sola llamada.
 * 
 * @param {number} limitePorSegmento Número máximo de casos por segmento (default: 4)
 * @returns {Promise<Record<string, CasoTestigoCard[]>>} Casos agrupados por segmento.
 */
export async function getAllCasosTestigo(
    limitePorSegmento: number = 4
): Promise<Record<string, CasoTestigoCard[]>> {
    const segmentos = ['Pyme', 'E-commerce', 'Startup', 'Creador'];
    const results: Record<string, CasoTestigoCard[]> = {};

    // Ejecutar en paralelo para mejor performance
    const promises = segmentos.map(async (seg) => {
        const casos = await getCasosTestigoBySegmento(seg, limitePorSegmento);
        return { segmento: seg, casos };
    });

    const resolved = await Promise.all(promises);

    for (const { segmento, casos } of resolved) {
        results[segmento] = casos;
    }

    return results;
}
