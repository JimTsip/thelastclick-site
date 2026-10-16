// Builds the static parallax site (web/) into out/ for GitHub Pages.
// The page is the prototype from Design/Website-Parallax-2026-10-16, source of truth in tlc.pen (frame lWwes).
import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const at = (p) => new URL(p, root).pathname;

await rm(at("out"), { recursive: true, force: true });
await mkdir(at("out"), { recursive: true });

await build({
  entryPoints: [at("web/main.js")],
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2020",
  outfile: at("out/app.js"),
  legalComments: "none",
});

const css = (await readFile(at("web/lenis.css"), "utf8")) + "\n" + (await readFile(at("web/style.css"), "utf8"));
await writeFile(at("out/app.css"), css);

await cp(at("web/index.html"), at("out/index.html"));
await cp(at("web/assets"), at("out/assets"), { recursive: true });
await cp(at("web/data"), at("out/data"), { recursive: true });
for (const f of ["CNAME", "robots.txt", "sitemap.xml", "llms.txt", "TLC-logo.png"]) await cp(at(`public/${f}`), at(`out/${f}`));
for (const f of ["favicon.ico", "icon.png", "apple-icon.png", "opengraph-image.png"]) await cp(at(`app/${f}`), at(`out/${f}`));

console.log("built out/ from web/");
