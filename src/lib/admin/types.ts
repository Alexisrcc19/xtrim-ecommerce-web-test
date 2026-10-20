import type { LeadInput } from "../lead-validation";
export const statuses = ["NEW", "IN_PROGRESS", "CLOSED"] as const;
export type LeadStatus = (typeof statuses)[number];
export const statusLabels: Record<LeadStatus, string> = {
  NEW: "Nuevo",
  IN_PROGRESS: "En gestión",
  CLOSED: "Cerrado",
};
export interface Lead extends LeadInput {
  id: string;
  status: LeadStatus;
  outcome: "WON" | "LOST" | null;
  sale_amount: string | null;
  created_at: string;
  updated_at: string;
}
export interface LeadList {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
export interface Metrics {
  total_leads: number;
  leads_by_status: Record<LeadStatus, number>;
  won_sales: number;
  monthly_sales_usd: string;
  currency: "USD";
}
export interface ActionResult {
  ok?: boolean;
  error?: string;
}
export type StatusChange =
  | { status: "IN_PROGRESS" }
  | { status: "CLOSED"; outcome: "LOST" }
  | { status: "CLOSED"; outcome: "WON"; sale_amount: string };
