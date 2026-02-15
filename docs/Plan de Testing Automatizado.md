Plan de Testing Automatizado
Mercado Libre OAuth + MCP Proxy (Smartdash)

Este plan cubre tests unitarios, integración, smoke/E2E, y monitoreo continuo para evitar regresiones como: missing refresh_token, 406 SSE, 504, compresión br, loops de refresh, etc.

1) Objetivos de calidad

Debe garantizar:

OAuth code→token persiste access_token + refresh_token.

Refresh funciona (retry único) y no produce 502 por errores internos.

Proxy MCP:

Fuerza/respeta Accept: text/event-stream

No rompe streaming por headers de compresión

Responde /health consistentemente

Fallas degradan bien:

missing_refresh_token → 401 controlado

invalid_grant → “reauthorize required”

sin loops

2) Pirámide de tests
A) Unit tests (rápidos, en CI)

Runner: Vitest o Jest (lo que ya use el repo)

Archivos objetivo

lib/meli/token.ts

app/api/mcp/mercadolibre/route.ts (helpers)

Casos mínimos

Env resolution

usa SUPABASE_URL ?? NEXT_PUBLIC_SUPABASE_URL

usa MELI_CLIENT_ID ?? MELI_APP_ID

isExpired

token expirado vs válido

refreshToken()

falta refresh_token → retorna error manejado (no throw)

upstream !ok → retorna error con status y preview truncado

getActiveToken()

sin filas → “missing”

con fila pero refresh_token null → “missing_refresh_token”

Retry on 401 (proxy)

401 upstream → refresh → retry 200

401 upstream → refresh falla → 401 (no 502)

Mocking recomendado:

global.fetch

supabaseAdmin (stub)

B) Integration tests (con Supabase local/preview)

Herramientas:

Supabase local (supabase start) o proyecto “staging”

dotenv para cargar env de test

Casos

Token persistence

Insertar fila en meli_oauth_tokens (con refresh_token)

getActiveToken devuelve present

Refresh updates DB

Simular refresh exitoso

Verificar update de access_token y expires_at

Notas

No usar secretos reales.

Usar tokens dummy + mocks de fetch al endpoint /oauth/token.

C) Contract tests (MCP / SSE)

Objetivo: detectar cambios de protocolo/headers.

Checks automáticos contra preview/prod

GET /api/mcp/mercadolibre sin Accept

esperado: no romper (ideal: 200/405) pero no 406 con error fatal al cliente (si lo decidiste así, fijar expected)

GET /api/mcp/mercadolibre con Accept: text/event-stream

esperado: Content-Type: text/event-stream

Headers prohibidos en response:

NO Content-Encoding: br

NO Content-Length fijo si es stream

D) Smoke / E2E (post-deploy, automatizado)

Ejecutar en GitHub Actions después de deploy (o manual con script).

Smoke mínimo (3 comandos)

Health:

curl -fsS https://mismartdash.vercel.app/api/mcp/mercadolibre/health


SSE headers (timeout corto):

curl -i -H "Accept: text/event-stream" --max-time 5 https://mismartdash.vercel.app/api/mcp/mercadolibre | head -n 30


MCP tools/list (si soportás POST JSON-RPC)
Si NO lo soportás, omitilo y dejá solo health + SSE.

curl -i -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  https://mismartdash.vercel.app/api/mcp/mercadolibre


Criterios de fail

health ok=false

token present pero hasRefreshToken=false (en prod)

504 en SSE

response con Content-Encoding: br

3) Automatización CI/CD
GitHub Actions (propuesta)

Workflows:

1) test.yml (PR)

install

unit tests

lint

typecheck

2) post-deploy-smoke.yml (main)

correr smoke contra mismartdash.vercel.app

si falla, abrir issue o notificar (Slack/Discord/email)

4) Fixtures y datos de prueba
Tokens

Nunca reales.

Usar:

APP_USR_TEST_ACCESS

APP_USR_TEST_REFRESH

Simular refresh response:

{
  "access_token":"NEW_ACCESS",
  "refresh_token":"NEW_REFRESH",
  "expires_in":21600
}

5) Test de regresiones históricas (obligatorios)

Brotli / Content-Encoding

Respuesta upstream con Content-Encoding: br

Proxy debe remover header o normalizar para evitar body ilegible

Missing refresh_token

Fila activa con refresh_token null

Refresh debe responder error controlado (no 502)

SSE 406

Request sin Accept

Proxy debe forzar Accept upstream o devolver error claro

SSE 504

Test con timeout corto

Confirmar que la conexión abre y headers son correctos

6) Deliverables (qué archivo crear)

docs/testing-meli.md (este plan)

scripts/smoke-meli.ps1 (Windows)

scripts/smoke-meli.sh (Linux/mac)

__tests__/meli-token.test.ts

__tests__/mcp-proxy.test.ts

7) Prompt único al agente (para implementarlo sin loops)

Si querés que el agente lo implemente:

Implementar Plan de Testing Automatizado:
- Agregar unit tests para `lib/meli/token.ts` (casos: env fallback, missing refresh_token, refresh !ok, isExpired)
- Agregar tests de proxy para retry único ante 401 y sanitización de headers (Content-Encoding)
- Crear scripts smoke `scripts/smoke-meli.ps1` y `scripts/smoke-meli.sh` con health + SSE headers (timeout corto)
- Agregar GitHub Actions: PR -> unit tests; main -> post-deploy smoke (curl)
- No tocar UI.
Output: SUCCESS/ERROR + lista de archivos creados.