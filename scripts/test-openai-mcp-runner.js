import "dotenv/config";
import { runOpenAIToolLoop } from "../lib/bridge/openai-tool-loop.js";
import { createMcpClient } from "../lib/mcp/client.js";

async function main() {
  const mcpClient = await createMcpClient();

  try {
    const result = await runOpenAIToolLoop({
      model: "gpt-5.2",
      messages: [
        {
          role: "user",
          content: "EJECUTA VIA SUPABASE MCP: SELECT 1 as ok;"
        }
      ],
      mcpClient
    });

    console.log("FINAL_RESULT:");
    console.log(result);
  } finally {
    if (typeof mcpClient.close === "function") {
      await mcpClient.close();
    }
  }
}

main().catch(err => {
  console.error("ERROR:");
  console.error(err);
  process.exit(1);
});
