import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createMcpClient() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("SUPABASE_ACCESS_TOKEN no configurado");
  }

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", accessToken],
  });

  const client = new Client({
    name: "openai-supabase-tool-loop-client",
    version: "1.0.0",
  });

  await client.connect(transport);

  return {
    async listTools() {
      const result = await client.listTools();
      return result?.tools || [];
    },
    async execute(name, args) {
      const result = await client.callTool({
        name,
        arguments: args || {},
      });

      if (result?.structuredContent) {
        return result.structuredContent;
      }

      if (Array.isArray(result?.content)) {
        return result.content;
      }

      return result;
    },
    async close() {
      await client.close();
      await transport.close();
    },
  };
}
