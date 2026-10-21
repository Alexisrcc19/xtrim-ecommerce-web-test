import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlan } from "@/lib/plans";
import { planPath } from "@/lib/public-plans";
import { price } from "@/lib/format";
import { PlanRequestButton } from "@/components/plan-request-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plan = await getPlan(slug);
  if (!plan) notFound();
  return {
    title: `${plan.name}: Internet de ${plan.speed_mbps} Mbps`,
    description: `${plan.name}: ${plan.speed_mbps} Mbps por ${price(plan.monthly_price)} USD al mes. ${plan.description} Solicita información. Precio de demostración.`,
    alternates: { canonical: planPath(plan.slug) },
  };
}

export default async function PlanPage({ params }: Props) {
  const { slug } = await params;
  const plan = await getPlan(slug);
  if (!plan) notFound();
  return (
    <main id="contenido">
      <section className="section tinted">
        <div className="container">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link> /{" "}
            <Link href="/planes">Planes de internet</Link> /{" "}
            <span aria-current="page">{plan.name}</span>
          </nav>
          <div className="plan-page-grid">
            <div>
              <p className="eyebrow">Tu próxima conexión</p>
              <h1 className="page-title">{plan.name}</h1>
              <p className="intro">{plan.description}</p>
              <h2 className="plan-page-heading">Conoce tu plan</h2>
              <dl className="plan-page-facts">
                <div>
                  <dt>Velocidad</dt>
                  <dd>{plan.speed_mbps} Mbps</dd>
                </div>
                <div>
                  <dt>Precio mensual</dt>
                  <dd>{price(plan.monthly_price)} USD</dd>
                </div>
              </dl>
              <Link href="/planes" className="plan-page-back">
                ← Volver al catálogo
              </Link>
            </div>
            <aside
              className="plan-page-request"
              aria-labelledby="request-heading"
            >
              <p className="eyebrow">Plan {plan.name}</p>
              <h2 id="request-heading">Conectemos contigo.</h2>
              <div className="plan-summary">
                <p className="speed">
                  {plan.speed_mbps}
                  <span> Mbps</span>
                </p>
                <p className="price">
                  {price(plan.monthly_price)}
                  <span> / mes</span>
                </p>
                <p>USD · Precio mensual de demostración</p>
              </div>
              <p>
                Déjanos tus datos para recibir información sobre este plan y
                consultar su disponibilidad.
              </p>
              <PlanRequestButton plan={plan} />
              <p className="caption">
                Esta solicitud no genera una contratación ni un cobro. Plan de
                demostración; no es una oferta oficial.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
