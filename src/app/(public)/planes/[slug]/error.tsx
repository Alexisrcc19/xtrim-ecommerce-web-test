"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PlanError({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <main id="contenido" className="section tinted">
      <div className="container notice">
        <h1 className="page-title">No pudimos cargar este plan.</h1>
        <p role="alert">
          La información no está disponible en este momento. Inténtalo de nuevo.
        </p>
        <button
          className="button"
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              router.refresh();
              reset();
            })
          }
        >
          {pending ? "Consultando…" : "Volver a intentar"}
        </button>
        <p>
          <Link href="/planes">Volver al catálogo</Link>
        </p>
      </div>
    </main>
  );
}
