import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  credentialVersion,
  signSession,
  verifySession,
  SESSION_SECONDS,
} from "../src/lib/admin/session-crypto.ts";
const password = "contraseña ficticia para pruebas";
const hash = hashPassword(password);
const username = "test-admin";
const version = credentialVersion(username, hash);
const secret = "secreto-de-pruebas-no-utilizar-en-produccion-123";
const now = 100000000;

test("verifica hashes de contraseña sin aceptar credenciales distintas ni formatos inválidos", () => {
  assert.ok(verifyPassword(password, hash));
  assert.equal(verifyPassword("incorrecta", hash), false);
  assert.equal(verifyPassword(password, "invalid"), false);
  assert.equal(verifyPassword("a".repeat(257), hash), false);
});
test("sesión válida, con caducidad, ligada a las credenciales actuales", () => {
  const cookie = signSession(username, version, secret, now);
  assert.ok(verifySession(cookie, username, version, secret, now));
  assert.equal(
    verifySession(
      cookie,
      username,
      version,
      secret,
      now + SESSION_SECONDS * 1000,
    ),
    false,
  );
  assert.equal(
    verifySession(cookie, "otro-admin", version, secret, now),
    false,
  );
  assert.equal(
    verifySession(
      cookie,
      username,
      credentialVersion(username, "rotated"),
      secret,
      now,
    ),
    false,
  );
});
test("rechaza cookies ausentes, alteradas y firmadas con otro secreto", () => {
  const cookie = signSession(username, version, secret, now);
  assert.equal(verifySession(undefined, username, version, secret, now), false);
  assert.equal(
    verifySession(cookie + "x", username, version, secret, now),
    false,
  );
  assert.equal(
    verifySession(
      cookie,
      username,
      version,
      "otro-secreto-de-mas-de-32-caracteres",
      now,
    ),
    false,
  );
  const [payload, signature] = cookie.split(".");
  const value = JSON.parse(Buffer.from(payload, "base64url"));
  value.exp += 1000000;
  assert.equal(
    verifySession(
      Buffer.from(JSON.stringify(value)).toString("base64url") +
        "." +
        signature,
      username,
      version,
      secret,
      now,
    ),
    false,
  );
  assert.throws(() => signSession(username, version, "short", now));
  assert.equal(
    verifySession("x".repeat(3000), username, version, secret, now),
    false,
  );
});
