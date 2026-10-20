"use client";

import { createContext, useContext, useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import type { Plan } from "@/lib/plans";
import { price } from "@/lib/format";
import { LeadForm } from "./lead-form";
import { PlanDialog } from "./plan-dialog";

type View = "details" | "request";
type Selection = {
  plan: Plan | null;
  plans: Plan[] | null;
  view: View;
  trigger: HTMLElement;
};
interface ModalActions {
  openContact: (trigger: HTMLElement) => void;
  openPlan: (
    plan: Plan,
    plans: Plan[],
    trigger: HTMLElement,
    view: View,
  ) => void;
}
const ModalContext = createContext<ModalActions | null>(null);

export function usePlanModals() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("Los modales requieren PlanModals");
  return context;
}

export function ContactButton() {
  const { openContact } = usePlanModals();
  return (
    <button
      type="button"
      className="nav-contact"
      aria-haspopup="dialog"
      onClick={(event) => openContact(event.currentTarget)}
    >
      Contáctanos
    </button>
  );
}

export function PlanModals({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const titleId = useId();
  const needsPlans = selection !== null && selection.plans === null;

  useEffect(() => {
    if (!needsPlans) return;
    const controller = new AbortController();
    const base = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
    ).replace(/\/$/, "");
    async function load() {
      try {
        const response = await fetch(`${base}/plans`, {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(10000),
          ]),
        });
        if (!response.ok) throw new Error("Catálogo no disponible");
        const body: { data: Plan[] } = await response.json();
        if (!Array.isArray(body.data))
          throw new Error("Respuesta de catálogo inválida");
        if (!controller.signal.aborted)
          setSelection((current) =>
            current ? { ...current, plans: body.data } : null,
          );
      } catch {
        if (!controller.signal.aborted)
          setError("No pudimos cargar los planes. Inténtalo de nuevo.");
      }
    }
    void load();
    return () => controller.abort();
  }, [needsPlans, attempt]);

  function openContact(trigger: HTMLElement) {
    setError("");
    setSelection({ plan: null, plans: null, view: "request", trigger });
  }
  function openPlan(
    plan: Plan,
    plans: Plan[],
    trigger: HTMLElement,
    view: View,
  ) {
    setError("");
    setSelection({ plan, plans, trigger, view });
  }
  function close() {
    setSelection(null);
  }

  function content(current: Selection) {
    if (current.plans === null)
      return (
        <div className="dialog-details">
          <h2 id={titleId} data-modal-heading tabIndex={-1}>
            Conectemos contigo.
          </h2>
          {error ? (
            <>
              <p role="alert">{error}</p>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setError("");
                  setAttempt((value) => value + 1);
                }}
              >
                Volver a intentar
              </button>
            </>
          ) : (
            <p role="status">Cargando planes disponibles…</p>
          )}
        </div>
      );
    if (current.view === "details" && current.plan)
      return (
        <div className="dialog-details">
          <p className="eyebrow">Tu próxima conexión</p>
          <h2 id={titleId} data-modal-heading tabIndex={-1}>
            {current.plan.name}
          </h2>
          <p className="intro">{current.plan.description}</p>
          <div className="plan-summary">
            <p className="speed">
              {current.plan.speed_mbps}
              <span> Mbps</span>
            </p>
            <p className="price">
              {price(current.plan.monthly_price)}
              <span> / mes</span>
            </p>
            <p>USD · Precio mensual de demostración</p>
          </div>
          <p className="caption">
            Esta solicitud no genera una contratación ni un cobro. No es una
            oferta comercial oficial.
          </p>
          <button
            type="button"
            className="button"
            onClick={() => setSelection({ ...current, view: "request" })}
          >
            Solicitar información
          </button>
        </div>
      );
    return (
      <div className="dialog-request">
        <h2 className="sr-only" id={titleId} data-modal-heading tabIndex={-1}>
          {current.plan
            ? `Solicitar información de ${current.plan.name}`
            : "Contacto general"}
        </h2>
        <LeadForm
          plans={current.plans}
          selectedPlanId={current.plan?.id}
          onPendingChange={setBusy}
          onReturnHome={close}
        />
      </div>
    );
  }

  return (
    <ModalContext.Provider value={{ openContact, openPlan }}>
      {children}
      {selection && (
        <PlanDialog
          titleId={titleId}
          focusKey={`${selection.view}-${needsPlans}`}
          busy={busy}
          returnFocus={selection.trigger}
          onClose={close}
        >
          {content(selection)}
        </PlanDialog>
      )}
    </ModalContext.Provider>
  );
}
