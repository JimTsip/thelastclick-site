import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const offerPath = new URL("protected-offers/real-estate-project.html", projectRoot);
const oldPublicPath = new URL("out/offers/real-estate-project/index.html", projectRoot);

test("keeps the real-estate offer encrypted and outside predictable public paths", async () => {
  const page = await readFile(offerPath, "utf8");

  assert.ok(
    Buffer.byteLength(page, "utf8") > 5_000_000,
    "the encrypted desktop/mobile mockups are missing from the offer",
  );
  assert.match(page, /Ιδιωτική οικονομική πρόταση/);
  assert.match(page, /name: "AES-GCM"/);
  assert.match(page, /iterations: 600000/);
  assert.match(page, /payload: "[A-Za-z0-9+/=]+"/);
  assert.match(page, /noindex,nofollow,noarchive,nosnippet/);
  assert.match(page, /TLC-logo\.png/);
  assert.match(page, /#7b43ff/);
  assert.doesNotMatch(page, /#ffb454/i);

  assert.doesNotMatch(page, /AI Real Estate Aggregator/);
  assert.doesNotMatch(page, /€4\.700/);
  assert.doesNotMatch(page, /Κάθε σπίτι μία φορά/);
  assert.doesNotMatch(page, /Πλήρες πρόγραμμα/);

  await assert.rejects(access(oldPublicPath), "the old predictable offer URL is still exported");
});
