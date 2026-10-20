import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const SESSION_SECONDS = 8 * 60 * 60;
export const passwordHashPattern = /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/;

export function hashPassword(
  password: string,
  salt = randomBytes(16).toString("hex"),
): string {
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function equalText(left: string, right: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(left).digest(),
    createHash("sha256").update(right).digest(),
  );
}
export function verifyPassword(password: string, hash: string): boolean {
  if (!passwordHashPattern.test(hash) || password.length > 256) return false;
  const [, salt, expected] = hash.split(":");
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(expected, "hex"),
  );
}
export function credentialVersion(
  username: string,
  passwordHash: string,
): string {
  return createHash("sha256")
    .update(JSON.stringify([username, passwordHash]))
    .digest("hex");
}
export function signSession(
  username: string,
  version: string,
  secret: string,
  now = Date.now(),
): string {
  if (secret.length < 32)
    throw new Error("Se requiere un secreto de sesión seguro");
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      version,
      exp: now + SESSION_SECONDS * 1000,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}
export function verifySession(
  value: string | undefined,
  username: string,
  version: string,
  secret: string,
  now = Date.now(),
): boolean {
  if (!value || value.length > 2048 || secret.length < 32) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  if (!equalText(signature, expected)) return false;
  try {
    const session: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      !session ||
      typeof session !== "object" ||
      !("sub" in session) ||
      !("version" in session) ||
      !("exp" in session)
    )
      return false;
    return (
      session.sub === username &&
      session.version === version &&
      typeof session.exp === "number" &&
      Number.isFinite(session.exp) &&
      session.exp > now
    );
  } catch {
    return false;
  }
}
