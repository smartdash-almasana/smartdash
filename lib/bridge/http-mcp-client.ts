export interface MCPClient {
  listTools(): Promise<Array<{ name: string; inputSchema?: Record<string, unknown> }>>;
  execute(name: string, args: unknown): Promise<unknown>;
}

interface JsonRpcResponse<T = any> {
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

function buildJsonRpcError(error: JsonRpcResponse["error"]): string {
  if (!error) {
    return "Unknown JSON-RPC error";
  }

  return `JSON-RPC ${error.code}: ${error.message}`;
}

export function createHttpMcpClient(endpoint: string): MCPClient {
  async function rpcCall<T = any>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    });

    const raw = await res.text();

    if (!res.ok) {
      throw new Error(`MCP HTTP error (${res.status}): ${raw}`);
    }

    const parsed = (raw ? JSON.parse(raw) : {}) as JsonRpcResponse<T>;

    if (parsed.error) {
      throw new Error(buildJsonRpcError(parsed.error));
    }

    return parsed.result as T;
  }

  return {
    async listTools() {
      const result = await rpcCall<{ tools?: Array<{ name: string; inputSchema?: Record<string, unknown> }> }>(
        "tools/list",
        {},
      );

      return result?.tools ?? [];
    },

    async execute(name: string, args: unknown) {
      const result = await rpcCall<unknown>("tools/call", {
        name,
        arguments: args ?? {},
      });

      return result;
    },
  };
}
