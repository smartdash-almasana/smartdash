import { AIActionPlan, RiskSignal } from "@/lib/domain/risk";

/**
 * CONTRATO DE ENTRADA PARA LA IA
 * Representa el snapshot técnico completo proveniente de Neon.
 */
export interface AIPlanInput {
  id: string;
  clientId: string;
  globalScore: number;
  signals: RiskSignal[];
  financialContext: Record<string, any>;
  scenarioDescription: string;
  recommendationText: string;
  actionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SERVICIO DE INTELIGENCIA ARTIFICIAL (Real-ready)
 * Orquesta la llamada a OpenAI para generar planes de mitigación tácticos.
 */
export async function generateMitigationPlan(input: AIPlanInput): Promise<AIActionPlan> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("ACTION_ERROR: OPENAI_API_KEY no configurada en el entorno.");
    throw new Error("Servicio de IA no disponible: Falta configuración de API.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // O "gpt-4-turbo-preview" para JSON Mode estable
        messages: [
          {
            role: "system",
            content: `Eres un analista de riesgos Senior especializado en SmartDash. 
            Tu tarea es analizar snapshots técnicos de riesgo y devolver planes de mitigación en formato JSON estricto.
            
            CONTRATO JSON OBLIGATORIO:
            {
              "rationale": "Breve explicación del por qué del riesgo actual",
              "immediate_steps": ["paso 1", "paso 2", "paso 3"],
              "expected_impact": "Descripción del resultado tras aplicar los pasos",
              "risk_reduction_estimate": 0-100 (número),
              "suggested_message": "Texto sugerido para enviar por WhatsApp al cliente"
            }`
          },
          {
            role: "user",
            content: `Analiza el siguiente snapshot de riesgo para el cliente ${input.clientId}:
            - Score Global: ${input.globalScore}/100
            - Descripción de Escenario: ${input.scenarioDescription}
            - Señales Técnicas: ${JSON.stringify(input.signals)}
            - Contexto Financiero: ${JSON.stringify(input.financialContext)}
            - Recomendación Base: ${input.recommendationText}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Baja temperatura para asegurar consistencia técnica
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ACTION_ERROR (OpenAI API):", errorData);
      throw new Error(`OpenAI API falló con status ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    // Mapeo 1:1 al contrato del dominio AIActionPlan
    return {
      rationale: content.rationale,
      immediate_steps: content.immediate_steps,
      expected_impact: content.expected_impact,
      risk_reduction_estimate: Number(content.risk_reduction_estimate),
      suggested_message: content.suggested_message,
    };

  } catch (error) {
    console.error("ACTION_ERROR (AI_SERVICE):", error);
    // Re-lanzamos para que la capa de transporte (actions.ts) lo maneje
    throw error;
  }
}