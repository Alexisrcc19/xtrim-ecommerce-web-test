import Link from "next/link";
import { redirect } from "next/navigation";
import { adminPlans, listLeads } from "@/lib/admin/api";
import { pageNumber } from "@/lib/admin/validation";
import { statuses, statusLabels } from "@/lib/admin/types";
import { LeadDate, Pagination } from "@/components/admin/common";
import { LeadActions } from "@/components/admin/lead-actions";
import { price } from "@/lib/format";
export const metadata = { title: "Pipeline comercial" };
export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pages = statuses.map((status) => pageNumber(params[status]));
  const [{ data: plans }, columns] = await Promise.all([
    adminPlans(),
    Promise.all(
      statuses.map((status, index) =>
        listLeads(
          new URLSearchParams({
            status,
            page: String(pages[index]),
            limit: "10",
          }),
        ),
      ),
    ),
  ]);
  const clamped = new URLSearchParams();
  let outOfRange = false;
  statuses.forEach((status, index) => {
    const validPage = Math.min(
      pages[index],
      Math.max(1, columns[index].pagination.total_pages),
    );
    if (validPage !== pages[index]) outOfRange = true;
    clamped.set(status, String(validPage));
  });
  if (outOfRange) redirect(`/admin/pipeline?${clamped}`);
  return (
    <>
      <div className="crm-page-heading">
        <div>
          <p className="eyebrow">Pipeline comercial</p>
          <h1>Una conexión en cada etapa.</h1>
          <p>Gestiona tus oportunidades desde el menú de cada tarjeta.</p>
        </div>
        <Link className="crm-secondary" href="/admin/leads">
          Ver tabla ↗
        </Link>
      </div>
      <div className="crm-kanban">
        {statuses.map((status, index) => {
          const column = columns[index];
          function href(page: number) {
            const query = new URLSearchParams();
            statuses.forEach((value, position) =>
              query.set(
                value,
                String(position === index ? page : pages[position]),
              ),
            );
            return `/admin/pipeline?${query}`;
          }
          return (
            <section
              className={`crm-column crm-column-${status}`}
              key={status}
              aria-labelledby={`column-${status}`}
            >
              <div className="crm-column-title">
                <h2 id={`column-${status}`}>{statusLabels[status]}</h2>
                <span>{column.pagination.total}</span>
              </div>
              <div className="crm-column-body">
                {column.data.length ? (
                  column.data.map((lead) => (
                    <article className="crm-opportunity" key={lead.id}>
                      <div className="crm-opportunity-heading">
                        <h3>{lead.full_name}</h3>
                        <LeadActions lead={lead} plans={plans} compact />
                      </div>
                      <p className="crm-opportunity-plan">
                        {plans.find((plan) => plan.id === lead.plan_id)?.name ||
                          "Plan no disponible"}
                      </p>
                      {lead.status === "CLOSED" && (
                        <p className={`crm-result crm-result-${lead.outcome}`}>
                          {lead.outcome === "WON"
                            ? `Ganado · ${price(lead.sale_amount || "0")}/mes`
                            : "Perdido"}
                        </p>
                      )}
                      <div className="crm-opportunity-meta">
                        <span>{lead.province}</span>
                        <LeadDate value={lead.created_at} />
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="crm-empty">
                    No hay oportunidades en esta etapa.
                  </p>
                )}
              </div>
              {column.pagination.total_pages > 1 && (
                <Pagination
                  page={pages[index]}
                  totalPages={column.pagination.total_pages}
                  href={href}
                />
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
