const REQUIRED_BY_FEATURE = {
  openai: ["OPENAI_API_KEY"],
  exa: ["EXA_API_KEY"],
  telegram: ["TELEGRAM_BOT_TOKEN"],
  telegramWebhook: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_WEBHOOK_SECRET"],
};

const TELEGRAM_MODES = new Set(["disabled", "polling", "webhook"]);

export function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

export function getOpenAIModel() {
  return getEnv("OPENAI_MODEL", "gpt-4o-mini");
}

export function getTelegramMode() {
  const mode = getEnv("TELEGRAM_MODE", "disabled").trim().toLowerCase();
  if (!TELEGRAM_MODES.has(mode)) {
    throw new Error("TELEGRAM_MODE must be one of: disabled, polling, webhook");
  }
  return mode;
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
    telegram: hasFeatureEnv("telegram") && getTelegramMode() !== "disabled",
    telegramMode: getTelegramMode(),
    openai: hasFeatureEnv("openai"),
    exa: hasFeatureEnv("exa"),
    demoMode: getEnv("DEMO_MODE", "false") === "true",
  };
}
