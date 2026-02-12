import { supabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

export interface MeliTokenRow {
  user_id: string; // Changed to string to match schema
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope?: string;
  updated_at?: string;
  raw?: any;
}

/**
 * Genera un code_verifier aleatorio (PKCE)
 */
export function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Genera un code_challenge a partir del code_verifier (S256)
 */
export function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
}

/**
 * Genera un state aleatorio para prevenir CSRF
 */
export function generateState() {
  return crypto.randomBytes(16).toString("base64url");
}

/**
 * Enmascara un token para logs
 */
export function maskToken(token: string) {
  if (!token || token.length < 10) return "****";
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
}

/**
 * Obtiene un access_token vigente, refrescándolo si es necesario.
 */
export async function getValidMeliAccessToken(meliUserId: number | string): Promise<string> {
  const appId = process.env.MELI_APP_ID;
  const clientSecret = process.env.MELI_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    throw new Error("Missing MELI_APP_ID or MELI_CLIENT_SECRET");
  }

  // Convert to string for consistent querying
  const userIdStr = String(meliUserId);

  const { data: row, error } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .select("*")
    .eq("user_id", userIdStr)
    .single();

  if (error || !row) {
    throw new Error(`No tokens found for user ${userIdStr}`);
  }

  const tokenRow = row as MeliTokenRow;
  // Handle case where expires_at might be missing or invalid
  const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at).getTime() : 0;
  const now = Date.now();

  // Buffer de 2 minutos
  if (expiresAt > now + 120000) {
    return tokenRow.access_token;
  }

  console.log(`[MELI] Refreshing token for user ${userIdStr} (Masked: ${maskToken(tokenRow.refresh_token)})`);

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: appId,
    client_secret: clientSecret,
    refresh_token: tokenRow.refresh_token,
  });

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`[MELI] Refresh failed for user ${userIdStr}:`, data);
    throw new Error(`Refresh failed: ${data.message || res.statusText}`);
  }

  const newExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .upsert({
      user_id: String(data.user_id),
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      scope: data.scope,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
      raw: data
    });

  if (updateError) {
    throw new Error(`Failed to persist refreshed token: ${updateError.message}`);
  }

  return data.access_token;
}
