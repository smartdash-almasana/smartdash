import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // CHECK 1: Runtime Envs
  const envCheck = {
    has_SUPABASE_URL: !!process.env.SUPABASE_URL,
    has_NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_MELI_CLIENT_ID: !!process.env.MELI_CLIENT_ID,
    has_MELI_APP_ID: !!process.env.MELI_APP_ID,
    has_MELI_CLIENT_SECRET: !!process.env.MELI_CLIENT_SECRET,
    has_MELI_REDIRECT_URI: !!process.env.MELI_REDIRECT_URI
  };

  // CHECK 2: Supabase Connectivity
  let supabaseInitOk = false;
  let supabaseSelectOk = false;
  let supabaseError: string | null = null;
  let tokenStatus = "unknown";

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        supabaseInitOk = true;

        const { data, error } = await sb.from("meli_oauth_tokens").select("*").limit(1);

        if (error) {
            supabaseError = error.message.substring(0, 160);
        } else {
            supabaseSelectOk = true;
            if (data && data.length > 0) {
                tokenStatus = "present";
            } else {
                tokenStatus = "missing_in_db";
            }
        }
    } else {
        supabaseError = "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY";
    }
  } catch (e: any) {
    supabaseError = (e.message || String(e)).substring(0, 160);
  }

  // Construct final response
  const responseData = {
    checks: {
        env: envCheck,
        supabase: {
            init: supabaseInitOk,
            select: supabaseSelectOk,
            error: supabaseError
        },
        token: tokenStatus
    },
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    status: supabaseSelectOk ? 200 : 503,
    headers: { "Content-Type": "application/json" }
  });
}
