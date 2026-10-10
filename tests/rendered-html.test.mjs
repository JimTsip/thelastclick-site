import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const html = () => readFile(new URL("out/index.html", projectRoot), "utf8");

test("exports the The Last Click landing page", async () => {
  const page = await html();

  assert.match(page, /<title>The Last Click — Independent Game Studio/i);
  assert.match(page, /<link rel="canonical" href="https:\/\/thelastclick\.ai\/"/, "canonical is missing");
  assert.match(page, /"@type":"Organization"/, "Organization JSON-LD is missing");
  assert.match(page, /"streetAddress":"59-61 Agiou Konstantinou"/, "address JSON-LD is missing");
  assert.match(page, /Beyond the click\./i);
  assert.match(page, /A new chapter of play\./i);
  assert.match(page, /independent game studio based in Greece/i);
  // The address is deliberately NOT in the page: enquiries go through the
  // relay in ContactForm, so scrapers get nothing.
  assert.doesNotMatch(page, /mailto:/i, "email address is exposed in the page");
  assert.match(page, /<form[^>]+class="console"/, "contact form is missing");
  assert.match(page, /The Last Click © 2026/i);
  // Apple (and any registry check) reads the visible page, not the JSON-LD:
  // the legal entity must stay on screen or the domain stops proving who owns it.
  assert.match(page, /THE LAST CLICK L\.P\./, "legal entity name is missing from the footer");
  assert.match(page, /GEMI Reg\. No\. 183032403000/, "GEMI number is missing from the footer");
});

test("every floor's copy is in the static HTML, not injected by JS", async () => {
  const page = await html();

  assert.match(page, /Find your next game\./i);
  assert.match(page, /This is how we play\./i);
  assert.match(page, /Made at The Last Click\./i);
  assert.match(page, /talk games\./i);
  assert.match(page, /BoomBoats/);
  assert.match(page, /DADLINE: Family Rush/);
  assert.match(page, /ShipDuel/);
  assert.match(page, /Coming soon/);
  assert.match(page, /id6794503743/);
  assert.match(page, /id6802018413/);
  assert.match(page, /dev\.jimtsip\.boomboats/);
  assert.doesNotMatch(page, /AI-first|AI-powered|ProfessionalService|OfferCatalog/);

});

test("keeps the accessibility affordances the scene depends on", async () => {
  const page = await html();

  assert.match(page, /class="skip-link"/, "skip link is missing");
  assert.match(page, /aria-labelledby="hero-title"/, "hero section is not labelled");
  assert.match(page, /aria-hidden="true"/, "decorative pixels are not hidden from AT");
});

test("exports domain and brand assets", async () => {
  const cname = await readFile(new URL("out/CNAME", projectRoot), "utf8");
  assert.equal(cname.trim(), "thelastclick.ai");
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
