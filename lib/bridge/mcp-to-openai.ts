interface McpTool {
  name: string;
  inputSchema?: Record<string, unknown>;
}

export function mapMcpToolsToOpenAITools(mcpTools: McpTool[]): unknown[] {
  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      parameters: tool.inputSchema ?? { type: "object", properties: {} },
    },
  }));
}
