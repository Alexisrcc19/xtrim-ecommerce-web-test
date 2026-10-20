import type { LeadInput } from "./lead-validation";

interface CreatedLead {
  id: string;
  status: "NEW";
  created_at: string;
}

export async function sendLead(input: LeadInput): Promise<CreatedLead> {
  const base = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
  ).replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${base}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error(
      "No pudimos confirmar el envío por un problema de conexión. Tus datos siguen aquí. Un reintento podría duplicar la solicitud si ya fue recibida.",
    );
  }
  if (response.status === 429) {
    const seconds = Number(response.headers.get("Retry-After"));
    const minutes = seconds > 0 ? Math.max(1, Math.ceil(seconds / 60)) : 15;
    throw new Error(
      `Has realizado varios intentos. Espera ${minutes} minutos antes de volver a enviar.`,
    );
  }
  if (response.status === 422)
    throw new Error(
      "El plan ya no está disponible. Vuelve al catálogo y elige otro plan.",
    );
  if (response.status === 409)
    throw new Error(
      "Ya existe una solicitud en curso con este teléfono. Podrás enviar otra cuando la anterior esté cerrada.",
    );
  if (response.status === 400)
    throw new Error(
      "La API rechazó los datos. Revisa el nombre, teléfono y provincia antes de reintentar.",
    );
  if (!response.ok)
    throw new Error(
      "No pudimos enviar tu solicitud. Tus datos siguen aquí; inténtalo de nuevo más tarde.",
    );
  const unconfirmed =
    "No pudimos confirmar la solicitud. Antes de reenviar, verifica si fue recibida para evitar duplicados.";
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(unconfirmed);
  }
  const lead =
    body && typeof body === "object" && "data" in body ? body.data : null;
  if (
    response.status !== 201 ||
    !lead ||
    typeof lead !== "object" ||
    !("id" in lead) ||
    typeof lead.id !== "string" ||
    !("status" in lead) ||
    lead.status !== "NEW" ||
    !("created_at" in lead) ||
    typeof lead.created_at !== "string"
  ) {
    throw new Error(unconfirmed);
  }
  return { id: lead.id, status: lead.status, created_at: lead.created_at };
}
