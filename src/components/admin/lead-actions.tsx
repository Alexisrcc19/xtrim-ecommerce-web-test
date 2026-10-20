"use client";
import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loadLead, mutateLead } from "@/app/admin/lead-actions";
import type { Lead } from "@/lib/admin/types";
import { statusLabels } from "@/lib/admin/types";
import { statusAction } from "@/lib/admin/workflow";
import type { Plan } from "@/lib/plans";
import { price } from "@/lib/format";
import { PlanDialog } from "@/components/plan-dialog";
import { LeadFields, StatusFields } from "./lead-fields";
import { LeadActionsMenu } from "./lead-actions-menu";

type Mode = "detail" | "create" | "edit" | "status" | "delete";
const titles: Record<Mode, string> = {
  detail: "Detalle del lead",
  create: "Crear lead",
  edit: "Editar lead",
  status: "Cerrar oportunidad",
  delete: "Eliminar lead",
};

const buttonLabels = {
  detail: "Ver",
  edit: "Editar",
  status: "Cerrar oportunidad",
  delete: "Eliminar",
};
const outcomes = { WON: "Ganado", LOST: "Perdido" };

export function LeadActions({
  lead = null,
  plans,
  compact = false,
}: {
  lead?: Lead | null;
  plans: Plan[];
  compact?: boolean;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [current, setCurrent] = useState(lead);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const titleId = useId();
  const router = useRouter();
  const submitting = useRef(false);

  const actionLabel = lead ? statusAction(lead.status)?.label : undefined;
  let dialogTitle = mode ? titles[mode] : "Lead";
  if (mode === "status" && current)
    dialogTitle = statusAction(current.status)?.label ?? "Resultado de la oportunidad";

  async function open(next: Mode, target: HTMLElement) {
    setTrigger(target);
    setError("");
    setNotice("");
    setCurrent(lead);
    setMode(next);
    if (!lead) return;
    setLoading(true);
    try {
      const result = await loadLead(lead.id);
      if (result.error) {
        setError(result.error);
        setCurrent(null);
      }
      if (result.lead) setCurrent(result.lead);
    } catch {
      setError(
        "No se pudo consultar el lead. Actualiza la vista e inténtalo de nuevo.",
      );
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !mode || mode === "detail") return;
    submitting.current = true;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await mutateLead(lead?.id || null, mode, data);
      if (result.error) {
        setError(result.error);
        if (mode === "status" && lead) {
          const latest = await loadLead(lead.id);
          if (latest.lead) setCurrent(latest.lead);
          router.refresh();
        }
        return;
      }
      setMode(null);
      setNotice("Operación completada.");
      router.refresh();
    } catch {
      setError(
        "No pudimos confirmar la operación. Actualiza la vista antes de reintentar para evitar duplicados.",
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  function body() {
    let submitLabel = "Guardar";
    if (mode === "delete") submitLabel = "Confirmar eliminación";
    if (mode === "status" && current) submitLabel = statusAction(current.status)?.label ?? "Cerrar oportunidad";
    if (loading) return <p role="status">Consultando información…</p>;
    if (error && !current && mode !== "create")
      return <p role="alert">{error}</p>;
    if (mode === "status" && current?.status === "CLOSED")
      return (
        <div>
          {error && <p role="alert" className="form-error">{error}</p>}
          <p>Esta oportunidad ya está cerrada. Su resultado es definitivo.</p>
          <p>{current.outcome ? outcomes[current.outcome] : "Cerrado"}{current.sale_amount !== null ? ` · ${price(current.sale_amount)} / mes` : ""}</p>
        </div>
      );
    if (mode === "detail" && current)
      return (
        <dl className="crm-detail">
          <div>
            <dt>Nombre</dt>
            <dd>{current.full_name}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{current.phone}</dd>
          </div>
          <div>
            <dt>Provincia</dt>
            <dd>{current.province}</dd>
          </div>
          <div>
            <dt>Plan</dt>
            <dd>
              {plans.find((plan) => plan.id === current.plan_id)?.name ||
                "Plan no disponible en catálogo"}
            </dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{statusLabels[current.status]}</dd>
          </div>
          <div>
            <dt>Resultado</dt>
            <dd>
              {current.outcome ? outcomes[current.outcome] : "Sin cierre"}
            </dd>
          </div>
          <div>
            <dt>Monto mensual histórico</dt>
            <dd>
              {current.sale_amount !== null
                ? price(current.sale_amount)
                : "Sin monto"}
            </dd>
          </div>
        </dl>
      );
    return (
      <form onSubmit={submit} aria-busy={pending}>
        {error && (
          <p
            className="form-error"
            role="alert"
            tabIndex={-1}
            ref={(element) => {
              element?.focus();
            }}
          >
            {error}
          </p>
        )}
        <fieldset disabled={pending}>
          <legend className="sr-only">{dialogTitle}</legend>
          {(mode === "create" || mode === "edit") && (
            <LeadFields lead={current} plans={plans} />
          )}
          {mode === "status" && current && <StatusFields lead={current} />}
          {mode === "delete" && current && (
            <p>
              ¿Eliminar permanentemente a <strong>{current.full_name}</strong>?
              Se quitará también de las métricas. Esta acción no se puede
              deshacer.
            </p>
          )}
          <div className="crm-dialog-actions">
            <button
              type="button"
              className="crm-secondary"
              onClick={() => setMode(null)}
            >
              Cancelar
            </button>
            <button
              className={`button ${mode === "delete" ? "crm-danger" : ""}`}
              type="submit"
            >
              {pending ? "Guardando…" : submitLabel}
            </button>
          </div>
        </fieldset>
        {pending && (
          <p className="caption" role="status">
            Procesando la operación…
          </p>
        )}
      </form>
    );
  }
  return (
    <>
      {compact && lead ? (
        <LeadActionsMenu
          name={lead.full_name}
          statusLabel={actionLabel ?? null}
          onSelect={(action, target) => void open(action, target)}
        />
      ) : (
        <div className="crm-row-actions">
          {lead ? (
            (["detail", "edit", "status", "delete"] as const).filter(action => action !== "status" || actionLabel).map((action) => (
              <button
                key={action}
                type="button"
                aria-haspopup="dialog"
                aria-label={`${action === "status" ? actionLabel : titles[action]}: ${lead.full_name}`}
                onClick={(event) => void open(action, event.currentTarget)}
              >
                {action === "status" ? actionLabel : buttonLabels[action]}
              </button>
            ))
          ) : (
            <button
              type="button"
              className="button"
              aria-haspopup="dialog"
              disabled={!plans.length}
              onClick={(event) => void open("create", event.currentTarget)}
            >
              ＋ Crear lead
            </button>
          )}
        </div>
      )}
      {!compact && lead?.status === "CLOSED" && (
        <span className="caption">
          {lead.outcome ? outcomes[lead.outcome] : "Cerrado"}{lead.sale_amount !== null ? ` · ${price(lead.sale_amount)} / mes` : ""}
        </span>
      )}
      {notice && (
        <span role="status" className="crm-action-notice">
          {notice}
        </span>
      )}
      {mode && (
        <PlanDialog
          titleId={titleId}
          focusKey={`${mode}-${loading}`}
          busy={pending}
          returnFocus={trigger}
          onClose={() => setMode(null)}
        >
          <div
            className={`crm-dialog${mode === "detail" ? " crm-dialog-detail" : ""}`}
          >
            <h2 id={titleId} data-modal-heading tabIndex={-1}>
              {dialogTitle}
            </h2>
            {body()}
          </div>
        </PlanDialog>
      )}
    </>
  );
}
