import crypto from "crypto";

export function verifyWhatsAppSignature({ appSecret, rawBody, signatureHeader }) {
  if (!appSecret) return false;
  if (!rawBody || !signatureHeader) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signatureHeader);

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
