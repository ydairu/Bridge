import { SCAM_RUBRIC } from "../config/scamRubric.js";
import { searchExa } from "./exa.js";
import { openAIJson } from "./openai.js";

function compactEvidence(results = []) {
  return results.slice(0, 5).map((item) => ({
    title: item.title || "",
    url: item.url || "",
    text: String(item.text || item.highlights?.join(" ") || "").slice(0, 600),
  }));
}

export async function verifyEmployerOrOffer({ openAIConfig, exaApiKey, target, offerText = "" }) {
  const searchQuery = [
    target?.company || target?.employerName || target?.name || "",
    target?.website || "",
    target?.registeredId || target?.companyUEN || "",
    offerText ? "scam complaint upfront fee migrant worker" : "company employer Singapore registration reviews",
  ]
    .filter(Boolean)
    .join(" ");

  let evidence = [];
  let exaError = "";

  try {
    const exa = await searchExa({ apiKey: exaApiKey, query: searchQuery, numResults: 5 });
    evidence = compactEvidence(exa.results || []);
  } catch (error) {
    exaError = error.message;
  }

  const result = await openAIJson({
    ...openAIConfig,
    instructions: `${SCAM_RUBRIC}

You are Bridge's employment trust engine. Analyze the target and evidence. Output strict JSON only.`,
    input: {
      target,
      offerText,
      exaError,
      evidence,
      outputSchema: {
        verificationStatus: "verified | pending | unverified | flagged",
        riskLevel: "low | medium | high",
        trustScore: "number 0-100",
        feeRequired: "boolean",
        riskReasons: ["short reason"],
        verifiedSignals: ["short signal"],
        workerExplanation: "plain-language explanation for a migrant worker",
        recommendedNextStep: "what the worker should do next",
      },
    },
  });

  return {
    ...result,
    evidence,
  };
}
