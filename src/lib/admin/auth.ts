import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  credentialVersion,
  passwordHashPattern,
  SESSION_SECONDS,
  signSession,
  verifySession,
} from "./session-crypto";

export const sessionCookie =
  process.env.NODE_ENV === "production" ? "__Host-xtrim-admin" : "xtrim-admin";
export function authConfig() {
  const username = process.env.ADMIN_USERNAME || "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  const apiToken = process.env.ADMIN_API_TOKEN || "";
  if (
    username.length < 3 ||
    username.length > 100 ||
    !passwordHashPattern.test(passwordHash) ||
    secret.length < 32 ||
    apiToken.length < 32 ||
    apiToken.length > 512 ||
    /\s/.test(apiToken)
  )
    return null;
  return {
    username,
    passwordHash,
    secret,
    version: credentialVersion(username, passwordHash),
  };
}
export const currentAdminSession = cache(async () => {
  const config = authConfig();
  if (!config) return null;
  const value = (await cookies()).get(sessionCookie)?.value;
  if (!value || !verifySession(value, config.username, config.version, config.secret))
    return null;
  // The signature, payload and expiry have already been verified above.
  const { exp } = JSON.parse(
    Buffer.from(value.split(".")[0], "base64url").toString("utf8"),
  ) as { exp: number };
  return { username: config.username, expiresAt: exp };
});
export const currentAdmin = cache(
  async (): Promise<string | null> =>
    (await currentAdminSession())?.username ?? null,
);
export async function requireAdmin(): Promise<string> {
  const username = await currentAdmin();
  if (!username) redirect("/admin/login");
  return username;
}
export async function assertActionOrigin() {
  const origin = (await headers()).get("origin");
  const expected = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ).origin;
  if (origin !== expected) throw new Error("Solicitud no permitida");
}
export async function createSession() {
  const config = authConfig();
  if (!config) throw new Error("Acceso administrativo no configurado");
  (await cookies()).set(
    sessionCookie,
    signSession(config.username, config.version, config.secret),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_SECONDS,
    },
  );
}
export async function clearSession() {
  (await cookies()).set(sessionCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
