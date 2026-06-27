export async function searchExa({ apiKey, query, numResults = 5 }) {
  if (!apiKey) {
    return { results: [], skipped: true, reason: "EXA_API_KEY is not configured" };
  }

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      numResults,
      useAutoprompt: true,
      type: "auto",
      contents: {
        text: true,
        highlights: true,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.message || data?.error || response.statusText;
    throw new Error(`Exa search failed: ${detail}`);
  }

  return data;
}
