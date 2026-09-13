// Telegram long-polling worker. Reuses the Bridge orchestrator end-to-end, so the
// Telegram bot has the same capabilities as WhatsApp. No public URL is required.

import { getUpdates, deleteWebhook } from "./client.js";
import { handleTelegramUpdate } from "./handler.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Starts the polling loop. Returns { stop } to halt it. Resolves once polling has
// begun (after clearing any existing webhook so getUpdates is allowed).
export async function startTelegramPoller({ bridgeService, openAIConfig, exaApiKey, token, logger = console }) {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required to start the Telegram poller");

  await deleteWebhook({ token }); // getUpdates and webhooks are mutually exclusive
  let running = true;
  let offset = 0;

  (async function loop() {
    logger.log?.("[telegram] long-poll loop started");
    while (running) {
      try {
        const updates = await getUpdates({ token, offset, timeout: 25 });
        for (const update of updates) {
          offset = update.update_id + 1;
          await handleTelegramUpdate({ update, bridgeService, openAIConfig, exaApiKey, token, logger }).catch(
            (error) => logger.error?.("[telegram] update failed:", error.message)
          );
        }
      } catch (error) {
        logger.error?.("[telegram] poll error:", error.message);
        await sleep(2000); // back off on transient errors (network / 409 conflicts)
      }
    }
    logger.log?.("[telegram] long-poll loop stopped");
  })();

  return { stop: () => { running = false; } };
}
