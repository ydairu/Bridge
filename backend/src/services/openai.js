export async function openAIChat({ apiKey, model, messages, tools = [], toolChoice = "auto" }) {
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: toolChoice,
      temperature: 0.2,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || response.statusText;
    throw new Error(`OpenAI chat failed: ${detail}`);
  }

  return data;
}

export async function openAIJson({ apiKey, model, instructions, input }) {
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || response.statusText;
    throw new Error(`OpenAI JSON call failed: ${detail}`);
  }

  const content = data.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`OpenAI returned invalid JSON: ${error.message}`);
  }
}

export function parseToolArguments(rawArguments) {
  if (!rawArguments) return {};
  if (typeof rawArguments === "object") return rawArguments;
  try {
    return JSON.parse(rawArguments);
  } catch {
    return {};
  }
}
