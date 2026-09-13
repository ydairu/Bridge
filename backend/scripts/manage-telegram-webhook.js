import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { deleteWebhook, getWebhookInfo, setWebhook } from "../src/telegram/client.js";
import { isValidWebhookSecret, WEBHOOK_PATH } from "../src/telegram/webhook.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

const action = process.argv[2] || "status";
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");

if (action === "set") {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const configuredUrl = process.env.TELEGRAM_WEBHOOK_URL;
  if (!isValidWebhookSecret(secret)) {
    throw new Error("TELEGRAM_WEBHOOK_SECRET must be 32-256 letters, numbers, underscores, or hyphens");
  }
  if (!configuredUrl) throw new Error("TELEGRAM_WEBHOOK_URL is required");

  const url = new URL(configuredUrl);
  if (url.protocol !== "https:") throw new Error("TELEGRAM_WEBHOOK_URL must use HTTPS");
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("TELEGRAM_WEBHOOK_URL must not contain credentials, query parameters, or a fragment");
  }
  if (url.pathname === "/" || url.pathname === "") url.pathname = WEBHOOK_PATH;
  if (url.pathname !== WEBHOOK_PATH) {
    throw new Error(`TELEGRAM_WEBHOOK_URL path must be ${WEBHOOK_PATH}`);
  }

  await setWebhook({ token, url: url.toString(), secretToken: secret, maxConnections: 1 });
  console.log("Telegram webhook configured successfully.");
} else if (action === "status") {
  const info = await getWebhookInfo({ token });
  console.log(JSON.stringify({
    url: info.url || "",
    pendingUpdateCount: info.pending_update_count || 0,
    lastErrorDate: info.last_error_date || null,
    lastErrorMessage: info.last_error_message || null,
    maxConnections: info.max_connections || null,
    allowedUpdates: info.allowed_updates || [],
  }, null, 2));
} else if (action === "delete") {
  await deleteWebhook({ token });
  console.log("Telegram webhook removed; pending updates were preserved.");
} else {
  throw new Error("Usage: node scripts/manage-telegram-webhook.js set|status|delete");
}
