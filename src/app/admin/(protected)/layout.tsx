import { requireAdmin } from "@/lib/admin/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { RealtimeLeads } from "@/components/admin/realtime-leads";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const username = await requireAdmin();
  return (
    <div className="crm">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Sidebar username={username} />
      <div className="crm-work">
        <div className="crm-topbar">
          <span>Workspace / Gestión comercial</span>
          <div className="crm-connection">
            <RealtimeLeads />
            <span className="crm-private">● Acceso privado</span>
          </div>
        </div>
        <main id="contenido" className="crm-content">
          {children}
        </main>
        <p className="crm-footnote">
          Xtrim CRM · Demostración técnica · Datos obtenidos de la API
        </p>
      </div>
    </div>
  );
}
