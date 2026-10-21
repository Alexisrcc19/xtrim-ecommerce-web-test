import test from "node:test";
import assert from "node:assert/strict";
import { fetchPlan, fetchPlans, planPath } from "../src/lib/public-plans.ts";

const plan = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Plan de prueba",
  slug: "plan-de-prueba",
  description: "Descripción de prueba.",
  speed_mbps: 150,
  monthly_price: "12.34",
  is_active: true,
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

test("detalle consulta el endpoint exacto sin caché persistente y conserva los datos", async () => {
  await withFetch(
    async (url, options) => {
      assert.ok(url.endsWith("/api/v1/plans/plan-de-prueba"));
      assert.equal(options.cache, "no-store");
      assert.ok(options.signal instanceof AbortSignal);
      return Response.json({ data: plan });
    },
    async () => assert.deepEqual(await fetchPlan(plan.slug), plan),
  );
});

test("distingue planes por slug en solicitudes consecutivas", async () => {
  const second = {
    ...plan,
    id: "00000000-0000-0000-0000-000000000002",
    name: "Otro plan",
    slug: "otro-plan",
    speed_mbps: 900,
    monthly_price: "45.67",
  };
  const requested = [];
  await withFetch(
    async (url) => {
      requested.push(url);
      return Response.json({
        data: url.endsWith("/otro-plan") ? second : plan,
      });
    },
    async () => {
      assert.deepEqual(await fetchPlan(plan.slug), plan);
      assert.deepEqual(await fetchPlan(second.slug), second);
      assert.notEqual(requested[0], requested[1]);
    },
  );
});

test("404, planes inactivos y respuestas de otro slug se consideran no disponibles", async () => {
  for (const response of [
    new Response(null, { status: 404 }),
    Response.json({ data: { ...plan, is_active: false } }),
    Response.json({ data: { ...plan, slug: "otro-plan" } }),
    Response.json({ data: null }),
  ])
    await withFetch(
      async () => response,
      async () => assert.equal(await fetchPlan(plan.slug), null),
    );
});

test("slugs inválidos no llaman a la API y los fallos de servicio no se convierten en 404", async () => {
  await withFetch(
    async () => {
      throw new Error("No debe consultar la API");
    },
    async () => {
      for (const slug of [
        "",
        "../leads",
        "UPPER",
        "a".repeat(121),
        "a/b",
        "a?x=1",
      ])
        assert.equal(await fetchPlan(slug), null);
    },
  );
  for (const status of [400, 429, 500, 503])
    await withFetch(
      async () => new Response(null, { status }),
      async () =>
        assert.rejects(fetchPlan(plan.slug), /No se pudo consultar el plan/),
    );
  await withFetch(
    async () => {
      throw new TypeError("network error");
    },
    async () => assert.rejects(fetchPlan(plan.slug), /network error/),
  );
});

test("catálogo solo incluye planes activos y construye rutas individuales", async () => {
  await withFetch(
    async () => Response.json({ data: [plan, { ...plan, is_active: false }] }),
    async () => assert.deepEqual(await fetchPlans(), [plan]),
  );
  assert.equal(planPath(plan.slug), "/planes/plan-de-prueba");
});
