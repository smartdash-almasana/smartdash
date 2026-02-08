import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Supabase environment variables are missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
}

/**
 * Cliente de Supabase (Client-safe).
 * 
 * Usa la ANON key para permitir uso en Client Components con RLS.
 */
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
