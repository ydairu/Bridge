const REQUIRED_BY_FEATURE = {
  whatsapp: [
    "WHATSAPP_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_VERIFY_TOKEN",
    "WHATSAPP_APP_SECRET",
  ],
  openai: ["OPENAI_API_KEY"],
  exa: ["EXA_API_KEY"],
};

export function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

export function getOpenAIModel() {
  return getEnv("OPENAI_MODEL", "gpt-4o-mini");
}

export function hasFeatureEnv(feature) {
  return (REQUIRED_BY_FEATURE[feature] || []).every((name) => Boolean(process.env[name]));
}

export function assertFeatureEnv(feature) {
  const missing = (REQUIRED_BY_FEATURE[feature] || []).filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing ${feature} environment variables: ${missing.join(", ")}`);
  }
}

export function getPublicFeatureStatus() {
  return {
    whatsapp: hasFeatureEnv("whatsapp"),
    openai: hasFeatureEnv("openai"),
    exa: hasFeatureEnv("exa"),
    demoMode: getEnv("DEMO_MODE", "false") === "true",
  };
}
