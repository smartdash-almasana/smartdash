# Runbook: Mercado Libre MCP (Modo Manual)

Este documento describe cómo operar el servidor MCP de Mercado Libre de forma desacoplada y sin flujos automáticos de OAuth.

**Objetivo:** Conectar Antigravity al MCP de Mercado Libre usando un token `Authorization: Bearer` válido obtenido manualmente, a través de un proxy local (`mcp-proxy`).

---

## Prerrequisitos

*   Tener instalado `mcp-proxy` (Python) en el entorno.
*   Tener un `access_token` válido de Mercado Libre (obtenido vía App o API OAuth).

---

## 1. Iniciar el Proxy Local

Ejecuta el siguiente comando en PowerShell (reemplazando `<ACCESS_TOKEN>` por tu token real):

```powershell
mcp-proxy https://mcp.mercadolibre.com/mcp --transport streamablehttp -H Authorization "Bearer <ACCESS_TOKEN>" --port 8000 --host 127.0.0.1
```

**Nota:**
*   El puerto debe ser **8000**.
*   El host debe ser **127.0.0.1**.
*   El header debe tener el formato exacto `"Bearer TOKEN"`.
*   Mantén esta ventana de terminal abierta mientras trabajes.

---

## 2. Verificar Conexión en Antigravity

Una vez que el proxy esté corriendo y esperando conexiones:

1.  Reinicia Antigravity (si no lo has hecho).
2.  Verifica que el servidor `mercadolibre-mcp-server` esté visible.
3.  Ejecuta la siguiente validación para confirmar acceso a la documentación:

```
search_documentation query="orders" language="es_ar"
```

---

## 3. Diagnóstico de Errores Comunes

### Error 401 Unauthorized
Si el proxy muestra en su salida:
`httpx.HTTPStatusError: Client error '401 Unauthorized'`

**Causa:** El token proporcionado es inválido, ha expirado o ha sido revocado.
**Solución:** Obtén un nuevo token fresco y reinicia el comando del proxy.

### Error de Conexión (EOF)
Si Antigravity muestra errores de conexión o EOF:
**Causa:** El proxy no está corriendo o se cerró inesperadamente.
**Solución:** Verifica la terminal del proxy. Si se cerró, revisa el error y vuelve a iniciarlo.

### Puerto Ocupado
Si `mcp-proxy` falla al iniciar con error de puerto:
**Solución:** Libera el puerto 8000:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```
