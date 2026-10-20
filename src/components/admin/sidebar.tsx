"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/auth-actions";
export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  return (
    <aside className="crm-sidebar">
      <Link href="/admin" className="logo">
        xtrim
      </Link>
      <p className="crm-workspace">COMMERCIAL WORKSPACE</p>
      <div className="crm-sidebar-scroll">
        <p className="crm-nav-label">PRINCIPAL</p>
        <nav aria-label="Administración">
          {[
            ["/admin", "Dashboard", "▦"],
            ["/admin/leads", "Leads", "♧"],
            ["/admin/pipeline", "Pipeline", "▥"],
          ].map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="crm-sidebar-note">
          <h2>Cada conexión cuenta.</h2>
          <p>Convierte una consulta en una nueva oportunidad.</p>
          <Link href="/">Ver sitio público ↗</Link>
        </div>
      </div>
      <div className="crm-session">
        <strong>{username}</strong>
        <span>Administración</span>
        <form action={logout}>
          <button type="submit">Cerrar sesión ↗</button>
        </form>
      </div>
    </aside>
  );
}
