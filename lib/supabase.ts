import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
        'Supabase environment variables are missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
}

/**
 * Cliente de Supabase (Backend/Admin).
 * 
 * Este cliente usa la Service Role Key, por lo que NO tiene RLS 
 * y debe usarse únicamente en Server Components o API Routes.
 */
export const supabase = createClient(
    supabaseUrl || '',
    supabaseServiceRoleKey || ''
);
