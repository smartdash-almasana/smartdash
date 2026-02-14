import { NextRequest } from "next/server";
import { getActiveToken, isExpired, refreshToken, saveRefreshedToken } from "@/lib/meli/token";
import { v4 as uuidv4 } from 'uuid';

const MELI_MCP_URL = "https://mcp.mercadolibre.com/mcp";

export async function GET(req: NextRequest) {
  return handleProxy(req);
}

export async function POST(req: NextRequest) {
  return handleProxy(req);
}

async function handleProxy(req: NextRequest) {
  const requestId = uuidv4();
  console.log(`[MCP_PROXY_${requestId}] Request received: ${req.method} ${req.url}`);

  try {
    // 1. Obtener token activo
    let token = await getActiveToken();

    if (!token) {
      console.warn(`[MCP_PROXY_${requestId}] No token found in Supabase`);
      return new Response("No active Mercado Libre token found. Please authenticate via OAuth flow.", { status: 401 });
    }

    // 2. Verificar expiración proactiva (Refresh if expired or < 2 mins)
    if (isExpired(token)) {
      console.log(`[MCP_PROXY_${requestId}] Token expired or soon to expire. Refreshing...`);
      try {
        token = await refreshToken(token);
        await saveRefreshedToken(token);
        console.log(`[MCP_PROXY_${requestId}] Refresh SUCCESS. New expiration: ${token.expires_at}`);
      } catch (e: any) {
        console.error(`[MCP_PROXY_${requestId}] Initial refresh failed:`, e);
        if (e.message.startsWith("REFRESH_FAILED")) {
           return new Response(`Token refresh failed. Your session might be invalid. Error: ${e.message}`, { status: 401 });
        }
        return new Response(`Token refresh network error: ${e.message}`, { status: 502 });
      }
    }

    // 3. Preparar headers base
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("host");
    requestHeaders.delete("connection");
    requestHeaders.delete("content-length");
    requestHeaders.delete("transfer-encoding");
    requestHeaders.delete("authorization"); // Remove client auth

    // 4. Leer body
    let requestBody: ArrayBuffer | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        const buf = await req.arrayBuffer();
        if (buf.byteLength > 0) {
          requestBody = buf;
        }
      } catch (e) {
        console.warn(`[MCP_PROXY_${requestId}] Failed to read request body:`, e);
      }
    }

    // 5. Helper fetch
    const doFetch = async (accessToken: string) => {
      const headers = new Headers(requestHeaders);
      headers.set("Authorization", `Bearer ${accessToken}`);
      
      return fetch(MELI_MCP_URL, {
        method: req.method,
        headers: headers,
        body: requestBody,
        cache: "no-store",
      });
    };

    // 6. Primer intento
    let upstreamRes = await doFetch(token.access_token);
    console.log(`[MCP_PROXY_${requestId}] Upstream Response: ${upstreamRes.status}`);

    // 7. Manejo de 401 (Token invalido/revocado por ML)
    if (upstreamRes.status === 401) {
      console.warn(`[MCP_PROXY_${requestId}] Upstream 401. Re-authenticating...`);
      try {
        const newToken = await refreshToken(token);
        await saveRefreshedToken(newToken);
        
        // Reintentamos
        upstreamRes = await doFetch(newToken.access_token);
        console.log(`[MCP_PROXY_${requestId}] Retry Response: ${upstreamRes.status}`);
      } catch (e: any) {
        console.error(`[MCP_PROXY_${requestId}] Retry refresh failed:`, e);
        if (e.message.startsWith("REFRESH_FAILED")) {
            return new Response(JSON.stringify({ error: "Token refresh failed during retry (credential invalid)", details: e.message }), { 
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }
        return new Response(JSON.stringify({ error: "Token refresh network failed during retry", details: e.message }), { 
            status: 502,
            headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 8. Streaming de la respuesta
    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: upstreamRes.headers,
    });

  } catch (error: any) {
    console.error(`[MCP_PROXY_${requestId}] Internal Proxy Error:`, error);
    return new Response(JSON.stringify({ error: "Internal Proxy Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
