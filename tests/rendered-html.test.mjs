import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const html = () => readFile(new URL("out/index.html", projectRoot), "utf8");

test("exports the The Last Click landing page", async () => {
  const page = await html();

  assert.match(page, /<title>The Last Click — AI First\. Bold Ideas\.<\/title>/i);
  assert.match(page, /AI First\./i);
  assert.match(page, /Bold Ideas\./i);
  assert.match(page, /One Last Click\./i);
  assert.match(page, /We turn ambitious ideas into AI-powered products that actually work\./i);
  // The address is deliberately NOT in the page: enquiries go through the
  // relay in ContactForm, so scrapers get nothing.
  assert.doesNotMatch(page, /mailto:/i, "email address is exposed in the page");
  assert.match(page, /<form[^>]+class="console"/, "contact form is missing");
  assert.match(page, /The Last Click © 2026/i);
});

test("every floor's copy is in the static HTML, not injected by JS", async () => {
  const page = await html();

  // One headline per floor. If these ever stop being server-rendered, the page
  // has silently become JS-dependent and both SEO and the no-WebGL path break.
  assert.match(page, /Three things, done properly\./i);
  assert.match(page, /Shipped, not shelved\./i);
  assert.match(page, /Four gates, in order\./i);
  assert.match(page, /build what should exist next\./i);

  // A sample of body copy from each list, for the same reason.
  assert.match(page, /AI-first products/i);
  assert.match(page, /Mobile apps &amp; games|Mobile apps & games/i);
  assert.match(page, /Web apps &amp; design systems|Web apps & design systems/i);
  assert.match(page, /AI in production/i);
  assert.match(page, /Frame/);
  assert.match(page, /weeks, not quarters/i);
});

test("keeps the accessibility affordances the scene depends on", async () => {
  const page = await html();

  assert.match(page, /class="skip-link"/, "skip link is missing");
  assert.match(page, /aria-labelledby="hero-title"/, "hero section is not labelled");
  assert.match(page, /aria-hidden="true"/, "decorative pixels are not hidden from AT");
});

test("exports domain and brand assets", async () => {
  const cname = await readFile(new URL("out/CNAME", projectRoot), "utf8");
  assert.equal(cname.trim(), "thelastclick.gr");
  await access(new URL("out/TLC-logo.png", projectRoot));
  await access(new URL("out/opengraph-image.png", projectRoot));
});

test("does not put three.js on the critical path", async () => {
  const page = await html();

  // The 3D scene must stay in a lazily-imported chunk. A preload or a module
  // script referencing three in the document head means the code split broke.
  const preloads = page.match(/<link[^>]+rel="preload"[^>]*>/g) ?? [];
  for (const tag of preloads) {
    assert.doesNotMatch(tag, /three/i, `three.js is preloaded: ${tag}`);
  }
});
