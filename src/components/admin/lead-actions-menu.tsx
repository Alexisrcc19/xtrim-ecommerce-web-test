"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

const actions = [
  { mode: "detail", label: "Ver" },
  { mode: "edit", label: "Editar" },
  { mode: "status", label: "Cambiar estado" },
  { mode: "delete", label: "Eliminar" },
] as const;

export function LeadActionsMenu({
  name,
  onSelect,
}: {
  name: string;
  onSelect: (
    mode: (typeof actions)[number]["mode"],
    trigger: HTMLElement,
  ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const lastItem = useRef(false);

  useEffect(() => {
    if (!expanded) return;
    const items =
      container.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      );
    items?.[lastItem.current ? items.length - 1 : 0]?.focus();
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !container.current?.contains(event.target)
      )
        setExpanded(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [expanded]);

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setExpanded(false);
      trigger.current?.focus();
      return;
    }
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ),
    );
    const index = items.findIndex((item) => item === document.activeElement);
    let next =
      (index + (event.key === "ArrowUp" ? -1 : 1) + items.length) %
      items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    items[next]?.focus();
  }

  return (
    <div
      className="crm-actions-menu"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setExpanded(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="crm-actions-trigger"
        aria-label={`Acciones de ${name}`}
        aria-haspopup="menu"
        aria-expanded={expanded}
        aria-controls={expanded ? id : undefined}
        onClick={() => {
          lastItem.current = false;
          setExpanded(!expanded);
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          lastItem.current = event.key === "ArrowUp";
          setExpanded(true);
        }}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {expanded && (
        <div
          id={id}
          role="menu"
          aria-label={`Acciones de ${name}`}
          className="crm-actions-popover"
          onKeyDown={navigate}
        >
          {actions.map(({ mode, label }) => (
            <button
              key={mode}
              role="menuitem"
              type="button"
              tabIndex={-1}
              aria-haspopup="dialog"
              className={mode === "delete" ? "crm-menu-danger" : undefined}
              onClick={() => {
                setExpanded(false);
                if (trigger.current) onSelect(mode, trigger.current);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
