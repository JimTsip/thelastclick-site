import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/**
 * Guards the contract between app/lib/floors.ts and the rendered page.
 *
 * The 3D scene positions its set pieces by looking up `<section data-floor>`
 * elements by id. If a floor exists in the data but not in the DOM (or vice
 * versa), the camera path silently desynchronises from the content — a failure
 * that is invisible in a build log and obvious only to a visitor.
 */

const projectRoot = new URL("../", import.meta.url);

async function floorIds() {
  const source = await readFile(new URL("app/lib/floors.ts", projectRoot), "utf8");
  const body = source.slice(source.indexOf("export const FLOORS"));
  const entries = body.slice(0, body.indexOf("];"));

  return [...entries.matchAll(/^\s*\{\s*id:\s*"([a-z]+)"/gim)].map((match) => match[1]);
}

test("FLOORS is a non-empty list of unique ids", async () => {
  const ids = await floorIds();

  assert.ok(ids.length >= 4, `expected at least 4 floors, found ${ids.length}`);
  assert.equal(new Set(ids).size, ids.length, `duplicate floor id in ${ids.join(", ")}`);
});

test("every floor in the data renders as a section in the page", async () => {
  const ids = await floorIds();
  const html = await readFile(new URL("out/index.html", projectRoot), "utf8");

  for (const id of ids) {
    assert.match(
      html,
      new RegExp(`data-floor="${id}"`),
      `floor "${id}" is in FLOORS but has no <section data-floor="${id}"> in the page`,
    );
  }
});

test("the page renders no floors the data does not know about", async () => {
  const ids = new Set(await floorIds());
  const html = await readFile(new URL("out/index.html", projectRoot), "utf8");
  const rendered = [...html.matchAll(/data-floor="([a-z]+)"/g)].map((match) => match[1]);

  for (const id of new Set(rendered)) {
    assert.ok(ids.has(id), `page renders floor "${id}", which is not in FLOORS`);
  }
});

test("floor spans are positive and the page is not absurdly long", async () => {
  const source = await readFile(new URL("app/lib/floors.ts", projectRoot), "utf8");
  const body = source.slice(source.indexOf("export const FLOORS"));
  const spans = [...body.slice(0, body.indexOf("];")).matchAll(/span:\s*([\d.]+)/g)].map((m) =>
    Number(m[1]),
  );

  assert.ok(spans.length > 0, "no spans found");
  for (const span of spans) {
    assert.ok(span > 0, `span ${span} must be positive`);
  }

  const total = spans.reduce((sum, span) => sum + span, 0);
  assert.ok(total <= 12, `document is ${total} viewports tall; that is too far to scroll`);
});
