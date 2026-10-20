"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
export default function AdminError({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }
  return (
    <section className="crm-card">
      <h1>No pudimos cargar esta vista.</h1>
      <p role="alert">
        Comprueba la disponibilidad de la API y la configuración administrativa
        del servidor.
      </p>
      <button
        type="button"
        className="button"
        onClick={retry}
        disabled={pending}
      >
        {pending ? "Consultando…" : "Volver a intentar"}
      </button>
    </section>
  );
}
