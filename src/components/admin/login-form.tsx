"use client";
import { useActionState, useState } from "react";
import { login } from "@/app/admin/auth-actions";
export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, {});
  const [username, setUsername] = useState("");
  return (
    <form action={action} className="crm-login-form" aria-busy={pending}>
      {!configured && (
        <p className="form-error" role="alert">
          El acceso administrativo no está configurado. Revisa las variables
          privadas del servidor indicadas en el README.
        </p>
      )}
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <label htmlFor="username">Usuario</label>
      <input
        id="username"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
        maxLength={100}
        disabled={!configured || pending}
      />
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={256}
        disabled={!configured || pending}
      />
      <button
        className="button"
        disabled={!configured || pending}
        type="submit"
      >
        {pending ? "Verificando acceso…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
