import { randomBytes, scryptSync } from "node:crypto";
let password = "";
for await (const chunk of process.stdin) password += chunk.toString();
password = password.replace(/\r?\n$/, "");
if (password.length < 12 || password.length > 256) {
  console.error("Usa una contraseña de entre 12 y 256 caracteres por stdin.");
  process.exitCode = 1;
} else {
  const salt = randomBytes(16).toString("hex");
  console.log(
    `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`,
  );
}
