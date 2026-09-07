import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const deckPath = new URL("protected-offers/easyhome-deck.html", projectRoot);
const predictablePublicPath = new URL("out/easyhome-deck/index.html", projectRoot);

test("keeps the EasyHome investor deck encrypted and outside predictable public paths", async () => {
  const page = await readFile(deckPath, "utf8");

  assert.ok(
    Buffer.byteLength(page, "utf8") > 1_000_000,
    "the encrypted mockups are missing from the deck",
  );
  assert.match(page, /Private presentation/);
  assert.match(page, /name: "AES-GCM"/);
  assert.match(page, /iterations: 600000/);
  assert.match(page, /payload: "[A-Za-z0-9+/=]+"/);
  assert.match(page, /noindex,nofollow,noarchive,nosnippet/);

  // Nothing from the deck itself may survive in the shipped file.
  assert.doesNotMatch(page, /Every home, easy to find/);
  assert.doesNotMatch(page, /One card per home/);
  assert.doesNotMatch(page, /promotion slot/);
  assert.doesNotMatch(page, /Chalandri/);

  await assert.rejects(access(predictablePublicPath), "the deck is exported at a predictable URL");
});
