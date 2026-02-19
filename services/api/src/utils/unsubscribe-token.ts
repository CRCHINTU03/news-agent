import crypto from "node:crypto";

type UnsubscribePayload = {
  uid: number;
  em: string;
  exp: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
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
  const payload: UnsubscribePayload = {
    uid: input.userId,
    em: input.email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + (input.expiresInSeconds ?? 60 * 60 * 24 * 30)
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encoded, input.secret);
  return `${encoded}.${signature}`;
}

export function verifyUnsubscribeToken(token: string, secret: string): UnsubscribePayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encoded, secret);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as UnsubscribePayload;
    if (!parsed.uid || !parsed.em || !parsed.exp) {
      return null;
    }

    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
