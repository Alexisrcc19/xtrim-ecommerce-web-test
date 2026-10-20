import Link from "next/link";
import { getPlans } from "@/lib/plans";
import { PlanGrid } from "./plan-grid";

export async function PlanCatalog({ limit }: { limit?: number }) {
  let plans;
  try {
    plans = await getPlans();
  } catch (error) {
    if (!limit) throw error;
    return (
      <div className="notice" role="status">
        No pudimos cargar los planes.{" "}
        <Link href="/planes">Volver a consultar el catálogo</Link>.
      </div>
    );
  }
  return <PlanGrid plans={plans} limit={limit} />;
}
