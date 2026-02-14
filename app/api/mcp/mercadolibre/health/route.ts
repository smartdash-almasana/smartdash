import { NextRequest } from "next/server";
import { getActiveToken, isExpired } from "@/lib/meli/token";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let hasSupabase = false;
  let hasMeliCreds = false;
  let tokenStatus = "missing";

  // Check generic Supabase connectivity
  try {
    const { data, error } = await supabaseAdmin.from("meli_oauth_tokens").select("count(*)", { count: "exact", head: true });
    if (!error) hasSupabase = true;
  } catch (e) {
    console.error("Supabase check failed", e);
  }

  // Check Meli Creds
  if (process.env.MELI_APP_ID && process.env.MELI_CLIENT_SECRET) {
    hasMeliCreds = true;
  }

  // Check Token
  try {
    const token = await getActiveToken();
    if (token) {
        if (isExpired(token)) {
            tokenStatus = "expired";
        } else {
            tokenStatus = "valid";
        }
    } else {
        tokenStatus = "missing";
    }
  } catch (e) {
      console.error("Token check failed", e);
      tokenStatus = "error";
  }

  return new Response(JSON.stringify({
    ok: hasSupabase && hasMeliCreds && (tokenStatus === "valid" || tokenStatus === "expired"),
    hasSupabase,
    hasMeliCreds,
    tokenStatus,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
