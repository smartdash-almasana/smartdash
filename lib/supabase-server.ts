import { createClient } from '@supabase/supabase-js';
import { requireEnvAny } from "@/lib/env";

/**
 * Cliente de Supabase (Backend/Admin).
 * Usa la Service Role Key para evitar RLS server-side.
 */
function createAdminClient() {
  try {
    const supabaseUrl = requireEnvAny(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]);
    const supabaseServiceRoleKey = requireEnvAny(["SUPABASE_SERVICE_ROLE_KEY"]);

    return createClient(supabaseUrl, supabaseServiceRoleKey);
  } catch (error) {
    console.error("Failed to initialize Supabase Admin Client:", error);
    // Return a dummy client or handle gracefully depending on usage context
    // For now, we'll return a client that will fail on use but avoids crash on import
    // throw error; // Re-throwing might crash build time if envs are missing
    return createClient("https://placeholder.supabase.co", "placeholder");
  }
}

export const supabaseAdmin = createAdminClient();
