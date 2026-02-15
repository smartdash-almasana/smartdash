import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Sistema de Locks basado en DB para evitar ejecuciones concurrentes de CRONs.
 */
export async function acquireJobLock(
    supabaseAdmin: SupabaseClient,
    jobKey: string,
    ttlSeconds: number,
    lockedBy: string
): Promise<boolean> {
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + ttlSeconds * 1000);

    // 1. Limpieza atómica y adquisición condicional
    // Usamos SQL para asegurar atomicidad
    const { data, error } = await supabaseAdmin.rpc('acquire_clinical_lock', {
        p_job_key: jobKey,
        p_ttl_seconds: ttlSeconds,
        p_locked_by: lockedBy
    });

    if (error) {
        // Si la RPC no existe, implementamos fallback vía query directa (menos atómica pero funcional)
        console.warn("[Job Lock] RPC 'acquire_clinical_lock' not found, falling back to query logic.");

        // Fallback logic
        const { data: currentLock } = await supabaseAdmin
            .from('job_locks')
            .select('*')
            .eq('job_key', jobKey)
            .single();

        if (currentLock && new Date(currentLock.locked_until) > now) {
            return false;
        }

        const { error: upsertError } = await supabaseAdmin
            .from('job_locks')
            .upsert({
                job_key: jobKey,
                locked_until: lockedUntil.toISOString(),
                locked_by: lockedBy,
                updated_at: now.toISOString()
            });

        return !upsertError;
    }

    return !!data;
}

export async function releaseJobLock(supabaseAdmin: SupabaseClient, jobKey: string) {
    await supabaseAdmin
        .from('job_locks')
        .update({ locked_until: new Date().toISOString() })
        .eq('job_key', jobKey);
}
