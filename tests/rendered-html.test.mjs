import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("exports the The Last Click landing page", async () => {
  const html = await readFile(new URL("out/index.html", projectRoot), "utf8");

  assert.match(html, /<title>The Last Click — Indie Games\. Bold Ideas\.<\/title>/i);
  assert.match(html, /Indie Games\./i);
  assert.match(html, /Bold Ideas\./i);
  assert.match(html, /One Last Click\./i);
  assert.match(html, /mailto:hello@thelastclick\.gr/i);
  assert.match(html, /The Last Click © 2024/i);
});

test("exports domain and brand assets", async () => {
  const cname = await readFile(new URL("out/CNAME", projectRoot), "utf8");
  assert.equal(cname.trim(), "thelastclick.gr");
  await access(new URL("out/TLC-logo.png", projectRoot));
});
