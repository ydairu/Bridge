// Installs a global.fetch mock that routes by URL to OpenAI / Exa / WhatsApp.
// Tests register handlers (FIFO) that receive the parsed request body and return
// { ok, status, data } where `data` is what response.json() resolves to.

const realFetch = global.fetch;

export function installFetchMock() {
  const calls = [];
  const handlers = { openai: [], exa: [], whatsapp: [], telegram: [], other: [] };

  function classify(url) {
    if (url.includes("api.openai.com")) return "openai";
    if (url.includes("api.exa.ai")) return "exa";
    if (url.includes("graph.facebook.com")) return "whatsapp";
    if (url.includes("api.telegram.org")) return "telegram";
    return "other";
  }

  global.fetch = async (url, options = {}) => {
    const body = options.body ? safeParse(options.body) : {};
    const kind = classify(String(url));
    calls.push({ url: String(url), kind, body, options });

    const queue = handlers[kind];
    const handler = queue.length > 0 ? queue.shift() : null;
    const result = handler ? await handler(body, { url: String(url) }) : { ok: true, status: 200, data: {} };
    const { ok = true, status = 200, statusText = "OK", data = {} } = result;

    return {
      ok,
      status,
      statusText,
      json: async () => data,
    };
  };

  return {
    calls,
    callsOfKind: (kind) => calls.filter((c) => c.kind === kind),
    onOpenAI: (fn) => handlers.openai.push(fn),
    onExa: (fn) => handlers.exa.push(fn),
    onWhatsApp: (fn) => handlers.whatsapp.push(fn),
    onTelegram: (fn) => handlers.telegram.push(fn),
    restore: () => {
      global.fetch = realFetch;
    },
  };
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

// --- Convenience response builders ---

// OpenAI chat response that asks for tool calls.
export function openAIToolCalls(toolCalls) {
  return {
    ok: true,
    data: {
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: toolCalls.map((tc, i) => ({
              id: tc.id || `call_${i}`,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.args || {}) },
            })),
          },
        },
      ],
    },
  };
}

// OpenAI chat response with plain assistant text.
export function openAIText(content) {
  return { ok: true, data: { choices: [{ message: { role: "assistant", content } }] } };
}

// OpenAI JSON-mode response (openAIJson reads choices[0].message.content as JSON).
export function openAIJsonResult(obj) {
  return { ok: true, data: { choices: [{ message: { content: JSON.stringify(obj) } }] } };
}

export function exaResults(results) {
  return { ok: true, data: { results } };
}
