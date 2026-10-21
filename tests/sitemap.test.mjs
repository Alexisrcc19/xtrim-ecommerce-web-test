import test from "node:test";
import assert from "node:assert/strict";
import sitemap from "../src/app/sitemap.ts";
import robots from "../src/app/robots.ts";

const plans = [
  { slug: "primer-plan", is_active: true },
  { slug: "segundo-plan", is_active: true },
  { slug: "plan-inactivo", is_active: false },
];
async function withCatalog(run) {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_SITE_URL = "https://demo.example.com/";
  globalThis.fetch = async () => Response.json({ data: plans });
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
}

test("sitemap publica inicio, catálogo y páginas de planes activos con el dominio configurado", async () => {
  await withCatalog(async () =>
    assert.deepEqual(await sitemap(), [
      { url: "https://demo.example.com" },
      { url: "https://demo.example.com/planes" },
      { url: "https://demo.example.com/planes/primer-plan" },
      { url: "https://demo.example.com/planes/segundo-plan" },
    ]),
  );
});

test("robots y sitemap comparten dominio y excluyen rutas administrativas", async () => {
  await withCatalog(async () => {
    const directives = robots();
    assert.equal(directives.sitemap, "https://demo.example.com/sitemap.xml");
    assert.deepEqual(directives.rules, {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    });
    assert.ok(
      (await sitemap()).every(
        (entry) =>
          new URL(entry.url).origin === "https://demo.example.com" &&
          !new URL(entry.url).pathname.startsWith("/admin"),
      ),
    );
  });
});

test("sitemap refleja cambios del catálogo sin conservar URLs obsoletas", async () => {
  await withCatalog(async () => {
    await sitemap();
    globalThis.fetch = async () =>
      Response.json({ data: [{ slug: "nuevo-plan", is_active: true }] });
    assert.deepEqual(
      (await sitemap()).map((entry) => entry.url),
      [
        "https://demo.example.com",
        "https://demo.example.com/planes",
        "https://demo.example.com/planes/nuevo-plan",
      ],
    );
  });
});

test("sitemap con catálogo vacío conserva las páginas públicas y un fallo no publica datos parciales", async () => {
  await withCatalog(async () => {
    globalThis.fetch = async () => Response.json({ data: [] });
    assert.equal((await sitemap()).length, 2);
    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(sitemap(), /No se pudo consultar el catálogo/);
  });
});
