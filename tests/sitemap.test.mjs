import test from "node:test";
import assert from "node:assert/strict";
import sitemap from "../src/app/sitemap.ts";
import robots from "../src/app/robots.ts";

test("sitemap publica únicamente inicio y catálogo con el dominio configurado", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.example.com/";
    assert.deepEqual(sitemap(), [
      { url: "https://demo.example.com" },
      { url: "https://demo.example.com/planes" },
    ]);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("robots y sitemap comparten dominio y excluyen rutas administrativas", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://demo.example.com/";
    const directives = robots();
    assert.equal(directives.sitemap, "https://demo.example.com/sitemap.xml");
    assert.deepEqual(directives.rules, {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    });
    assert.ok(
      sitemap().every(
        (entry) => new URL(entry.url).origin === "https://demo.example.com",
      ),
    );
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
