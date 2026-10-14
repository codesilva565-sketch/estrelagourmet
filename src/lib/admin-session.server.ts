import { createHmac, timingSafeEqual } from "node:crypto";

function adminSecret(): string {
  return process.env["ADMIN_SESSION_SECRET"] ?? process.env["ADMIN_PASSWORD"] ?? "estrela123";
}

export function adminPassword(): string {
  return process.env["ADMIN_PASSWORD"] ?? "estrela123";
}

function sign(payload: string): string {
  return createHmac("sha256", adminSecret()).update(payload).digest("base64url");
}

export function createAdminToken(ttlSeconds = 60 * 60 * 12): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: "owner", exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const reference = Buffer.from(expected);
  if (provided.length !== reference.length || !timingSafeEqual(provided, reference)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
