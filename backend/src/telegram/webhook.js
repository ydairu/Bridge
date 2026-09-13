import crypto from "node:crypto";
import express from "express";

import { extractTelegramInbound } from "./client.js";
import { handleTelegramUpdate } from "./handler.js";

const WEBHOOK_PATH = "/api/telegram/webhook";

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function isValidWebhookSecret(secret) {
  return typeof secret === "string" && /^[A-Za-z0-9_-]{32,256}$/.test(secret);
}

export function createTelegramSecretMiddleware(secret) {
  if (!isValidWebhookSecret(secret)) {
    throw new Error("TELEGRAM_WEBHOOK_SECRET must be 32-256 letters, numbers, underscores, or hyphens");
  }

  const expected = Buffer.from(secret);
  return (req, res, next) => {
    const supplied = Buffer.from(req.get("X-Telegram-Bot-Api-Secret-Token") || "");
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return next();
  };
}

export function createTelegramWebhookHandler({
  bridgeService,
  openAIConfig,
  exaApiKey,
  token,
  logger = console,
  perMinute = positiveInteger(process.env.TELEGRAM_RATE_LIMIT_PER_MINUTE, 10),
  perDay = positiveInteger(process.env.TELEGRAM_RATE_LIMIT_PER_DAY, 100),
  maxConcurrent = positiveInteger(process.env.TELEGRAM_MAX_CONCURRENT, 3),
}) {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required in webhook mode");

  let activeRequests = 0;

  return async (req, res) => {
    const update = req.body;
    if (!Number.isSafeInteger(update?.update_id) || update.update_id < 0) {
      // A malformed authenticated update is permanent; acknowledge it so it is not retried forever.
      return res.status(200).json({ ok: true, ignored: true });
    }

    const inboundMessage = extractTelegramInbound(update);
    if (!inboundMessage) return res.status(200).json({ ok: true, ignored: true });

    let withinDurableQuota;
    try {
      withinDurableQuota = await bridgeService.consumeTelegramQuota({
        externalId: inboundMessage.from,
        updateId: inboundMessage.id,
        perMinute,
        perDay,
      });
    } catch (error) {
      logger.error?.("[telegram] quota check failed:", error.message);
      return res.status(500).json({ error: "Temporary processing failure" });
    }
    if (!withinDurableQuota) {
      logger.warn?.("[telegram] durable quota exceeded", { updateId: update.update_id });
      return res.status(200).json({ ok: true, rateLimited: true });
    }

    if (activeRequests >= maxConcurrent) {
      logger.warn?.("[telegram] update deferred at concurrency limit", { updateId: update.update_id });
      res.set("Retry-After", "2");
      return res.status(503).json({ error: "Temporarily busy" });
    }

    activeRequests += 1;
    try {
      await handleTelegramUpdate({
        update,
        inboundMessage,
        bridgeService,
        openAIConfig,
        exaApiKey,
        token,
        logger,
      });
      return res.status(200).json({ ok: true });
    } catch (error) {
      logger.error?.("[telegram] webhook processing failed:", error.message);
      return res.status(500).json({ error: "Temporary processing failure" });
    } finally {
      activeRequests -= 1;
    }
  };
}

export function registerTelegramWebhookRoutes({ app, secret, ...handlerOptions }) {
  const verifySecret = createTelegramSecretMiddleware(secret);
  const parseJson = express.json({ limit: "64kb", type: "application/json" });
  const handler = createTelegramWebhookHandler(handlerOptions);

  app.post(WEBHOOK_PATH, verifySecret, parseJson, handler);

  // Telegram cannot fix and resend malformed JSON, so acknowledge parser failures
  // without processing them instead of creating an infinite retry loop.
  app.use(WEBHOOK_PATH, (error, _req, res, next) => {
    if (!error) return next();
    if (error.type === "entity.too.large" || error instanceof SyntaxError) {
      return res.status(200).json({ ok: true, ignored: true });
    }
    return next(error);
  });
}

export { WEBHOOK_PATH };
