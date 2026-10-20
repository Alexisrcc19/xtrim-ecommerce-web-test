"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="section tinted">
      <div className="container notice">
        <h1 className="page-title">No pudimos cargar la información.</h1>
        <p role="alert">
          El catálogo no está disponible en este momento. Inténtalo de nuevo más
          tarde.
        </p>
        <button className="button" onClick={reset}>
          Volver a intentar
        </button>
        <p>
          <Link href="/">Volver al inicio</Link>
        </p>
      </div>
    </main>
  );
}
