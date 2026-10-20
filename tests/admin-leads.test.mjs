import test from "node:test";
import assert from "node:assert/strict";
import {
  statusChange,
  validUuid,
  pageNumber,
} from "../src/lib/admin/validation.ts";

test("gestión envía solo el nuevo estado; perdido no registra monto ni se permite reabrir", () => {
  assert.throws(() => statusChange("NEW", "WON", "100"));
  assert.deepEqual(statusChange("IN_PROGRESS", "LOST", "100"), {
    status: "IN_PROGRESS",
  });
  assert.deepEqual(statusChange("CLOSED", "LOST", "100"), {
    status: "CLOSED",
    outcome: "LOST",
  });
});
test("cerrar exige resultado y ganado exige decimal compatible con la API", () => {
  assert.throws(() => statusChange("CLOSED", "", "24.90"));
  assert.throws(() => statusChange("INVALID", "WON", "24.90"));
  for (const amount of [
    "",
    "-1",
    "1e3",
    "24,90",
    "12.345",
    "100000000",
    "00.50",
  ])
    assert.throws(() => statusChange("CLOSED", "WON", amount));
  for (const amount of ["0", "0.00", "24.90", "99999999.99"])
    assert.deepEqual(statusChange("CLOSED", "WON", amount), {
      status: "CLOSED",
      outcome: "WON",
      sale_amount: amount,
    });
});
test("valida UUID y pagina sin propagar valores malformados", () => {
  assert.ok(validUuid("00000000-0000-0000-0000-000000000001"));
  assert.equal(validUuid("../plans"), false);
  assert.equal(pageNumber("2"), 2);
  for (const value of [undefined, "-1", "0", "2e3", ["2"], "999999999"])
    assert.equal(pageNumber(value), 1);
});

test("acciones contextuales según el estado; cerrado no ofrece transición", async () => {
  const { statusAction } = await import("../src/lib/admin/workflow.ts");
  assert.deepEqual(statusAction("NEW"), { label: "Iniciar gestión", next: "IN_PROGRESS" });
  assert.deepEqual(statusAction("IN_PROGRESS"), { label: "Cerrar oportunidad", next: "CLOSED" });
  assert.equal(statusAction("CLOSED"), null);
});
