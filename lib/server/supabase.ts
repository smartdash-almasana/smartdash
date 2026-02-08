import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Supabase environment variables are missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

/**
 * Cliente Supabase server-side (Service Role).
 * Solo para uso en Server Components / Route Handlers.
 */
export const supabaseServer = createClient(
  supabaseUrl || "",
  supabaseServiceRoleKey || ""
);
