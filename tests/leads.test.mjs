import test from "node:test";
import assert from "node:assert/strict";
import { sendLead } from "../src/lib/leads.ts";

const input = {
  full_name: "Persona Demo",
  phone: "0991234567",
  province: "Pichincha",
  plan_id: "00000000-0000-0000-0000-000000000001",
};
const lead = {
  id: "00000000-0000-0000-0000-000000000002",
  status: "NEW",
  created_at: "2026-10-20T12:00:00.000Z",
};

async function withFetch(replacement, run) {
  const original = globalThis.fetch;
  globalThis.fetch = replacement;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

test("envía únicamente los campos públicos y acepta una confirmación real 201", async () => {
  await withFetch(
    async (url, options) => {
      assert.ok(url.endsWith("/api/v1/leads"));
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), input);
      assert.equal(options.headers.Authorization, undefined);
      return Response.json({ data: lead }, { status: 201 });
    },
    async () => assert.deepEqual(await sendLead(input), lead),
  );
});

test("no muestra éxito para errores HTTP ni respuestas incompletas", async () => {
  for (const [status, body, expected] of [
    [400, {}, /rechazó los datos/],
    [422, {}, /ya no está disponible/],
    [500, {}, /No pudimos enviar/],
    [200, { data: lead }, /No pudimos confirmar/],
    [201, { data: { id: lead.id } }, /No pudimos confirmar/],
  ])
    await withFetch(
      async () => Response.json(body, { status }),
      async () => assert.rejects(sendLead(input), expected),
    );
});

test("respeta Retry-After del límite de captación", async () => {
  await withFetch(
    async () =>
      new Response("", { status: 429, headers: { "Retry-After": "120" } }),
    async () => assert.rejects(sendLead(input), /Espera 2 minutos/),
  );
});

test("no reintenta automáticamente al perder la conexión", async () => {
  let calls = 0;
  await withFetch(
    async () => {
      calls++;
      throw new TypeError("Failed to fetch");
    },
    async () => assert.rejects(sendLead(input), /podría duplicar/),
  );
  assert.equal(calls, 1);
});

test("no expone HTML ni detalles internos ante JSON inválido", async () => {
  await withFetch(
    async () =>
      new Response("<html>private server error</html>", { status: 201 }),
    async () =>
      assert.rejects(sendLead(input), /No pudimos confirmar la solicitud/),
  );
});
