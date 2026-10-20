"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Plan } from "@/lib/plans";
import { price } from "@/lib/format";
import { provinces, validateLead } from "@/lib/lead-validation";
import type { FieldErrors, LeadInput } from "@/lib/lead-validation";
import { sendLead } from "@/lib/leads";

interface Confirmation {
  id: string;
  input: LeadInput;
  plan: Plan;
}

function ConfirmationCard({
  confirmation,
  onReturnHome,
}: {
  confirmation: Confirmation;
  onReturnHome?: () => void;
}) {
  const { input, plan, id } = confirmation;
  return (
    <section className="form-card success" aria-labelledby="confirmation-title">
      <span className="success-icon" aria-hidden="true">
        ✓
      </span>
      <h2
        id="confirmation-title"
        tabIndex={-1}
        ref={(element) => {
          element?.focus();
        }}
      >
        ¡Tu próxima conexión está en camino!
      </h2>
      <p>
        Gracias, {input.full_name}. Recibimos tu solicitud con el teléfono{" "}
        {input.phone}.
      </p>
      <div className="receipt">
        <p className="caption">SOLICITUD {id}</p>
        <h3>
          {plan.name} · {plan.speed_mbps} Mbps
        </h3>
        <p>
          {input.province} · {price(plan.monthly_price)} USD / mes
        </p>
      </div>
      <Link href="/" className="button" onClick={onReturnHome}>
        Volver al inicio
      </Link>
      <p className="caption">Esta solicitud no genera una contratación.</p>
    </section>
  );
}

export function LeadForm({
  plans,
  selectedPlanId = "",
  onPendingChange,
  onReturnHome,
}: {
  plans: Plan[];
  selectedPlanId?: string;
  onReturnHome?: () => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const input: LeadInput = {
      full_name: String(data.get("full_name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      province: String(data.get("province") || ""),
      plan_id: String(data.get("plan_id") || ""),
    };
    const nextErrors = validateLead(input);
    const plan = plans.find((item) => item.id === input.plan_id);
    if (!plan) nextErrors.plan_id = "Selecciona un plan disponible.";
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) {
      setMessage("Revisa los campos marcados antes de continuar.");
      const field = form.elements.namedItem(Object.keys(nextErrors)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    if (!plan) return;
    submitting.current = true;
    setSending(true);
    onPendingChange?.(true);
    try {
      const lead = await sendLead(input);
      setConfirmation({ id: lead.id, input, plan });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No pudimos confirmar el envío. Inténtalo de nuevo más tarde.",
      );
    } finally {
      submitting.current = false;
      setSending(false);
      onPendingChange?.(false);
    }
  }

  if (confirmation)
    return (
      <ConfirmationCard
        confirmation={confirmation}
        onReturnHome={onReturnHome}
      />
    );

  const errorProps = (name: keyof LeadInput) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <section className="form-card" aria-labelledby="form-title">
      <h2 id="form-title">Conectemos contigo.</h2>
      <p>
        Déjanos tus datos para solicitar información del plan, sin compromiso.
      </p>
      {!plans.length && (
        <p role="status">
          No hay planes disponibles para solicitar información en este momento.
        </p>
      )}
      <form onSubmit={submit} noValidate aria-busy={sending}>
        {message && (
          <div className="form-error" role="alert">
            {message}
          </div>
        )}
        <fieldset disabled={sending}>
          <legend className="sr-only">Datos de solicitud</legend>
          <label htmlFor="full_name">Nombre completo</label>
          <input
            id="full_name"
            name="full_name"
            autoComplete="name"
            maxLength={150}
            placeholder="Ej. Daniela Andrade"
            required
            {...errorProps("full_name")}
          />
          {errors.full_name && (
            <p className="field-error" id="full_name-error">
              {errors.full_name}
            </p>
          )}

          <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="099 123 4567"
            required
            {...errorProps("phone")}
            aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
          />
          {errors.phone ? (
            <p className="field-error" id="phone-error">
              {errors.phone}
            </p>
          ) : (
            <p className="caption" id="phone-hint">
              Usaremos este número para contactarte.
            </p>
          )}

          <label htmlFor="province">Provincia</label>
          <select
            id="province"
            name="province"
            defaultValue=""
            required
            {...errorProps("province")}
          >
            <option value="">Selecciona tu provincia</option>
            {provinces.map((province) => (
              <option key={province}>{province}</option>
            ))}
          </select>
          {errors.province && (
            <p className="field-error" id="province-error">
              {errors.province}
            </p>
          )}

          <label htmlFor="plan_id">Plan seleccionado</label>
          <select
            id="plan_id"
            name="plan_id"
            defaultValue={selectedPlanId}
            required
            {...errorProps("plan_id")}
          >
            <option value="">Selecciona un plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} · {plan.speed_mbps} Mbps ·{" "}
                {price(plan.monthly_price)}/mes
              </option>
            ))}
          </select>
          {errors.plan_id && (
            <p className="field-error" id="plan_id-error">
              {errors.plan_id}
            </p>
          )}
          <p className="caption data-notice">
            Al enviar, solicitas que se utilicen tu nombre, teléfono, provincia
            y plan para gestionar esta consulta. Utiliza datos ficticios en esta
            demostración.
          </p>
          <button className="button" type="submit" disabled={!plans.length}>
            {sending ? "Enviando solicitud…" : "Solicitar información →"}
          </button>
        </fieldset>
        <p className="caption form-status" role="status">
          {sending
            ? "Estamos procesando tu solicitud."
            : "Sin pagos ni contratación en línea."}
        </p>
      </form>
    </section>
  );
}
