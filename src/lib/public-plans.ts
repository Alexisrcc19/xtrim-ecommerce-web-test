import type { Plan } from "./plans";

export function apiUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
  ).replace(/\/$/, "");
}

export function planPath(slug: string) {
  return `/planes/${encodeURIComponent(slug)}`;
}

export async function fetchPlans(): Promise<Plan[]> {
  const response = await fetch(`${apiUrl()}/plans`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("No se pudo consultar el catálogo");
  const body: { data: Plan[] } = await response.json();
  return body.data.filter((plan) => plan.is_active);
}

export async function fetchPlan(slug: string): Promise<Plan | null> {
  if (slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    return null;
  const response = await fetch(
    `${apiUrl()}/plans/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo consultar el plan");
  const body: { data: Plan | null } = await response.json();
  if (!body.data?.is_active || body.data.slug !== slug) return null;
  return body.data;
}
