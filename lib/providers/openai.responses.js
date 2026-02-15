export async function callOpenAIWithTools({ model, messages, tools }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: messages,
      tools,
      tool_choice: "auto",
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI Responses API error (${response.status}): ${raw}`);
  }

  return raw ? JSON.parse(raw) : {};
}
