import Link from "next/link";
import { ContactButton } from "./plan-modals";

export function Header() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <div className="topbar">
        <div className="container">
          Conectamos lo que más te importa.
          <span>Demostración técnica · Ecuador</span>
        </div>
      </div>
      <header>
        <nav className="container navigation" aria-label="Principal">
          <Link href="/" className="logo" aria-label="Xtrim, inicio">
            xtrim
          </Link>
          <div className="nav-links">
            <Link href="/">Inicio</Link>
            <Link href="/planes">Planes de internet</Link>
            <ContactButton />
          </div>
          <span className="demo-badge">Demo Xtrim</span>
        </nav>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <Link href="/" className="logo">
            xtrim
          </Link>
          <p>Tu próxima conexión empieza aquí.</p>
          <p>Una propuesta conceptual para Ecuador.</p>
        </div>
        <div>
          <h2>Descubre Xtrim</h2>
          <Link href="/planes">Planes de internet ↗</Link>
        </div>
        <div>
          <h2>Hablemos</h2>
          <p>Elige un plan y envíanos tu solicitud.</p>
          <Link href="/planes">Solicitar información ↗</Link>
        </div>
      </div>
      <div className="container legal">
        © {new Date().getFullYear()} · Demostración técnica independiente. No
        es el sitio oficial de Xtrim. Planes y precios demostrativos.
      </div>
    </footer>
  );
}

export function Questions() {
  return (
    <section className="faq-section">
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">Resolvemos tus dudas</p>
          <h2>Todo claro, desde el inicio.</h2>
          <p>Conoce los siguientes pasos antes de enviar tu solicitud.</p>
        </div>
        <div>
          <details open>
            <summary>¿Esta solicitud genera una contratación?</summary>
            <p>
              No. Envías tus datos para recibir información del plan
              seleccionado. No se realiza ningún cobro.
            </p>
          </details>
          <details>
            <summary>¿Cómo consulto la disponibilidad?</summary>
            <p>
              Selecciona un plan e indica tu provincia en el formulario. La
              disponibilidad debe confirmarse antes de contratar.
            </p>
          </details>
          <details>
            <summary>¿Los precios son oficiales?</summary>
            <p>
              No. Este sitio es una demostración técnica con planes y precios
              ficticios obtenidos de la API.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
