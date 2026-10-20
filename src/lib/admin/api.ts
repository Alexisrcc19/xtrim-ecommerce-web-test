import "server-only";
import { requireAdmin } from "./auth";
import type { Lead, LeadList, Metrics } from "./types";
import type { Plan } from "../plans";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  await requireAdmin();
  const base = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api/v1"
  ).replace(/\/$/, "");
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) throw new Error("Acceso a la API no configurado.");
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Inténtalo de nuevo.");
  }
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: "La API rechazó los datos. Revisa los campos.",
      401: "La credencial de la API no es válida. Revisa la configuración del servidor.",
      404: "El lead ya no existe.",
      409: "Ya existe una solicitud en Nuevo o En gestión con este teléfono. Revisa el teléfono o el estado antes de guardar.",
      422: "El plan no está disponible.",
      429: "Se alcanzó el límite de solicitudes. Inténtalo más tarde.",
      503: "La API administrativa no está configurada o disponible.",
    };
    throw new Error(
      messages[response.status] || "La API no pudo completar la operación.",
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const listLeads = (query: URLSearchParams) =>
  request<LeadList>(`/leads?${query}`);
export const getLead = (id: string) =>
  request<{ data: Lead }>(`/leads/${encodeURIComponent(id)}`);
export const getMetrics = () =>
  request<{ data: Metrics }>("/dashboard/metrics");
export const adminPlans = () => request<{ data: Plan[] }>("/plans");
export const createLead = (body: object) =>
  request("/leads", { method: "POST", body: JSON.stringify(body) });
export const editLead = (id: string, body: object) =>
  request(`/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
export const changeLeadStatus = (id: string, body: object) =>
  request(`/leads/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
export const deleteLead = (id: string) =>
  request(`/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
