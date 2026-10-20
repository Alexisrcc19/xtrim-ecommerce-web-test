import "server-only";
import { cache } from "react";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  speed_mbps: number;
  monthly_price: string;
  is_active: boolean;
}

export const getPlans = cache(async (): Promise<Plan[]> => {
  const response = await fetch(`${apiUrl()}/plans`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("No se pudo consultar el catálogo");
  const body: { data: Plan[] } = await response.json();
  return body.data;
});

export function apiUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
  ).replace(/\/$/, "");
}
