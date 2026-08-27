import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const offerPath = new URL("out/offers/real-estate-project/index.html", projectRoot);

test("publishes the real-estate offer only as encrypted content", async () => {
  const page = await readFile(offerPath, "utf8");

  assert.match(page, /Ιδιωτική οικονομική πρόταση/);
  assert.match(page, /name: "AES-GCM"/);
  assert.match(page, /iterations: 600000/);
  assert.match(page, /payload: "[A-Za-z0-9+/=]+"/);
  assert.match(page, /noindex,nofollow,noarchive,nosnippet/);

  assert.doesNotMatch(page, /AI Real Estate Aggregator/);
  assert.doesNotMatch(page, /€4\.700/);
  assert.doesNotMatch(page, /Κάθε σπίτι μία φορά/);
  assert.doesNotMatch(page, /Πλήρες πρόγραμμα/);
});
