import test from "node:test";
import assert from "node:assert/strict";
import { createLeadUpdates } from "../src/lib/admin/live-updates.ts";

test("agrupa eventos, ignora revisiones repetidas y no consulta durante inactividad", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let count = 0;
  const updates = createLeadUpdates(
    () => count++,
    () => true,
  );
  t.mock.timers.tick(60000);
  assert.equal(count, 0);
  updates.changed("instance:0");
  updates.changed("instance:1");
  updates.changed("instance:2");
  t.mock.timers.tick(300);
  assert.equal(count, 1);
  updates.changed("instance:2");
  t.mock.timers.tick(60000);
  assert.equal(count, 1);
  updates.changed("instance:3");
  t.mock.timers.tick(300);
  assert.equal(count, 2);
  updates.stop();
});

test("pospone cambios mientras hay un diálogo o pestaña oculta y recupera al reconectar", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let count = 0;
  let available = false;
  const updates = createLeadUpdates(
    () => count++,
    () => available,
  );
  updates.changed("instance:0");
  updates.changed("instance:1");
  t.mock.timers.tick(60000);
  assert.equal(count, 0);
  available = true;
  updates.flush();
  available = false;
  t.mock.timers.tick(300);
  assert.equal(count, 0);
  available = true;
  updates.flush();
  t.mock.timers.tick(300);
  assert.equal(count, 1);
  updates.changed("instance:9");
  t.mock.timers.tick(300);
  assert.equal(count, 2);
  updates.changed("restarted:0");
  t.mock.timers.tick(300);
  assert.equal(count, 3);
});

test("desmontar cancela el trabajo pendiente y deja de responder a eventos", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let count = 0;
  const updates = createLeadUpdates(
    () => count++,
    () => true,
  );
  updates.changed("instance:1");
  updates.stop();
  updates.changed("instance:2");
  updates.flush();
  t.mock.timers.tick(60000);
  assert.equal(count, 0);
});
