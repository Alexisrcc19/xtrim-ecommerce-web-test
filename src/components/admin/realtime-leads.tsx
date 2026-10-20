"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createLeadUpdates } from "@/lib/admin/live-updates";

export function RealtimeLeads() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource("/api/admin/events");
    const updates = createLeadUpdates(
      () => router.refresh(),
      () =>
        document.visibilityState === "visible" &&
        !document.querySelector("dialog[open]"),
    );
    function changed(event: MessageEvent<string>) {
      updates.changed(event.data);
    }
    function ready(event: MessageEvent<string>) {
      setConnected(true);
      // Also catches changes missed while disconnected or during initial render.
      changed(event);
    }
    function disconnected() {
      setConnected(false);
    }
    const observer = new MutationObserver(updates.flush);
    const content = document.getElementById("contenido");
    if (content)
      observer.observe(content, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["open"],
      });
    source.addEventListener("ready", ready);
    source.addEventListener("leads-changed", changed);
    source.addEventListener("error", disconnected);
    document.addEventListener("visibilitychange", updates.flush);
    return () => {
      source.close();
      observer.disconnect();
      updates.stop();
      document.removeEventListener("visibilitychange", updates.flush);
    };
  }, [router]);

  return (
    <span className="crm-live-status" role="status">
      {connected ? "En directo" : "Sin conexión en vivo"}
    </span>
  );
}
