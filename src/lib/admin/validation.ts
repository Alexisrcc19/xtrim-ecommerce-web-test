import type { StatusChange } from "./types";
export function validUuid(value: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
    value,
  );
}
export function statusChange(
  status: string,
  outcome: string,
  amount: string,
): StatusChange {
  if (status === "NEW" || status === "IN_PROGRESS") return { status };
  if (status !== "CLOSED") throw new Error("Selecciona un estado válido.");
  if (outcome === "LOST") return { status, outcome };
  if (outcome !== "WON")
    throw new Error("Selecciona si el cierre fue ganado o perdido.");
  if (!/^(0|[1-9][0-9]{0,7})(\.[0-9]{1,2})?$/.test(amount))
    throw new Error(
      "Ingresa el monto mensual en USD, con punto decimal y hasta dos decimales (0 a 99999999.99).",
    );
  return { status, outcome, sale_amount: amount };
}
export function pageNumber(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^[1-9][0-9]{0,5}$/.test(value)) return 1;
  return Number(value);
}
