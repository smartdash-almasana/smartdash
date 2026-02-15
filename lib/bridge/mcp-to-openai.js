export function mapMcpToolsToOpenAITools(mcpTools) {
  return (mcpTools || []).map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      parameters: tool.inputSchema || { type: "object", properties: {} },
    },
  }));
}
