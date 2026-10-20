import Link from "next/link";
export default function NotFound() {
  return (
    <main id="contenido" className="section tinted">
      <div className="container">
        <p className="eyebrow">404 · Página no encontrada</p>
        <h1 className="page-title">Esta conexión no está disponible.</h1>
        <p>
          La página que buscas no existe. Puedes consultar los planes en el
          catálogo.
        </p>
        <Link className="button" href="/planes">
          Ver planes disponibles
        </Link>
      </div>
    </main>
  );
}
