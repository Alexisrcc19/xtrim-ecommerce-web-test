import Link from "next/link";
import { redirect } from "next/navigation";
import { authConfig, currentAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/login-form";
export const metadata = { title: "Acceso administrativo" };
export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <main className="crm-login" id="contenido">
      <div className="crm-login-card">
        <Link href="/" className="logo">
          xtrim
        </Link>
        <p className="eyebrow">Commercial workspace</p>
        <h1>Tu gestión empieza aquí.</h1>
        <p>Ingresa para administrar las oportunidades comerciales.</p>
        <LoginForm configured={Boolean(authConfig())} />
        <Link href="/" className="crm-back">
          ← Volver al sitio público
        </Link>
      </div>
    </main>
  );
}
