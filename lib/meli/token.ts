import { supabaseAdmin } from "@/lib/supabase-server";
import { requireEnvAny } from "@/lib/env";

export interface MeliToken {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO string
  raw?: any;
}

export interface ReauthorizationRequiredError {
  error: "reauthorization_required";
}

function reauthorizationRequired(): ReauthorizationRequiredError {
  return { error: "reauthorization_required" };
}

export function isReauthorizationRequiredError(error: unknown): error is ReauthorizationRequiredError {
  return !!error && typeof error === "object" && (error as ReauthorizationRequiredError).error === "reauthorization_required";
}

/**
 * Obtiene el token activo para un user_id específico.
 */
export async function getActiveToken(userId: number | string): Promise<MeliToken> {
  const userIdStr = String(userId);
  const { data, error } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .select("*")
    .eq("user_id", userIdStr)
    .eq("status", "active")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw reauthorizationRequired();
    }
    throw new Error(`[MELI_TOKEN] Error fetching token for user ${userIdStr}: ${error.message}`);
  }

  const token = data as MeliToken;

  if (!token.refresh_token) {
    throw reauthorizationRequired();
  }

  return token;
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
export async function refreshToken(userId: number | string): Promise<MeliToken> {
  const userIdStr = String(userId);
  const token = await getActiveToken(userIdStr);
  const clientId = requireEnvAny(["MELI_CLIENT_ID", "MELI_APP_ID"]);
  const clientSecret = requireEnvAny(["MELI_CLIENT_SECRET"]);

  if (!token.refresh_token) {
    throw reauthorizationRequired();
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

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 400 && data?.error === "invalid_grant") {
      await supabaseAdmin
        .from("meli_oauth_tokens")
        .update({
          status: "invalid",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userIdStr);
      throw reauthorizationRequired();
    }
    throw new Error(`REFRESH_FAILED: ${res.status} - ${JSON.stringify(data).substring(0, 200)}`);
  }

  if (!data.refresh_token) {
    throw new Error("REFRESH_FAILED: missing_rotated_refresh_token");
  }

  const newExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
      raw: data,
      status: "active",
    })
    .eq("user_id", userIdStr);

  if (error) {
    throw new Error(`Failed to save refreshed token: ${error.message}`);
  }

  return {
    ...token,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: newExpiresAt,
    raw: data,
  };
}
