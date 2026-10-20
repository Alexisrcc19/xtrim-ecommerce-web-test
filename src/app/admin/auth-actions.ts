"use server";
import { redirect } from "next/navigation";
import {
  assertActionOrigin,
  authConfig,
  clearSession,
  createSession,
} from "@/lib/admin/auth";
import { equalText, verifyPassword } from "@/lib/admin/session-crypto";

let failures = 0;
let windowEnd = 0;
export async function login(
  _previous: { error?: string },
  data: FormData,
): Promise<{ error?: string }> {
  await assertActionOrigin();
  const config = authConfig();
  if (!config)
    return {
      error: "El acceso administrativo no está configurado en el servidor.",
    };
  const now = Date.now();
  if (now >= windowEnd) {
    failures = 0;
    windowEnd = now + 15 * 60 * 1000;
  }
  if (failures >= 5)
    return {
      error: "Demasiados intentos. Espera 15 minutos para volver a intentar.",
    };
  const username = String(data.get("username") || "");
  const password = String(data.get("password") || "");
  const passwordValid = verifyPassword(password, config.passwordHash);
  if (!equalText(username, config.username) || !passwordValid) {
    failures++;
    return { error: "Usuario o contraseña incorrectos." };
  }
  failures = 0;
  await createSession();
  redirect("/admin");
}
export async function logout() {
  await assertActionOrigin();
  await clearSession();
  redirect("/admin/login");
}
