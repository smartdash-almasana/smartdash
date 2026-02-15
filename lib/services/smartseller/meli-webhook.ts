import { supabaseAdmin } from '@/lib/supabase-server';
import crypto from 'crypto';

/**
 * Genera una dedupe_key única basada en el contenido del webhook.
 * Usa SHA-256 para asegurar que el mismo payload genere la misma llave.
 */
function generateDedupeKey(body: any): string {
    const stableString = JSON.stringify(body, Object.keys(body).sort());
    return crypto.createHash('sha256').update(stableString).digest('hex');
}

/**
 * Almacena el evento crudo de Mercado Libre en Supabase.
 * Implementa el patrón "Push over Pull" y garantiza idempotencia.
 */
export async function storeMeliWebhookEvent(body: any) {
    const dedupeKey = generateDedupeKey(body);
    const topic = body.topic || 'unknown';
    const resource = body.resource || 'unknown';
    const userId = body.user_id?.toString() || 'unknown';
    const applicationId = body.application_id?.toString() || 'unknown';

    try {
        const { data, error } = await supabaseAdmin
            .from('webhook_events')
            .insert({
                dedupe_key: dedupeKey,
                provider: 'mercadolibre',
                topic: topic,
                resource: resource,
                user_id: userId,
                application_id: applicationId,
                payload: body,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            // Si es un error de duplicado (23505), lo ignoramos silenciosamente
            if (error.code === '23505') {
                console.log(`[Webhook] Duplicate event ignored: ${dedupeKey}`);
                return { success: true, duplicate: true };
            }
            throw error;
        }

        return { success: true, dedupeKey, event: data };
    } catch (error) {
        console.error('[Webhook Error] Failed to store event:', error);
        return { success: false, error };
    }
}
