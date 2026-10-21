import "server-only";
import { cache } from "react";
import { fetchPlan, fetchPlans } from "./public-plans";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  speed_mbps: number;
  monthly_price: string;
  is_active: boolean;
}

export const getPlans = cache(fetchPlans);
export const getPlan = cache(fetchPlan);
export { apiUrl } from "./public-plans";
