import { createHttpMcpClient } from "@/lib/bridge/http-mcp-client";
import { runOpenAIToolLoop } from "@/lib/bridge/openai-tool-loop";

async function main() {
  const model = process.env.OPENAI_MODEL ?? "gpt-5.2";
  const mcpUrl = process.env.SUPABASE_MCP_URL;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }

  if (!mcpUrl) {
    throw new Error("SUPABASE_MCP_URL is required");
  }

  const mcpClient = createHttpMcpClient(mcpUrl);

  const result = await runOpenAIToolLoop({
    model,
    mcpClient,
    messages: [
      {
        role: "user",
        content: "EJECUTA VIA SUPABASE MCP:\n SELECT 1 as ok;",
      },
    ],
  });

  console.log(result);
}

main().catch((error) => {
  console.error("[test-openai-mcp] FAILURE", error);
  process.exit(1);
});
