import { supabaseAdmin } from "@/lib/supabase-server";
import { requireEnv } from "@/lib/env";

export interface MeliToken {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO string
  raw?: any;
}

/**
 * Obtiene el token activo de la base de datos.
 * Asume que hay un solo usuario o toma el primero encontrado.
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
    // Don't throw, return null so caller can handle missing token gracefully (e.g. 401)
    return null;
  }

  return data as MeliToken;
}

/**
 * Verifica si el token ha expirado o está próximo a expirar (buffer de 2 min).
 */
export function isExpired(token: MeliToken): boolean {
  if (!token.expires_at) return true;
  const expires = new Date(token.expires_at).getTime();
  const now = Date.now();
  // Buffer de seguridad de 2 minutos (120000 ms)
  return expires <= now + 120000;
}

/**
 * Refresca el token usando la API de Mercado Libre.
 */
export async function refreshToken(token: MeliToken): Promise<MeliToken> {
  const appId = requireEnv("MELI_APP_ID");
  const clientSecret = requireEnv("MELI_CLIENT_SECRET");

  if (!token.refresh_token) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", appId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", token.refresh_token);

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.message || res.statusText;
    console.error(`[MELI_TOKEN] Refresh failed for user ${token.user_id}: ${errorMsg}`);
    throw new Error(`Refresh failed: ${errorMsg}`);
  }

  // Calculate new expiration time
  const newExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000).toISOString();

  // Return new token object (does not save automatically, saveRefreshedToken must be called)
  return {
    ...token,
    access_token: data.access_token,
    refresh_token: data.refresh_token || token.refresh_token,
    expires_at: newExpiresAt,
    raw: data,
  };
}

/**
 * Guarda el token refrescado en la base de datos.
 */
export async function saveRefreshedToken(token: MeliToken): Promise<void> {
  // Update only fields that changed
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
