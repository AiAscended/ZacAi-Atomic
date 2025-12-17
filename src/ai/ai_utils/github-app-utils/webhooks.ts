/**
 * src/ai/utils/github-app/webhooks.ts
 * GitHub webhook payload verification utility.
 */

import crypto from "crypto";

/**
 * Validates webhook payload signature.
 */
export function verifyWebhookSignature(
  payloadRaw: string,
  signature: string,
  secret: string,
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payloadRaw, "utf-8");
  const calculated = `sha256=${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(
    Buffer.from(calculated),
    Buffer.from(signature),
  );
}
