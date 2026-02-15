import { mapMcpToolsToOpenAITools } from "./mcp-to-openai.js";
import { callOpenAIWithTools } from "../providers/openai.responses.js";

function parseToolArgs(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (value && typeof value === "object") return value;
  return {};
}

function extractToolCall(response) {
  const output = Array.isArray(response?.output) ? response.output : [];
  for (const item of output) {
    if (item?.type === "tool_call" || item?.type === "function_call") {
      return {
        name: item.name,
        callId: item.call_id,
        arguments: parseToolArgs(item.arguments),
      };
    }
  }
  return null;
}

function extractFinalText(response) {
  if (typeof response?.output_text === "string" && response.output_text) {
    return response.output_text;
  }
  const output = Array.isArray(response?.output) ? response.output : [];
  for (const item of output) {
    if (item?.type === "message" && Array.isArray(item?.content)) {
      const text = item.content
        .filter((p) => p?.type === "output_text" || p?.type === "text")
        .map((p) => p?.text)
        .filter((t) => typeof t === "string")
        .join("\n");
      if (text) return text;
    }
  }
  return "";
}

function toStringPayload(v) {
  return typeof v === "string" ? v : JSON.stringify(v ?? {});
}

export async function runOpenAIToolLoop({ model, messages, mcpClient, maxIterations = 8 }) {
  const conversation = [...(messages || [])];
  const mcpTools = await mcpClient.listTools();
  const tools = mapMcpToolsToOpenAITools(mcpTools);

  if (!tools.length) {
    throw new Error("tools array vacío");
  }

  for (let i = 0; i < maxIterations; i += 1) {
    const response = await callOpenAIWithTools({ model, messages: conversation, tools });
    const toolCall = extractToolCall(response);

    if (!toolCall) {
      return extractFinalText(response);
    }

    const toolResult = await mcpClient.execute(toolCall.name, toolCall.arguments);

    if (toolCall.callId) {
      conversation.push({
        type: "function_call_output",
        call_id: toolCall.callId,
        output: toStringPayload(toolResult),
      });
    } else {
      conversation.push({
        role: "tool",
        name: toolCall.name,
        content: toStringPayload(toolResult),
      });
    }
  }

  throw new Error("tool_call loop exceeded max iterations");
}
