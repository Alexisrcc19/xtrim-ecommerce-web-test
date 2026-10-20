import Link from "next/link";
import Image from "next/image";
import banner from "../../../public/Vida conectada.png";
import { Questions } from "@/components/site";
import { PlanCatalog } from "@/components/plan-catalog";

export default function Home() {
  return (
    <main id="contenido">
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <p className="pill">● TU PRÓXIMA CONEXIÓN · ECUADOR</p>
              <h1>
                Tu mundo,
                <br />a otra velocidad.
              </h1>
              <p className="hero-copy">
                Trabaja, juega y disfruta. Encuentra un plan de internet para
                todo lo que mueve tu mundo.
              </p>
              <Link href="/planes" className="button">
                Conoce nuestros planes ↗
              </Link>
              <p className="hero-note">
                Una conexión para cada hogar.
                <br />
                Una experiencia que se siente.
              </p>
            </div>
            <div className="hero-art">
              <Image
                src={banner}
                alt="Pareja compartiendo una laptop en el sofá de su hogar"
                fill
                sizes="(max-width: 640px) calc(100vw - 36px), (max-width: 900px) 50vw, 560px"
                preload
                className="hero-image"
              />
              <div className="art-label">
                <span aria-hidden="true">ϟ</span>
                <div>
                  TU PRÓXIMO NIVEL<strong>Conecta con tu mundo</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-strip">
            <span>↗ Explora los planes</span>
            <span>◎ Encuentra tu velocidad</span>
            <span>♡ Solicita información</span>
          </div>
        </div>
      </section>
      <section className="section tinted">
        <div className="container">
          <p className="eyebrow">Conecta a tu manera</p>
          <div className="section-heading">
            <div>
              <h2>Un plan para cada ritmo de vida.</h2>
              <p>
                Descubre las velocidades y precios de nuestro catálogo de
                demostración.
              </p>
            </div>
            <Link href="/planes">Ver todos los planes ↗</Link>
          </div>
          <PlanCatalog limit={3} />
          <p className="disclaimer">
            Precios mensuales en USD. Demostración técnica; no corresponde a
            ofertas comerciales oficiales.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p className="eyebrow">Tu conexión, paso a paso</p>
          <h2>De tu solicitud a tu hogar.</h2>
          <div className="steps">
            <div>
              <span>01</span>
              <h3>Encuentra tu plan</h3>
              <p>Compara velocidades y precios del catálogo.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Déjanos tus datos</h3>
              <p>Completa el formulario del plan que te interesa.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Recibe información</h3>
              <p>Tu solicitud queda registrada para su gestión.</p>
            </div>
          </div>
          <div className="callout">
            <div>
              <h2>Tu próxima conexión empieza aquí.</h2>
              <p>Elige un plan y cuéntanos en qué provincia estás.</p>
            </div>
            <Link className="button" href="/planes">
              Encontrar mi plan ↗
            </Link>
          </div>
        </div>
      </section>
      <Questions />
    </main>
  );
}
