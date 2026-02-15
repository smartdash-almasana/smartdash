import { mapMcpToolsToOpenAITools } from "@/lib/bridge/mcp-to-openai";
import { callOpenAIWithTools } from "@/lib/providers/openai.responses";

interface MCPClient {
  listTools(): Promise<Array<{ name: string; inputSchema?: Record<string, unknown> }>>;
  execute(name: string, args: unknown): Promise<unknown>;
}

interface RunOpenAIToolLoopArgs {
  model: string;
  messages: unknown[];
  mcpClient: MCPClient;
  maxIterations?: number;
}

function toJsonString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value ?? {});
}

function parseToolArguments(rawArgs: unknown): unknown {
  if (typeof rawArgs === "string") {
    try {
      return JSON.parse(rawArgs);
    } catch {
      return {};
    }
  }

  if (rawArgs && typeof rawArgs === "object") {
    return rawArgs;
  }

  return {};
}

function extractToolCall(response: any): { name: string; arguments: unknown; callId?: string } | null {
  const output = Array.isArray(response?.output) ? response.output : [];

  for (const item of output) {
    if (item?.type === "tool_call") {
      return {
        name: item.name,
        arguments: parseToolArguments(item.arguments),
        callId: item.call_id,
      };
    }

    if (item?.type === "function_call") {
      return {
        name: item.name,
        arguments: parseToolArguments(item.arguments),
        callId: item.call_id,
      };
    }
  }

  return null;
}

function extractFinalText(response: any): string {
  if (typeof response?.output_text === "string" && response.output_text.length > 0) {
    return response.output_text;
  }

  const output = Array.isArray(response?.output) ? response.output : [];

  for (const item of output) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      const textParts = item.content
        .filter((part: any) => part?.type === "output_text" || part?.type === "text")
        .map((part: any) => part?.text)
        .filter((part: unknown): part is string => typeof part === "string");

      if (textParts.length > 0) {
        return textParts.join("\n");
      }
    }
  }

  return "";
}

export async function runOpenAIToolLoop({
  model,
  messages,
  mcpClient,
  maxIterations = 8,
}: RunOpenAIToolLoopArgs): Promise<string> {
  const conversation: unknown[] = [...messages];
  const mcpTools = await mcpClient.listTools();
  const tools = mapMcpToolsToOpenAITools(mcpTools);

  for (let i = 0; i < maxIterations; i += 1) {
    const response = await callOpenAIWithTools({
      model,
      messages: conversation,
      tools,
    });

    const toolCall = extractToolCall(response);

    if (!toolCall) {
      return extractFinalText(response);
    }

    const toolResult = await mcpClient.execute(toolCall.name, toolCall.arguments);

    if (toolCall.callId) {
      conversation.push({
        type: "function_call_output",
        call_id: toolCall.callId,
        output: toJsonString(toolResult),
      });
    } else {
      conversation.push({
        role: "tool",
        name: toolCall.name,
        content: toJsonString(toolResult),
      });
    }
  }

  throw new Error("OpenAI tool loop reached max iterations without final output");
}
