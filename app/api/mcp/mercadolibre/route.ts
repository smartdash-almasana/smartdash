import { NextRequest } from "next/server";
import { getActiveToken, isExpired, refreshToken, saveRefreshedToken } from "@/lib/meli/token";

const MELI_MCP_URL = "https://mcp.mercadolibre.com/mcp";

export async function GET(req: NextRequest) {
  return handleProxy(req);
}

export async function POST(req: NextRequest) {
  return handleProxy(req);
}

async function handleProxy(req: NextRequest) {
  try {
    // 1. Obtener token activo
    let token = await getActiveToken();

    if (!token) {
      console.error("[MCP_PROXY] No token found in Supabase");
      return new Response("No active Mercado Libre token found. Please authenticate via OAuth flow.", { status: 401 });
    }

    // 2. Verificar expiración proactiva
    if (isExpired(token)) {
      try {
        console.log("[MCP_PROXY] Token expired or soon to expire, refreshing...");
        token = await refreshToken(token);
        await saveRefreshedToken(token);
      } catch (e: any) {
        console.error("[MCP_PROXY] Initial refresh failed:", e);
        return new Response(`Token refresh failed: ${e.message}`, { status: 502 });
      }
    }

    // 3. Preparar headers base (sin auth aun)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("host");
    requestHeaders.delete("connection");
    requestHeaders.delete("content-length");
    requestHeaders.delete("transfer-encoding");
    // Ensure we don't pass authorization from client if we want to inject ours
    requestHeaders.delete("authorization");

    // 4. Leer body (solo para métodos que lo soportan)
    let requestBody: ArrayBuffer | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
        try {
            const buf = await req.arrayBuffer();
            if (buf.byteLength > 0) {
                requestBody = buf;
            }
        } catch (e) {
            console.warn("[MCP_PROXY] Failed to read request body:", e);
        }
    }

    // 5. Función helper para fetch
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

    // 7. Manejo de 401 (Token invalido/revocado por ML)
    if (upstreamRes.status === 401) {
      console.warn("[MCP_PROXY] Upstream 401. Attempting refresh and retry...");
      try {
        const newToken = await refreshToken(token);
        await saveRefreshedToken(newToken);
        
        // Reintentamos
        upstreamRes = await doFetch(newToken.access_token);
      } catch (e: any) {
        console.error("[MCP_PROXY] Retry refresh failed:", e);
        return new Response(JSON.stringify({ error: "Token refresh failed during retry", details: e.message }), { 
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
    console.error("[MCP_PROXY] Internal Proxy Error:", error);
    return new Response(JSON.stringify({ error: "Internal Proxy Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
