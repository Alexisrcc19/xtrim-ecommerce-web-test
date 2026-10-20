import Link from "next/link";
import { statusLabels } from "@/lib/admin/types";
import type { LeadStatus } from "@/lib/admin/types";
export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`crm-badge crm-badge-${status}`}>
      {statusLabels[status]}
    </span>
  );
}
export function LeadDate({ value }: { value: string }) {
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/Guayaquil",
      }).format(new Date(value))}
    </time>
  );
}
export function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  return (
    <nav aria-label="Paginación" className="crm-pagination">
      {page > 1 ? (
        <Link href={href(page - 1)}>← Anterior</Link>
      ) : (
        <span>← Anterior</span>
      )}
      <span>
        Página {page} de {Math.max(1, totalPages)}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)}>Siguiente →</Link>
      ) : (
        <span>Siguiente →</span>
      )}
    </nav>
  );
}
