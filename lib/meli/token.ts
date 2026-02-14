import { supabaseAdmin } from "@/lib/supabase-server";
import { requireEnvAny } from "@/lib/env";

export interface MeliToken {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO string
  raw?: any;
}

/**
 * Obtiene el token activo de la base de datos.
 */
export async function getActiveToken(): Promise<MeliToken | null> {
  const { data, error } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return null;
    }
    console.error("[MELI_TOKEN] Error fetching token:", error);
    return null;
  }

  return data as MeliToken;
}

/**
 * Verifica expiración (buffer 2 min).
 */
export function isExpired(token: MeliToken): boolean {
  if (!token.expires_at) return true;
  const expires = new Date(token.expires_at).getTime();
  const now = Date.now();
  return expires <= now + 120000;
}

/**
 * Refresca el token usando la API de Mercado Libre.
 */
export async function refreshToken(token: MeliToken): Promise<MeliToken> {
  const clientId = requireEnvAny(["MELI_CLIENT_ID", "MELI_APP_ID"]);
  const clientSecret = requireEnvAny(["MELI_CLIENT_SECRET"]);

  if (!token.refresh_token) {
    throw new Error("Missing 'refresh_token' in active token data.");
  }

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", token.refresh_token);

  let res: Response;
  try {
    res = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch (error: any) {
    throw new Error(`REFRESH_NETWORK_ERROR: ${error.message}`);
  }

  if (!res.ok) {
    const errorText = await res.text();
    const bodyPreview = errorText.substring(0, 200);
    console.error("meli_refresh_failed", { status: res.status, bodyPreview });
    // Lanzamos error que inicia con REFRESH_FAILED para que el proxy lo maneje como 401
    throw new Error(`REFRESH_FAILED: ${res.status} - ${bodyPreview}`);
  }

  const data = await res.json();
  const newExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000).toISOString();

  return {
    ...token,
    access_token: data.access_token,
    refresh_token: data.refresh_token || token.refresh_token,
    expires_at: newExpiresAt,
    raw: data,
  };
}

/**
 * Guarda el token refrescado.
 */
export async function saveRefreshedToken(token: MeliToken): Promise<void> {
  const { error } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .update({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at,
      updated_at: new Date().toISOString(),
      raw: token.raw
    })
    .eq("user_id", token.user_id);

  if (error) {
    console.error("[MELI_TOKEN] Failed to save token:", error);
    throw new Error(`Failed to save refreshed token: ${error.message}`);
  }
}
