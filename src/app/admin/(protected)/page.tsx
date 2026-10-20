import Link from "next/link";
import { getMetrics, listLeads } from "@/lib/admin/api";
import { price } from "@/lib/format";
import { statuses, statusLabels } from "@/lib/admin/types";
import { LeadDate, StatusBadge } from "@/components/admin/common";
export const metadata = { title: "Dashboard" };
export default async function Dashboard() {
  const [{ data: metrics }, recent] = await Promise.all([
    getMetrics(),
    listLeads(new URLSearchParams({ page: "1", limit: "5" })),
  ]);
  return (
    <>
      <div className="crm-page-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Cada lead, una oportunidad.</h1>
          <p>El pulso de tu gestión comercial, con datos reales.</p>
        </div>
      </div>
      <div className="crm-kpis">
        {[
          [
            "Total de leads",
            String(metrics.total_leads),
            "Oportunidades registradas",
          ],
          [
            "Leads en gestión",
            String(metrics.leads_by_status.IN_PROGRESS),
            "Seguimiento comercial",
          ],
          [
            "Ventas ganadas",
            String(metrics.won_sales),
            "Cerrados con resultado ganado",
          ],
          [
            "Valor mensual vendido (USD)",
            price(metrics.monthly_sales_usd),
            "Montos históricos de ventas ganadas",
          ],
        ].map(([label, value, note]) => (
          <section className="crm-card crm-kpi" key={label}>
            <h2>{label}</h2>
            <strong>{value}</strong>
            <p>{note}</p>
          </section>
        ))}
      </div>
      <div className="crm-dashboard-grid">
        <section className="crm-card">
          <h2>Leads por estado</h2>
          <p>Distribución de todas las oportunidades actuales.</p>
          {statuses.map((status) => (
            <div className="crm-distribution" key={status}>
              <div>
                <StatusBadge status={status} />
                <strong>{metrics.leads_by_status[status]}</strong>
              </div>
              <progress
                value={metrics.leads_by_status[status]}
                max={Math.max(1, metrics.total_leads)}
                aria-label={`${statusLabels[status]}: ${metrics.leads_by_status[status]}`}
              />
            </div>
          ))}
        </section>
        <section className="crm-card crm-metric-note">
          <p className="eyebrow">Ventas en USD</p>
          <h2>Una oportunidad ganada, un monto registrado.</h2>
          <p>
            El valor mensual vendido suma exclusivamente los montos históricos
            de los leads cerrados y ganados.
          </p>
          <p>
            No representa ingresos cobrados ni ventas de un mes calendario. Los
            cierres perdidos no se suman.
          </p>
          <Link href="/admin/pipeline">Revisar pipeline ↗</Link>
        </section>
      </div>
      <section className="crm-card">
        <div className="crm-card-heading">
          <div>
            <h2>Leads recientes</h2>
            <p>Las últimas solicitudes registradas.</p>
          </div>
          <Link href="/admin/leads">Ver todos ↗</Link>
        </div>
        {recent.data.length ? (
          <div
            className="crm-table-scroll"
            role="region"
            aria-label="Leads recientes"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Contacto</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Provincia</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Creación</th>
                </tr>
              </thead>
              <tbody>
                {recent.data.map((lead) => (
                  <tr key={lead.id}>
                    <th scope="row">{lead.full_name}</th>
                    <td>{lead.phone}</td>
                    <td>{lead.province}</td>
                    <td>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td>
                      <LeadDate value={lead.created_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="crm-empty">
            Todavía no hay leads. Las solicitudes del ecommerce aparecerán aquí.
          </p>
        )}
      </section>
    </>
  );
}
