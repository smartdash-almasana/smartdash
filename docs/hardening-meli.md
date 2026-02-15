Hardening de Producción
Mercado Libre OAuth + MCP Proxy (Smartdash)

Este documento define las medidas obligatorias para operar la integración en producción de forma segura, resiliente y estable.

1️⃣ Seguridad de Credenciales
🔐 Variables de entorno (obligatorio)

Nunca usar .env.local en producción.

En Vercel deben existir:

Supabase

NEXT_PUBLIC_SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

Mercado Libre

MELI_CLIENT_ID

MELI_CLIENT_SECRET

MELI_REDIRECT_URI

🔒 Reglas críticas

❌ Nunca loggear:

access_token

refresh_token

client_secret

❌ Nunca exponer SUPABASE_SERVICE_ROLE_KEY al frontend

❌ Nunca usar ANON key para operaciones admin

✅ Tokens solo en backend

2️⃣ Protección OAuth
✅ Implementar state en autorización

Prevenir CSRF:

Generar state random

Guardar en sesión

Validar en callback

✅ Rotación de refresh_token

Al refrescar:

Persistir nuevo refresh_token si cambia

Invalidar el anterior

✅ Manejo explícito de invalid_grant

Si refresh devuelve:

invalid_grant


→ Marcar token como inválido
→ Requerir reautorización manual

Nunca entrar en loop de refresh.

3️⃣ Resiliencia del Proxy MCP
🔁 Retry Controlado

Ante 401:

Solo 1 intento de refresh

No retry infinito

🌊 SSE Estable

El proxy debe:

Forzar Accept: text/event-stream

Eliminar:

Content-Encoding

Content-Length

No bufferizar el stream

Usar passthrough directo

⏱ Timeout Seguro

Configurar:

Timeout máximo razonable en fetch upstream

AbortController para requests colgados

4️⃣ Protección de Base de Datos
🔍 Restricciones recomendadas

En meli_oauth_tokens:

refresh_token NOT NULL

Índice único por usuario

Solo una fila activa por seller

🧹 Limpieza de tokens antiguos

Programar job semanal:

Eliminar tokens revocados

Limpiar registros huérfanos

5️⃣ Observabilidad
📊 Logs estructurados

Registrar:

requestId

upstream status

refresh_start / refresh_success / refresh_fail

Nunca registrar tokens.

🚨 Alertas recomendadas

Activar alertas si:

3 refresh_fail en 5 min

504 repetidos en SSE

supabase.init false

invalid_grant detectado

6️⃣ Healthcheck Obligatorio

Endpoint:

/api/mcp/mercadolibre/health


Debe monitorearse automáticamente.

Integrar con:

UptimeRobot

Cron ping

Vercel monitoring

7️⃣ Protección contra Loop de Agentes

Cuando se use Antigravity:

Limitar iteraciones del agente

Evitar commits automáticos repetidos

Nunca permitir “auto-refactor masivo” sin revisión

8️⃣ Estrategia de Escalabilidad

Si tráfico aumenta:

Migrar proxy SSE a Cloud Run

Evitar dependencia exclusiva de Vercel serverless

Considerar rate limiting local

9️⃣ Prueba de Producción Antes de Deploy

Checklist obligatorio:

health devuelve OK

Reauthorization funciona

Refresh simulado funciona

tools/list funciona en Antigravity

SSE no devuelve 504

🔟 Plan de Contingencia

Si producción cae:

Ver health

Reautorizar

Ver logs Vercel

Desactivar MCP temporalmente si bloquea

Restaurar última versión estable

🧠 Principio Central

El sistema debe:

Fallar de forma controlada

Nunca entrar en loops

Nunca exponer secretos

Siempre poder recuperarse con reautorización manual

Estado Actual del Sistema

✔ OAuth estable
✔ Refresh automático
✔ SSE controlado
✔ Supabase protegido
✔ Healthcheck activo