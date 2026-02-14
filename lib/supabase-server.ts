import { createClient } from '@supabase/supabase-js';
import { requireEnv } from "@/lib/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Can be optional on server if only using admin
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl && !process.env.SUPABASE_URL) {
    throw new Error('Supabase URL missing');
}
if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
}

/**
 * Cliente de Supabase (Backend/Admin).
 * 
 * Usa la Service Role Key, por lo que NO tiene RLS.
 * Debe usarse únicamente en Server Components o API Routes.
 */
export const supabaseAdmin = createClient(
    supabaseUrl || process.env.SUPABASE_URL || '',
    supabaseServiceRoleKey || ''
);
