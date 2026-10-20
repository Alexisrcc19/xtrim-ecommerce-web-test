import type { LeadStatus } from "./types";

export function statusAction(status: LeadStatus) {
  if (status === "NEW") return { label: "Iniciar gestión", next: "IN_PROGRESS" } as const;
  if (status === "IN_PROGRESS") return { label: "Cerrar oportunidad", next: "CLOSED" } as const;
  return null;
}
