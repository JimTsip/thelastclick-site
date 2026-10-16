import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const out = new URL("../out/", import.meta.url);
const read = (p) => readFile(new URL(p, out), "utf8");

test("builds the parallax page with its bundle, styles and domain", async () => {
  const html = await read("index.html");
  assert.match(html, /<title>The Last Click — AI-first game studio in Athens/);
  assert.match(html, /<link rel="canonical" href="https:\/\/thelastclick\.ai\/">/);
  assert.match(html, /G-TD0G3Z1MQ7/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.equal((await read("CNAME")).trim(), "thelastclick.ai");
  for (const f of ["app.js", "app.css", "data/geometry-v3.json", "robots.txt", "sitemap.xml", "llms.txt", "favicon.ico", "opengraph-image.png"]) {
    await access(new URL(f, out));
  }
});

test("every asset the page asks for is shipped", async () => {
  const js = await read("app.js");
  const names = new Set([...js.matchAll(/[\w-]+\.webp/g)].map((m) => m[0]));
  assert.ok(names.size > 15, "too few assets referenced — the bundle changed shape");
  const shipped = new Set(await readdir(new URL("assets/", out)));
  for (const n of names) assert.ok(shipped.has(n), `missing asset ${n}`);
});

test("no email address is exposed anywhere on the public page", async () => {
  for (const f of ["index.html", "app.js", "app.css", "llms.txt"]) {
    assert.doesNotMatch(await read(f), /[\w.+-]+@(?:thelastclick|padlboard)\.\w+/, `${f} exposes an address`);
  }
});

test("contact form posts to the relay, not to a mail address", async () => {
  const js = await read("app.js");
  assert.match(js, /tlc-contact\.thelastclick\.workers\.dev/);
  assert.doesNotMatch(js, /formsubmit/);
});
