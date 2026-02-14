import { NextRequest } from "next/server";
import { getActiveToken, isExpired } from "@/lib/meli/token";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const envStatus = {
    hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasClientId: !!process.env.MELI_CLIENT_ID || !!process.env.MELI_APP_ID,
    hasClientSecret: !!process.env.MELI_CLIENT_SECRET
  };

  const supabaseStatus = {
    canInit: false,
    canSelect: false
  };

  try {
    // If Admin Client is initialized correctly, it means createClient didn't explode
    supabaseStatus.canInit = true;

    // Try a simple select to check connectivity
    const { data, error } = await supabaseAdmin.from("meli_oauth_tokens").select("id").limit(1);

    if (!error) {
      supabaseStatus.canSelect = true;
    } else {
      console.error("[HEALTH] Supabase select failed:", error.message);
      supabaseStatus.canSelect = false;
    }
  } catch (e: any) {
    console.error("[HEALTH] Supabase init or select exception:", e);
    supabaseStatus.canSelect = false;
  }

  // Token status
  let tokenStatus = "missing";
  try {
    if (supabaseStatus.canSelect) {
      const token = await getActiveToken();
      if (token) {
        if (isExpired(token)) {
          tokenStatus = "expired";
        } else {
          tokenStatus = "valid";
        }
      }
    }
  } catch (e) {
    console.error("[HEALTH] Token check exception:", e);
    tokenStatus = "check_failed";
  }

  const ok = envStatus.hasSupabaseUrl && envStatus.hasServiceRole && envStatus.hasClientId && envStatus.hasClientSecret && supabaseStatus.canSelect && (tokenStatus === "valid" || tokenStatus === "expired");

  return new Response(JSON.stringify({
    ok,
    env: envStatus,
    supabase: supabaseStatus,
    tokenStatus,
    timestamp: new Date().toISOString()
  }), {
    status: ok ? 200 : 503,
    headers: { "Content-Type": "application/json" }
  });
}
