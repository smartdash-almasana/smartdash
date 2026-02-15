import { AIActionPlan } from "@/lib/domain/risk";
import { createHttpMcpClient } from "@/lib/bridge/http-mcp-client";
import { runOpenAIToolLoop } from "@/lib/bridge/openai-tool-loop";

interface AIPlanInput {
  id: string;
  clientId: string;
  globalScore: number;
  signals: unknown[];
  financialContext: Record<string, unknown>;
  scenarioDescription: string;
  recommendationText: string;
}

/**
 * Plan de contingencia cuando el servicio de IA no está disponible
 */
const OFFLINE_PLAN: AIActionPlan = {
  rationale:
    "El servicio de análisis inteligente no está disponible. El plan se basa en reglas estáticas de gestión de riesgo.",
  immediateSteps: [
    "Revisar manualmente las señales críticas detectadas.",
    "Validar el contexto financiero del cliente.",
    "Controlar alertas y eventos recientes.",
  ],
  expectedImpact: "Mitigación manual temporal del riesgo.",
  riskReductionEstimate: 5,
  suggestedMessage:
    "Se recomienda una revisión manual de los riesgos detectados.",
};

export async function generateMitigationPlan(
  input: AIPlanInput,
): Promise<AIActionPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const supabaseMcpUrl = process.env.SUPABASE_MCP_URL;

  if (!apiKey) {
    return OFFLINE_PLAN;
  }

  try {
    if (model.startsWith("gpt-5") && supabaseMcpUrl) {
      const mcpClient = createHttpMcpClient(supabaseMcpUrl);
      const finalText = await runOpenAIToolLoop({
        model,
        mcpClient,
        messages: [
          {
            role: "system",
            content: `Eres Chief Risk Officer.
Devuelve EXCLUSIVAMENTE un JSON válido con la siguiente estructura exacta:

{
  "rationale": "Explicación breve del riesgo detectado",
  "immediateSteps": ["Paso 1", "Paso 2", "Paso 3"],
  "expectedImpact": "Impacto esperado",
  "riskReductionEstimate": número entre 1 y 100,
  "suggestedMessage": "Mensaje breve para el cliente"
}

Si necesitas datos, usa herramientas MCP disponibles.`,
          },
          {
            role: "user",
            content: JSON.stringify({
              globalScore: input.globalScore,
              signals: input.signals,
              financialContext: input.financialContext,
              scenarioDescription: input.scenarioDescription,
              recommendationText: input.recommendationText,
            }),
          },
        ],
      });

      if (!finalText) {
        return OFFLINE_PLAN;
      }

      return JSON.parse(finalText) as AIActionPlan;
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: `Eres Chief Risk Officer.
Devuelve EXCLUSIVAMENTE un JSON válido con la siguiente estructura exacta:

{
  "rationale": "Explicación breve del riesgo detectado",
  "immediateSteps": ["Paso 1", "Paso 2", "Paso 3"],
  "expectedImpact": "Impacto esperado",
  "riskReductionEstimate": número entre 1 y 100,
  "suggestedMessage": "Mensaje breve para el cliente"
}`,
            },
            {
              role: "user",
              content: JSON.stringify({
                globalScore: input.globalScore,
                signals: input.signals,
                financialContext: input.financialContext,
                scenarioDescription: input.scenarioDescription,
                recommendationText: input.recommendationText,
              }),
            },
          ],
        }),
        signal: AbortSignal.timeout(6000),
      },
    );

    if (!response.ok) {
      return OFFLINE_PLAN;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return OFFLINE_PLAN;
    }

    return JSON.parse(content) as AIActionPlan;
  } catch {
    return OFFLINE_PLAN;
  }
}

