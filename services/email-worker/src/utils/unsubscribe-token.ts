import crypto from "node:crypto";

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function buildUnsubscribeToken(input: {
  userId: number;
  email: string;
  secret: string;
  expiresInSeconds?: number;
}) {
  const payload = {
    uid: input.userId,
    em: input.email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + (input.expiresInSeconds ?? 60 * 60 * 24 * 30)
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encoded, input.secret);
  return `${encoded}.${signature}`;
}
