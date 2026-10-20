import Link from "next/link";
import { redirect } from "next/navigation";
import { adminPlans, listLeads } from "@/lib/admin/api";
import { pageNumber } from "@/lib/admin/validation";
import { provinces } from "@/lib/lead-validation";
import { statuses, statusLabels } from "@/lib/admin/types";
import { LeadDate, Pagination, StatusBadge } from "@/components/admin/common";
import { LeadActions } from "@/components/admin/lead-actions";

export const metadata = { title: "Gestión de leads" };
type Search = Record<string, string | string[] | undefined>;
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.trim().slice(0, 100) : "";
  const status =
    typeof params.status === "string" &&
    statuses.some((value) => value === params.status)
      ? params.status
      : "";
  const province =
    typeof params.province === "string" &&
    provinces.some((value) => value === params.province)
      ? params.province
      : "";
  const page = pageNumber(params.page);
  const filters = new URLSearchParams();
  if (search) filters.set("search", search);
  if (status) filters.set("status", status);
  if (province) filters.set("province", province);
  const query = new URLSearchParams(filters);
  query.set("page", String(page));
  query.set("limit", "10");
  const [result, { data: plans }] = await Promise.all([
    listLeads(query),
    adminPlans(),
  ]);
  function href(next: number) {
    const values = new URLSearchParams(filters);
    values.set("page", String(next));
    return `/admin/leads?${values}`;
  }
  const lastPage = Math.max(1, result.pagination.total_pages);
  if (page > lastPage) redirect(href(lastPage));
  return (
    <>
      <div className="crm-page-heading">
        <div>
          <p className="eyebrow">Oportunidades</p>
          <h1>Gestión de leads</h1>
          <p>Conoce a tus próximos clientes y acompaña cada oportunidad.</p>
        </div>
        <LeadActions plans={plans} />
      </div>
      <section className="crm-card">
        <form action="/admin/leads" className="crm-filters">
          <div>
            <label htmlFor="lead-search">Buscar por nombre o teléfono</label>
            <input
              id="lead-search"
              name="search"
              defaultValue={search}
              maxLength={100}
              placeholder="Ej. nombre o 099…"
            />
          </div>
          <div>
            <label htmlFor="lead-status">Estado</label>
            <select id="lead-status" name="status" defaultValue={status}>
              <option value="">Todos los estados</option>
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lead-province">Provincia</label>
            <select id="lead-province" name="province" defaultValue={province}>
              <option value="">Todas las provincias</option>
              {provinces.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="button">
            Aplicar filtros
          </button>
          <Link href="/admin/leads" className="crm-clear">
            Limpiar
          </Link>
        </form>
        <div className="crm-card-heading">
          <h2>{result.pagination.total} leads encontrados</h2>
          <Link href="/admin/pipeline">Ver Kanban ↗</Link>
        </div>
        {result.data.length ? (
          <div
            className="crm-table-scroll"
            role="region"
            aria-label="Listado de leads"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Contacto</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Provincia</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Creación</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((lead) => (
                  <tr key={lead.id}>
                    <th scope="row">{lead.full_name}</th>
                    <td>{lead.phone}</td>
                    <td>{lead.province}</td>
                    <td>
                      {plans.find((plan) => plan.id === lead.plan_id)?.name ||
                        "Plan no disponible"}
                    </td>
                    <td>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td>
                      <LeadDate value={lead.created_at} />
                    </td>
                    <td>
                      <LeadActions lead={lead} plans={plans} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="crm-empty">
            <h3>No hay leads para mostrar.</h3>
            <p>Prueba otros filtros o registra una nueva solicitud.</p>
          </div>
        )}
        <Pagination
          page={page}
          totalPages={result.pagination.total_pages}
          href={href}
        />
      </section>
      <p className="caption">
        La eliminación es permanente. Los cierres ganados se incluyen en el
        valor mensual vendido.
      </p>
    </>
  );
}
