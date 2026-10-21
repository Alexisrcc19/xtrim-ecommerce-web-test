"use client";

import type { Plan } from "@/lib/plans";
import { usePlanModals } from "./plan-modals";

export function PlanRequestButton({ plan }: { plan: Plan }) {
  const { openPlan } = usePlanModals();
  return (
    <button
      className="button"
      type="button"
      aria-haspopup="dialog"
      onClick={(event) =>
        openPlan(plan, [plan], event.currentTarget, "request")
      }
    >
      Solicitar información
    </button>
  );
}
