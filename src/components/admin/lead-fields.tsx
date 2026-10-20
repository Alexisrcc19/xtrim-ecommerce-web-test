"use client";
import { useId, useState } from "react";
import { provinces } from "@/lib/lead-validation";
import { statusAction } from "@/lib/admin/workflow";
import type { Lead } from "@/lib/admin/types";
import type { Plan } from "@/lib/plans";
import { PhoneInput } from "@/components/phone-input";

export function LeadFields({
  lead,
  plans,
}: {
  lead: Lead | null;
  plans: Plan[];
}) {
  const id = useId();
  return (
    <>
      <label htmlFor={`${id}-name`}>Nombre completo</label>
      <input
        id={`${id}-name`}
        name="full_name"
        autoComplete="name"
        defaultValue={lead?.full_name || ""}
        required
        minLength={2}
        maxLength={150}
      />
      <label htmlFor={`${id}-phone`}>Teléfono</label>
      <PhoneInput
        id={`${id}-phone`}
        name="phone"
        autoComplete="tel"
        defaultValue={lead?.phone || ""}
        required
      />
      <label htmlFor={`${id}-province`}>Provincia</label>
      <select
        id={`${id}-province`}
        name="province"
        defaultValue={lead?.province || ""}
        required
      >
        <option value="">Selecciona una provincia</option>
        {provinces.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <label htmlFor={`${id}-plan`}>Plan</label>
      <select
        id={`${id}-plan`}
        name="plan_id"
        defaultValue={lead?.plan_id || ""}
        required
      >
        <option value="">Selecciona un plan</option>
        {lead && !plans.some((plan) => plan.id === lead.plan_id) && (
          <option value={lead.plan_id}>
            Plan anterior (no disponible en catálogo)
          </option>
        )}
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} · {plan.speed_mbps} Mbps
          </option>
        ))}
      </select>
    </>
  );
}
export function StatusFields({ lead }: { lead: Lead }) {
  const id = useId();
  const [outcome, setOutcome] = useState("");
  const action = statusAction(lead.status);
  if (!action) return <p>Esta oportunidad está cerrada. Su resultado es definitivo.</p>;
  return (
    <>
      <input type="hidden" name="status" value={action.next} />
      {action.next === "IN_PROGRESS" ? (
        <p>¿Iniciar la gestión de <strong>{lead.full_name}</strong>?</p>
      ) : (
        <>
          <p>Registra el resultado de <strong>{lead.full_name}</strong>. El cierre es definitivo y no se puede modificar después.</p>
          <label htmlFor={`${id}-outcome`}>Resultado de la oportunidad</label>
          <select
            id={`${id}-outcome`}
            name="outcome"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            required
          >
            <option value="">Selecciona Ganado o Perdido</option>
            <option value="WON">Ganado</option>
            <option value="LOST">Perdido</option>
          </select>
          {outcome === "WON" && (
            <>
              <label htmlFor={`${id}-amount`}>Monto mensual vendido (USD)</label>
              <input
                id={`${id}-amount`}
                name="sale_amount"
                inputMode="decimal"
                pattern="(0|[1-9][0-9]{0,7})([.][0-9]{1,2})?"
                placeholder="Ej. 24.90"
                required
                maxLength={11}
                aria-describedby={`${id}-hint`}
              />
              <p id={`${id}-hint`} className="caption">
                Usa punto decimal, de 0 a 99999999.99. Este valor mensual vendido no representa dinero cobrado.
              </p>
            </>
          )}
          {outcome === "LOST" && (
            <p className="caption">Un cierre perdido no registra importe ni cuenta como venta ganada.</p>
          )}
        </>
      )}
    </>
  );
}
