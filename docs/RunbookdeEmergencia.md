Runbook de Emergencia
Mercado Libre OAuth + MCP Proxy (Smartdash)

Este documento describe cómo diagnosticar y resolver rápidamente fallas críticas en la integración con Mercado Libre.

🔎 1. Diagnóstico Inicial (SIEMPRE empezar aquí)

Ejecutar:

curl -s https://mismartdash.vercel.app/api/mcp/mercadolibre/health


Interpretación rápida:

Campo	Estado esperado
supabase.init	true
supabase.select	true
token	present
hasRefreshToken	true

Si cualquiera es false, seguir la sección correspondiente abajo.

🛑 2. Token inválido / 401
Síntomas

Errores 401 en llamadas

Logs muestran invalid_grant

Health muestra hasRefreshToken: false

Acción inmediata

Reautorizar:

https://mismartdash.vercel.app/api/meli/oauth/start


Confirmar:

curl -s https://mismartdash.vercel.app/api/mcp/mercadolibre/health


Debe mostrar:

hasRefreshToken: true

🛑 3. Supabase desconectado
Síntomas

supabase.init: false

supabase.select: false

Verificar variables en Vercel

Deben existir:

NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY


Luego:

Redeploy

Reprobar health

🛑 4. 406 Not Acceptable
Síntoma
Client must accept text/event-stream

Causa

El cliente no envía:

Accept: text/event-stream

Verificación
curl -i -H "Accept: text/event-stream" https://mismartdash.vercel.app/api/mcp/mercadolibre


Si responde 200 → OK.

🛑 5. 504 Gateway Timeout (SSE)
Síntoma
504 Gateway Time-out

Causa

SSE mal forwardeado o timeout serverless.

Acción

Verificar que el proxy:

Remueve Content-Encoding

No bufferiza stream

Usa passthrough ReadableStream

Reintentar con:

curl -i -H "Accept: text/event-stream" --max-time 5 https://mismartdash.vercel.app/api/mcp/mercadolibre

🛑 6. Missing refresh_token
Síntoma
Missing 'refresh_token' in active token data

Causa

OAuth no persistió refresh_token.

Acción

Reautorizar inmediatamente:

/api/meli/oauth/start

🛑 7. MCP no conecta en Antigravity
Verificar:

Manage MCP Servers → status

Revisar error exacto

Probar manualmente:

curl -i https://mismartdash.vercel.app/api/mcp/mercadolibre


Si devuelve:

406 → header Accept

504 → SSE/timeout

401 → token

🧪 8. Smoke Test Completo

Orden recomendado:

1️⃣ Health
2️⃣ OAuth reauthorization (si hace falta)
3️⃣ SSE curl test
4️⃣ Antigravity → tools/list

🧯 9. Plan B (Contingencia)

Si SSE sigue fallando en Vercel:

Migrar proxy a:

Google Cloud Run

Fly.io

Railway

Serverless tradicional puede no ser ideal para conexiones SSE prolongadas.

🔐 10. Seguridad

Nunca:

Loggear access_token

Loggear refresh_token

Exponer client_secret

Usar ANON key para admin

📊 Estado Saludable Ideal
{
  "token": "present",
  "hasRefreshToken": true,
  "supabase": {
    "init": true,
    "select": true
  }
}

🧠 Regla de Oro

Si algo falla:

Health primero.

OAuth segundo.

Headers SSE tercero.

Logs de Vercel cuarto.

No empezar tocando código sin pasar por Health.