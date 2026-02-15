Informe Técnico
Integración MCP Mercado Libre + Proxy OAuth (Smartdash)

Proyecto: Smartdash
Dominio: mismartdash.vercel.app
Fecha: 2026-02-14
Estado: Operativo (SSE funcional + OAuth con refresh_token persistido)

1. Arquitectura General
Componentes

Mercado Libre OAuth API

https://api.mercadolibre.com

Protocolo OAuth 2.0

Tokens: access_token + refresh_token

Mercado Libre MCP Server

https://mcp.mercadolibre.com/mcp

Transporte: SSE obligatorio (text/event-stream)

Proxy Smartdash (Vercel)

app/api/mcp/mercadolibre/route.ts

Funciones:

Inyectar Authorization: Bearer

Manejar refresh automático

Forward SSE

Sanitizar headers de transporte

Supabase

Tabla: meli_oauth_tokens

Cliente admin (SUPABASE_SERVICE_ROLE_KEY)

2. Flujo OAuth Implementado
2.1 Autorización
GET /api/meli/oauth/start
→ redirige a ML authorize endpoint


Parámetros clave:

response_type=code

client_id

redirect_uri

(recomendado) state

2.2 Intercambio de code por token
POST https://api.mercadolibre.com/oauth/token


Body:

grant_type=authorization_code
client_id
client_secret
code
redirect_uri


Se persiste en Supabase:

access_token

refresh_token

expires_at

user_id

2.3 Refresh automático

Si:

token expirado

o upstream responde 401

Entonces:

grant_type=refresh_token
client_id
client_secret
refresh_token


Se actualiza la fila activa.

3. Problemas Detectados y Soluciones Aplicadas
PROBLEMA 1 — Supabase no conectado
Síntoma

hasSupabase: false en /health.

Causa

Faltaba SUPABASE_URL en Vercel.

Resolución

Fallback implementado:

SUPABASE_URL ?? NEXT_PUBLIC_SUPABASE_URL

PROBLEMA 2 — refresh_token no persistido
Síntoma
Missing 'refresh_token' in active token data.

Causa

Callback OAuth no guardaba refresh_token.

Resolución

Persistencia corregida en /oauth/callback

Health check incluye hasRefreshToken

PROBLEMA 3 — 406 Not Acceptable
Síntoma
Client must accept text/event-stream

Causa

El upstream MCP exige:

Accept: text/event-stream

Resolución

Proxy fuerza header:

Accept: text/event-stream

PROBLEMA 4 — 504 Gateway Timeout (SSE)
Síntoma

SSE quedaba colgado → Vercel devolvía 504.

Causa

Streaming prolongado + Vercel serverless timeout.

Resolución

Passthrough correcto de ReadableStream

Eliminación de headers conflictivos:

Content-Encoding

Content-Length

Transfer-Encoding

PROBLEMA 5 — Brotli (br) doble compresión
Síntoma

Antigravity no podía leer la respuesta.

Causa

Upstream enviaba:

Content-Encoding: br


Proxy lo forwardeaba sin decodificar.

Resolución

Se eliminan headers de compresión antes de responder.

4. Healthcheck Oficial

Endpoint:

GET /api/mcp/mercadolibre/health


Campos clave:

env
supabase.init
supabase.select
token
hasRefreshToken


Estado saludable esperado:

{
  "token": "present",
  "hasRefreshToken": true,
  "supabase": {
    "init": true,
    "select": true
  }
}

5. Variables de Entorno Requeridas
Supabase

NEXT_PUBLIC_SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

Mercado Libre

MELI_CLIENT_ID

MELI_APP_ID (fallback)

MELI_CLIENT_SECRET

MELI_REDIRECT_URI

6. Pruebas Técnicas de Diagnóstico
6.1 Test SSE
curl -i -H "Accept: text/event-stream" https://mismartdash.vercel.app/api/mcp/mercadolibre


Debe responder:

200
Content-Type: text/event-stream

6.2 Test Health
curl -s https://mismartdash.vercel.app/api/mcp/mercadolibre/health

6.3 Test API Real
GET /users/me
Authorization: Bearer <token>

7. Lecciones Técnicas Importantes

SSE en Vercel requiere cuidado extremo con headers.

Nunca forwardear Content-Encoding sin controlar compresión.

Siempre persistir refresh_token.

Siempre tener healthcheck con:

estado de DB

estado de token

estado de refresh

OAuth y MCP son sistemas distintos:

OAuth → datos del seller

MCP → herramientas/documentación

8. Estado Final

✔ OAuth funcionando
✔ refresh_token persistido
✔ Proxy inyecta Authorization
✔ MCP conectado en Antigravity
✔ SSE funcional
✔ Healthcheck estable

Sistema listo para producción.

Si querés, ahora puedo:

Hacer una versión más ejecutiva (para README),

O un diagrama técnico de arquitectura,

O una checklist operativa de emergencia (runbook).

Hacer una versión más ejecutiva (para README),

Perfecto. Aquí tienes una versión ejecutiva para el README del proyecto: clara, compacta y orientada a operación.

Mercado Libre Integration (OAuth + MCP Proxy)

Smartdash integra con Mercado Libre mediante:

OAuth 2.0 (Server-side)

Proxy MCP (SSE) en Vercel

Persistencia de tokens en Supabase

Refresh automático ante expiración / 401

Arquitectura Resumida
Antigravity
     ↓
Smartdash MCP Proxy (Vercel)
     ↓
Mercado Libre MCP (SSE)
     ↓
Mercado Libre API (OAuth Bearer)


Tokens y credenciales se gestionan exclusivamente en backend.

1️⃣ OAuth Flow (Producción)
Paso 1 — Autorización
GET /api/meli/oauth/start


Redirige a Mercado Libre para obtener code.

Paso 2 — Intercambio de token
POST https://api.mercadolibre.com/oauth/token


Se persisten en Supabase:

access_token

refresh_token

expires_at

Paso 3 — Refresh automático

Se ejecuta cuando:

Token expirado

Respuesta 401

Se renueva usando grant_type=refresh_token.

2️⃣ MCP Proxy

Endpoint:

/api/mcp/mercadolibre


Funciones:

Inyecta Authorization: Bearer

Fuerza Accept: text/event-stream

Forward SSE correctamente

Maneja refresh automático

Limpia headers conflictivos (Content-Encoding, etc.)

3️⃣ Healthcheck
GET /api/mcp/mercadolibre/health


Estado saludable esperado:

{
  "token": "present",
  "hasRefreshToken": true,
  "supabase": {
    "init": true,
    "select": true
  }
}

4️⃣ Variables de Entorno Requeridas
Supabase

NEXT_PUBLIC_SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

Mercado Libre

MELI_CLIENT_ID

MELI_CLIENT_SECRET

MELI_REDIRECT_URI

5️⃣ Diagnóstico Rápido
Verificar Health
curl -s https://mismartdash.vercel.app/api/mcp/mercadolibre/health

Verificar SSE
curl -i -H "Accept: text/event-stream" https://mismartdash.vercel.app/api/mcp/mercadolibre

6️⃣ Problemas Comunes y Solución
Problema	Causa	Solución
406 Not Acceptable	Falta Accept: text/event-stream	Proxy fuerza header
504 Gateway Timeout	SSE mal forwardeado	Stream passthrough correcto
Missing refresh_token	OAuth mal persistido	Reautorizar
Supabase false	Env mal configuradas	Revisar Vercel vars
Estado

✔ OAuth operativo
✔ Refresh automático
✔ SSE estable
✔ MCP conectado en Antigravity
✔ Healthcheck implementado