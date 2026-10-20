import type { Metadata } from "next";
import Link from "next/link";
import { Questions } from "@/components/site";
import { PlanCatalog } from "@/components/plan-catalog";

export const metadata: Metadata = {
  title: "Compara Planes de Internet para tu Hogar",
  description:
    "Compara las velocidades y los precios de nuestros planes de internet para tu hogar en Ecuador. Elige un plan y solicita información sin compromiso. Precios demostrativos.",
  alternates: { canonical: "/planes" },
};

export default function PlansPage() {
  return (
    <main id="contenido">
      <section className="section tinted" id="solicitud">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Inicio</Link> / Planes de internet
          </p>
          <p className="eyebrow">Internet a tu manera</p>
          <h1 className="page-title">Elige la velocidad de tu mundo.</h1>
          <p className="intro">
            Encuentra tu próxima conexión. Selecciona un plan para solicitar
            información.
          </p>
          <h2 className="sr-only">Planes disponibles</h2>
          <PlanCatalog />
          <p className="disclaimer">
            Precios mensuales en USD. Planes ficticios para demostración; no son
            ofertas oficiales.
          </p>
        </div>
      </section>
      <Questions />
    </main>
  );
}
