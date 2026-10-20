import test from "node:test";
import assert from "node:assert/strict";
import {
  validateLead,
  provinces,
  phoneInputValue,
} from "../src/lib/lead-validation.ts";
const valid = {
  full_name: "Persona Demostración",
  phone: "0991234567",
  province: "Pichincha",
  plan_id: "00000000-0000-0000-0000-000000000001",
};
test("entrada telefónica elimina letras y separadores, limita dígitos y conserva números históricos", () => {
  assert.equal(phoneInputValue("abc09x9123-4567"), "0991234567");
  assert.equal(phoneInputValue("099123456789"), "0991234567");
  assert.equal(phoneInputValue("099 123 4567"), "0991234567");
  assert.equal(phoneInputValue("+593991234567"), "0991234567");
  assert.equal(phoneInputValue("+59322345678"), "022345678");
  assert.equal(phoneInputValue("texto"), "");
});
test("acepta teléfonos celulares, fijos e internacionales del contrato", () => {
  for (const phone of [
    "099 123 4567",
    "02 234 5678",
    "+593 99 123 4567",
    "+59322345678",
  ])
    assert.deepEqual(validateLead({ ...valid, phone }), {});
});
test("rechaza teléfonos incompletos y prefijos extranjeros", () => {
  for (const phone of ["123", "09948", "+34991234567", "0891234567"])
    assert.ok(validateLead({ ...valid, phone }).phone);
});
test("admite nombres Unicode y rechaza números, controles y longitud inválida", () => {
  assert.deepEqual(
    validateLead({ ...valid, full_name: "María José O’Neill" }),
    {},
  );
  for (const full_name of ["A", "123", "Ana\nPérez", " ", "A".repeat(151)])
    assert.ok(validateLead({ ...valid, full_name }).full_name);
});
test("valida provincia y selección del plan", () => {
  assert.equal(provinces.length, 24);
  for (const province of provinces)
    assert.deepEqual(validateLead({ ...valid, province }), {});
  assert.ok(
    validateLead({ ...valid, province: "Provincia inventada" }).province,
  );
  assert.ok(validateLead({ ...valid, plan_id: "" }).plan_id);
});

test("contacto general exige elegir plan aunque los demás campos sean válidos", () => {
  assert.deepEqual(validateLead({ ...valid, plan_id: "" }), {
    plan_id: "Selecciona un plan disponible.",
  });
  assert.deepEqual(validateLead(valid), {});
});
