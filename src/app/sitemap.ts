import type { MetadataRoute } from "next";
import { fetchPlans, planPath } from "../lib/public-plans.ts";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const plans = await fetchPlans();
  return [
    { url: base },
    { url: `${base}/planes` },
    ...plans.map((plan) => ({ url: `${base}${planPath(plan.slug)}` })),
  ];
}
