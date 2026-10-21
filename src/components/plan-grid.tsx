"use client";

import Link from "next/link";
import type { Plan } from "@/lib/plans";
import { planPath } from "@/lib/public-plans";
import { price } from "@/lib/format";
import { usePlanModals } from "./plan-modals";

export function PlanGrid({ plans, limit }: { plans: Plan[]; limit?: number }) {
  const { openPlan } = usePlanModals();
  if (!plans.length)
    return (
      <div className="notice" role="status">
        Por ahora no hay planes disponibles. Vuelve a consultar más adelante.
      </div>
    );

  return (
    <>
      <div className="plans-grid">
        {(limit ? plans.slice(0, limit) : plans).map((plan, index) => (
          <article
            key={plan.id}
            className={`plan-card ${index === 1 ? "featured" : ""}`}
          >
            <div className="card-heading">
              <h3>{plan.name}</h3>
              <span aria-hidden="true">↗</span>
            </div>
            <p className="speed">
              {plan.speed_mbps}
              <span> Mbps</span>
            </p>
            <p className="plan-description">{plan.description}</p>
            <p className="price">
              {price(plan.monthly_price)}
              <span> / mes</span>
            </p>
            <p className="caption">USD · Precio de demostración</p>
            <div className="plan-facts">
              <p>✓ Solicita información sin compromiso</p>
              <p>✓ Consulta disponibilidad con un asesor</p>
            </div>
            <button
              type="button"
              className="button"
              aria-haspopup="dialog"
              onClick={(event) =>
                openPlan(plan, plans, event.currentTarget, "request")
              }
            >
              Solicitar información
            </button>
            <button
              type="button"
              className="details-link"
              aria-haspopup="dialog"
              onClick={(event) =>
                openPlan(plan, plans, event.currentTarget, "details")
              }
            >
              Vista rápida
            </button>
            <Link className="details-link" href={planPath(plan.slug)}>
              Ver detalles ↗
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
