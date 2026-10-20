"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";

function containTabFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const dialog = event.currentTarget;
  const controls = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      "a[href], button, input, select, textarea, [tabindex]",
    ),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(":disabled") &&
      element.getClientRects().length > 0,
  );
  event.preventDefault();
  if (!controls.length) {
    dialog.focus();
    return;
  }
  const current = controls.findIndex(
    (element) => element === document.activeElement,
  );
  let next = (current + 1) % controls.length;
  if (event.shiftKey) next = current <= 0 ? controls.length - 1 : current - 1;
  controls[next].focus();
}

export function PlanDialog({
  children,
  titleId,
  focusKey,
  busy,
  returnFocus,
  onClose,
}: {
  children: ReactNode;
  titleId: string;
  focusKey: string;
  busy: boolean;
  returnFocus: HTMLElement | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.scrollTo(0, 0);
    dialog?.querySelector<HTMLElement>("[data-modal-heading]")?.focus();
  }, [focusKey]);

  return (
    <dialog
      ref={ref}
      className="plan-dialog"
      aria-labelledby={titleId}
      aria-modal="true"
      onKeyDown={containTabFocus}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <button
        type="button"
        className="dialog-close"
        aria-label="Cerrar ventana"
        disabled={busy}
        onClick={onClose}
      >
        <span aria-hidden="true">×</span>
      </button>
      {children}
    </dialog>
  );
}
