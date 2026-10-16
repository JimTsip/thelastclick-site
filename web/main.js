import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin.js";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const A = "./assets/";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const params = new URLSearchParams(location.search);
// ?still renders every world at rest (no loader, no motion) — the reference for the Pencil "as built" frames.
const STILL = params.has("still");

// Two layouts, each in its own Pencil design units: desktop = tlc.pen lWwes (1440 wide),
// mobile = tlc.pen A2LXWD (390 wide). Phones, narrow windows and portrait tablets get the mobile one.
// ?mobile / ?desktop force a layout.
const wantMobile = () => {
  const w = document.documentElement.clientWidth, h = innerHeight;
  return w < 600 || (w < 1100 && h > w * 1.1);
};
const MOBILE = params.has("mobile") ? true : params.has("desktop") ? false : wantMobile();
document.documentElement.classList.toggle("is-mobile", MOBILE);

const CUBE19 = "19-hero-floating-voxel-cube.webp";
const CUBE20 = "20-hero-floating-voxel-cube-turned.webp";
const STEP21 = "21-hero-floating-voxel-step-fragment.webp";
const TOWERS = params.has("flat") ? null : {
  void: "22-hero-portal-void.webp",
  left: "23-hero-tower-left-alpha.webp",
  right: "24-hero-tower-right-alpha.webp",
};
const NAV = [["GAMES", "#shipduel"], ["STUDIO", "#studio"], ["CONTACT", "#contact"]];
const ENDPOINT = "https://tlc-contact.thelastclick.workers.dev";
const BOOMBOATS_STORES = [
  { store: "apple", href: "https://apps.apple.com/app/id6794503743" },
  { store: "play", href: "https://play.google.com/store/apps/details?id=dev.jimtsip.boomboats" },
];
const DADLINE_STORES = [{ store: "apple", href: "https://apps.apple.com/app/id6802018413" }];
const SOON = [{ store: "apple" }, { store: "play" }];

// ---------- desktop (tlc.pen lWwes, 1440) ----------
const DESKTOP = (() => {
  const head = (x, y, w, lh, c, color = "#FFFFFF") => ({ f: "jersey", x, y, w, fs: 88, fw: 800, lh, color, c, tag: "h2" });
  const body = (x, y, w, lh, c, color = "#FFFFFF") => ({ f: "jersey25", x, y, w, fs: 32, fw: 500, lh, color, c });
  const scene = [-180, -80, 1800, 1200];
  return {
    W: 1440, PAGE_H: 4800, COLS: 36, CW: 40, EXT: 220,
    // edge build travel, living-edge amplitude and step, copy drift guard and margin (design units)
    EDGE_TRAVEL: 160, JIT_AMP: 40, JIT_STEP: 20, COPY_DRIFT: 15, COPY_MARGIN: 6, COPY_T: 12,
    geometry: "./data/geometry-v3.json",
    flat: { k: -70, md: 6, zoom: 0.06 },
    store: { w: 220, h: 64, gap: 16, path: "M17 1L219 1L203 63L1 63Z" },
    HERO: {
      y: 0, h: 960, bg: "#020826", pm: 1, part: 300,
      plate: { src: "18-hero-portal-clean-background.webp", box: [-180, -80, 1800, 1126] },
      towers: TOWERS && { ...TOWERS, left_box: [-180, -80, 1800, 1126], right_box: [-180, -80, 1800, 1126] },
      depth: {
        far: { ky: 0.42, spread: 70, scale: 0.15, md: 10, opacity: 0.6 },
        mid: { ky: 0.24, spread: 190, scale: 0.55, md: 24, opacity: 1 },
        near: { ky: -0.06, spread: 360, scale: 1.5, md: 46, opacity: 1, blur: 9 },
      },
      cubes: [
        { depth: "far", src: CUBE20, box: [410, 185, 62, 62] },
        { depth: "far", src: CUBE19, box: [1270, 572, 42, 42] },
        { depth: "mid", src: CUBE19, box: [290, 75, 150, 150] },
        { depth: "mid", src: CUBE20, box: [90, 414, 78, 78] },
        { depth: "mid", src: CUBE20, box: [1250, 140, 170, 170] },
        { depth: "mid", src: CUBE19, box: [1285, 470, 78, 78] },
        { depth: "mid", src: CUBE19, box: [823, 144, 270, 270] },
        { depth: "mid", src: CUBE20, box: [823, 304, 62, 62] },
        { depth: "near", src: STEP21, box: [260, 695, 200, 133] },
        { depth: "near", src: CUBE19, box: [1170, 585, 190, 190] },
      ],
      copy: [
        { f: "jersey", x: 435, y: 343, w: 570, fs: 32, fw: 600, lh: 0.8, ls: 2, op: 0.9, align: "center", color: "#7F45F5", c: "ONE AI STUDIO. ENDLESS POSSIBILITIES.", role: "anchor" },
        { f: "jersey", x: 255.5, y: 384, w: 929, fs: 144, fw: 800, lh: 0.65, align: "center", c: "BEYOND THE CLICK.", role: "headline", tag: "h1" },
        { f: "jersey25", x: 395, y: 509, w: 650, fs: 28, fw: 400, lh: 1, align: "center", c: "We’re an AI-first game studio in Athens.\nWe pair human creativity with AI to build mobile games with a world of their own.", role: "body", wrap: true },
        { f: "inter", x: 540, y: 694, w: 360, fs: 12, fw: 600, lh: 0.96, ls: 2, align: "center", c: "SCROLL INTO PLAY  ↓", role: "scroll" },
      ],
      nav: { logo: [54, 5, 132, 98], y: 46, fs: 17, x: [1000, 1110, 1234] },
    },
    WORLDS: [
      {
        key: "shipduel", y: 840, h: 1040, bg: "#048CB2", z: 20, scene,
        flatSrc: "12-shipduel-complete-scene.webp",
        // Separated ShipDuel layers (25–28). Boxes are in the 1800×1200 scene frame at (-180,-80).
        layers: [
          { name: "plate", src: "25-shipduel-plate.webp", box: [0, 0, 1800, 1200], k: -70, md: 6 },
          { name: "mara", src: "28-shipduel-mara-ship-alpha.webp", box: [339, 384, 569, 520], k: -30, kx: -70, md: 12, bob: [3, 1.2, 3.4] },
          { name: "rook", src: "27-shipduel-rook-ship-alpha.webp", box: [315, -112, 1744, 1163], k: 50, md: 22, rock: 3, bob: [4, 1.6, 2.8] },
          { name: "spray", src: "26-shipduel-spray-alpha.webp", box: [600, 706, 1480, 493], k: 40, md: 30, overlay: true, sway: 14, fade: true },
        ],
        veil: { box: [0, 0, 800, 960], bg: "linear-gradient(to right, #002C58D9 0%, #035B7733 70%, #035B7700 100%)" },
        logo: { src: "shipduel-logo.webp", box: [75, 191, 391, 191] },
        head: head(75, 420, 520, 0.69, "MAKE YOUR\nNAME AT SEA."),
        body: body(75, 556, 440, 1, "Changed seas. Unlikely captains.\nA name to make, one duel at a time."),
        stores: { x: 75, y: 662, main: "#FFFFFF", ink: "#06324F", backing: "#002C588C", game: "ShipDuel", items: SOON },
      },
      {
        key: "tinyderby", y: 1680, h: 1040, bg: "#1B9C37", z: 30, scene,
        flatSrc: "15-tinyderby-complete-scene.webp",
        veil: { box: [810, 120, 630, 840], bg: "linear-gradient(to left, #041B57F2, #041B5700)" },
        logo: { src: "tinyderby-logo.webp", box: [880, 215, 232, 232] },
        head: head(880, 463, 525, 0.784, "SMALL PLAYERS.\nBIG RIVALRIES."),
        body: body(881, 601, 470, 1.025, "Take your shot.\nMake every move matter."),
        stores: { x: 880, y: 711, main: "#FFDB23", ink: "#071F55", backing: "#041B578C", game: "TinyDerby", items: SOON },
      },
      {
        key: "boomboats", y: 2520, h: 1040, bg: "#041B57", z: 40, scene,
        flatSrc: "13-boomboats-complete-scene.webp",
        veil: { box: [820, 70, 620, 890], bg: "linear-gradient(to left, #020F3ED4, #020F3E00)" },
        logo: { src: "boomboats-logo.webp", box: [915, 196, 324, 324] },
        head: head(915, 495, 470, 0.87, "YOUR MOVE\nMAKES WAVES."),
        body: body(915, 655, 440, 1, "Plot your move. Make it count."),
        stores: { x: 915, y: 734, main: "#FFFFFF", ink: "#061A46", backing: "#020F3E8C", game: "BoomBoats", items: BOOMBOATS_STORES },
      },
      {
        key: "dadline", y: 3360, h: 1040, bg: "#FFE7A2", z: 50, scene,
        flatSrc: "16-dadline-complete-scene-copyspace-v2.webp",
        veil: { box: [0, -24, 680, 1051], bg: "linear-gradient(to right, #FFF0C8ED 0%, #FFF0C8B3 55%, #FFF0C800 100%)" },
        logo: { src: "dadline-logo.webp", box: [70, 167, 550, 223] },
        head: head(82, 420, 550, 0.78, "THE CITY HAS\nOTHER PLANS.", "#09233B"),
        body: body(82, 570, 500, 1, "The family has a list.\nStep into the everyday chaos.", "#09233B"),
        stores: { x: 80, y: 670, main: "#09233B", ink: "#FFFFFF", backing: "#FFF0C88C", game: "DadLine", items: DADLINE_STORES },
      },
    ],
    CONTACT: {
      key: "footer", y: 4200, h: 600, bg: "#080B30", z: 60,
      copy: [
        { f: "jersey", x: 80, y: 158, w: 620, fs: 82, fw: 800, lh: 0.88, c: "LET'S MAKE\nTHE NEXT CHAPTER.", role: "headline", tag: "h2" },
        { f: "jersey25", x: 84, y: 312, w: 560, fs: 32, fw: 500, lh: 1, c: "Tell us what you want to build.\nWe reply within two working days.", role: "invite" },
        { f: "inter", x: 84, y: 538, w: 980, fs: 13, fw: 500, lh: 0.98, ls: 1, color: "#C9A8FF", c: "© 2026 THE LAST CLICK  ·  A NEW CHAPTER OF PLAY.", role: "legal" },
      ],
      logo: { src: "tlc-logo.webp", box: [80, 434, 130, 97] },
      // No address on the page: the form posts to the tlc-contact Worker, which holds it as a secret.
      form: { box: [760, 126, 600, 340], endpoint: ENDPOINT, field: 290, idea: 600, send: [240, 60, "M15 0l225 0-15 60-225 0z"] },
    },
  };
})();

// ---------- mobile (tlc.pen A2LXWD, 390) ----------
// Scene on top, a fixed fade into the panel colour, copy stacked underneath; 10 edge columns of 39,
// the same real size as the desktop's 40px voxels.
const PHONE = (() => {
  const CW = 390 / 10;
  const scene = (x) => [x, -40, 1050, 700];
  const fade = (c) => ({ box: [0, 360, 390, 680], bg: `linear-gradient(to bottom, ${c}00 0%, ${c}E6 28%, ${c} 41%)` });
  // Copy column (Pencil "Copy" frame): logo, 18, headline, 12, invitation, 24, store buttons.
  const stack = (y, [src, w, h], headC, bodyC, lines, stores, ink = "#FFFFFF") => ({
    logo: { src, box: [16, y, w, h] },
    head: { f: "jersey", x: 16, y: y + h + 18, w: 358, fs: 56, fw: 800, lh: 0.8, color: ink, c: headC, tag: "h2" },
    body: { f: "jersey25", x: 16, y: y + h + 120, w: 358, fs: 20, fw: 500, lh: 1.05, color: ink, c: bodyC },
    stores: { x: 16, y: y + h + 120 + lines * 21 + 24, ...stores },
  });
  return {
    W: 390, PAGE_H: 5420, COLS: 10, CW, EXT: 220,
    EDGE_TRAVEL: 4 * CW, JIT_AMP: CW, JIT_STEP: CW / 2, COPY_DRIFT: 10, COPY_MARGIN: 4, COPY_T: 8,
    geometry: "./data/geometry-mobile-v2.json",
    flat: { k: -30, md: 3, zoom: 0.05 },
    // Buttons touch (gap 0): only the diagonal slit separates them.
    store: { w: 171, h: 52, gap: 0, path: "M14 1L170 1L157 51L1 51Z" },
    HERO: {
      y: 0, h: 860, bg: "#020826", pm: 0.5, part: 110,
      // Portrait portal (Codex 29–32): the towers frame both sides full height and part on scroll.
      plate: { src: "29-hero-portal-portrait.webp", box: [-105, -20, 600, 900] },
      towers: TOWERS && {
        void: "32-hero-portal-portrait-void.webp",
        left: "30-hero-tower-left-portrait-alpha.webp",
        right: "31-hero-tower-right-portrait-alpha.webp",
        left_box: [-85, -20, 600, 900], right_box: [-173, -20, 600, 900],
      },
      depth: {
        far: { ky: 0.42, spread: 20, scale: 0.15, md: 4, opacity: 0.6 },
        mid: { ky: 0.24, spread: 52, scale: 0.55, md: 9, opacity: 1 },
        near: { ky: -0.06, spread: 100, scale: 1.2, md: 16, opacity: 1, blur: 4 },
      },
      cubes: [
        { depth: "far", src: CUBE20, box: [74, 150, 30, 30] },
        { depth: "far", src: CUBE19, box: [318, 548, 24, 24] },
        { depth: "mid", src: CUBE19, box: [24, 96, 66, 66] },
        { depth: "mid", src: CUBE20, box: [292, 104, 80, 80] },
        { depth: "mid", src: CUBE20, box: [268, 164, 30, 30] },
        { depth: "mid", src: CUBE19, box: [334, 470, 40, 40] },
        { depth: "near", src: STEP21, box: [8, 612, 120, 80] },
        { depth: "near", src: CUBE19, box: [288, 600, 86, 86] },
      ],
      copy: [
        { f: "jersey", x: 16, y: 216, w: 358, fs: 20, fw: 600, lh: 0.8, ls: 1.5, op: 0.9, align: "center", color: "#7F45F5", c: "ONE AI STUDIO.\nENDLESS POSSIBILITIES.", role: "anchor" },
        { f: "jersey", x: 16, y: 252, w: 358, fs: 88, fw: 800, lh: 0.78, align: "center", c: "BEYOND\nTHE CLICK.", role: "headline", tag: "h1" },
        { f: "jersey25", x: 30, y: 410, w: 330, fs: 20, fw: 400, lh: 1.05, align: "center", c: "We’re an AI-first game studio in Athens. We pair human creativity with AI to build mobile games with a world of their own.", role: "body", wrap: true },
        { f: "inter", x: 16, y: 570, w: 358, fs: 11, fw: 600, lh: 0.96, ls: 2, align: "center", c: "SCROLL INTO PLAY  ↓", role: "scroll" },
      ],
      nav: { logo: [16, 10, 72, 54], y: 28, fs: 15, x: [210, 265, 323] },
    },
    WORLDS: [
      {
        key: "shipduel", y: 720, h: 1080, bg: "#002C58", z: 20, scene: scene(-210),
        flatSrc: "12-shipduel-complete-scene.webp",
        // Re-staged for portrait: castle on top, Mara behind on the left, Rook in front on the right. No spray.
        layers: [
          { name: "plate", src: "25-shipduel-plate.webp", box: [0, 0, 1050, 700], k: -30, md: 3 },
          { name: "mara", src: "28-shipduel-mara-ship-alpha.webp", box: [150, 150, 300, 274], k: -20, kx: -30, md: 5, bob: [3, 1.2, 3.4] },
          { name: "rook", src: "27-shipduel-rook-ship-alpha.webp", box: [116, 230, 732, 488], k: 30, md: 8, rock: 3, bob: [4, 1.6, 2.8] },
        ],
        veil: fade("#002C58"),
        ...stack(520, ["shipduel-logo.webp", 246, 120], "MAKE YOUR\nNAME AT SEA.", "Changed seas. Unlikely captains.\nA name to make, one duel at a time.", 2,
          { main: "#FFFFFF", ink: "#06324F", backing: "#002C588C", game: "ShipDuel", items: SOON }),
      },
      {
        key: "tinyderby", y: 1660, h: 1080, bg: "#041B57", z: 30, scene: scene(-182),
        flatSrc: "15-tinyderby-complete-scene.webp",
        veil: fade("#041B57"),
        ...stack(500, ["tinyderby-logo.webp", 140, 140], "SMALL PLAYERS.\nBIG RIVALRIES.", "Take your shot.\nMake every move matter.", 2,
          { main: "#FFDB23", ink: "#071F55", backing: "#041B578C", game: "TinyDerby", items: SOON }),
      },
      {
        key: "boomboats", y: 2600, h: 1080, bg: "#020F3E", z: 40, scene: scene(-262),
        flatSrc: "13-boomboats-complete-scene.webp",
        veil: fade("#020F3E"),
        ...stack(466, ["boomboats-logo.webp", 190, 190], "YOUR MOVE\nMAKES WAVES.", "Plot your move. Make it count.", 1,
          { main: "#FFFFFF", ink: "#061A46", backing: "#020F3E8C", game: "BoomBoats", items: BOOMBOATS_STORES }),
      },
      {
        key: "dadline", y: 3540, h: 1080, bg: "#FFF0C8", z: 50, scene: scene(-578),
        flatSrc: "16-dadline-complete-scene-copyspace-v2.webp",
        veil: fade("#FFF0C8"),
        ...stack(520, ["dadline-logo.webp", 300, 122], "THE CITY HAS\nOTHER PLANS.", "The family has a list.\nStep into the everyday chaos.", 2,
          { main: "#09233B", ink: "#FFFFFF", backing: "#FFF0C88C", game: "DadLine", items: DADLINE_STORES }, "#09233B"),
      },
    ],
    CONTACT: {
      key: "footer", y: 4480, h: 940, bg: "#080B30", z: 60,
      copy: [
        { f: "jersey", x: 16, y: 100, w: 358, fs: 56, fw: 800, lh: 0.88, c: "LET'S MAKE\nTHE NEXT CHAPTER.", role: "headline", tag: "h2" },
        { f: "jersey25", x: 16, y: 212, w: 358, fs: 20, fw: 500, lh: 1.05, c: "Tell us what you want to build.\nWe reply within two working days.", role: "invite" },
        { f: "inter", x: 122, y: 806, w: 252, fs: 11, fw: 500, lh: 1.5, ls: 1, color: "#C9A8FF", c: "© 2026 THE LAST CLICK\nA NEW CHAPTER OF PLAY.", role: "legal" },
      ],
      logo: { src: "tlc-logo.webp", box: [16, 792, 88, 65] },
      form: { box: [16, 282, 358, 428], endpoint: ENDPOINT, field: 358, idea: 358, send: [190, 56, "M14 0L190 0L176 56L0 56Z"] },
    },
  };
})();

const LAYOUT = MOBILE ? PHONE : DESKTOP;
const { W: DESIGN_W, PAGE_H, COLS, CW, EXT, EDGE_TRAVEL, HERO, WORLDS, CONTACT } = LAYOUT;

// ---------- small DOM helpers ----------
const page = document.getElementById("page");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
let u = 1;

function div(cls, parent, css = "") {
  const d = document.createElement("div");
  d.className = cls;
  if (css) d.style.cssText = css;
  parent.append(d);
  return d;
}
function setBox(node, [x, y, w, h]) {
  node.classList.add("abs");
  node.style.setProperty("--x", x);
  node.style.setProperty("--y", y);
  node.style.setProperty("--w", w);
  node.style.setProperty("--h", h);
}
function image(parent, src, b) {
  const img = new Image();
  img.src = A + src;
  img.alt = "";
  img.decoding = "async";
  setBox(img, b);
  parent.append(img);
  return img;
}
function text(parent, s) {
  const p = document.createElement(s.tag || "p");
  p.className = `txt f-${s.f}`;
  p.style.cssText = `--x:${s.x};--y:${s.y};--w:${s.w};--fs:${s.fs};--lh:${s.lh};--ls:${s.ls || 0};font-weight:${s.fw};color:${s.color || "#FFFFFF"};text-align:${s.align || "left"};${s.op ? `opacity:${s.op};` : ""}`;
  if (s.wrap) p.textContent = s.c;
  else for (const line of s.c.split("\n")) {
    const l = document.createElement("span");
    l.className = "line";
    const inner = document.createElement("span");
    inner.textContent = line;
    l.append(inner);
    p.append(l);
  }
  if (s.role) p.dataset.role = s.role;
  parent.append(p);
  return p;
}
function cta(parent, s) {
  const a = document.createElement("a");
  a.href = "#";
  a.className = "cta";
  setBox(a, s.box);
  const [, , w, h] = s.box;
  a.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${s.path}" fill="${s.fill}"/></svg>`;
  text(a, { ...s.label, x: s.label.x - s.box[0], y: s.label.y - s.box[1] });
  parent.append(a);
  return a;
}
// piece = outer (scroll + pointer transform, set every frame) > intro (entrance tween) > bob (idle loop)
function piece(parent, b, cls = "") {
  const outer = div(`piece ${cls}`, parent);
  if (b) setBox(outer, b); else outer.classList.add("fill");
  const intro = div("bob", outer);
  const bob = div("bob", intro);
  return { outer, intro, bob };
}

// ---------- mask geometry (geometry-v3.json / geometry-mobile-v2.json from the Pencil masks) ----------
function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}
// A sweep across the columns (from the left, the right or the centre) with a little jitter,
// so the edge reads as voxels being stacked rather than random noise.
function edgeDelays(seed, from) {
  const r = seeded(seed);
  const last = COLS - 1, mid = last / 2;
  const dist = (i) => (from === "left" ? i / last : from === "right" ? (last - i) / last : Math.abs(i - mid) / mid);
  return Array.from({ length: COLS }, (_, i) => 0.42 * dist(i) + 0.08 * r());
}
function edgePolygon(top, totalH, p, delays, jit) {
  const pts = [];
  for (let i = 0; i < COLS; i++) {
    const q = clamp((p - delays[i]) / 0.5);
    const off = REDUCED ? 0 : Math.round(((1 - easeOut(q)) * EDGE_TRAVEL) / CW) * CW;
    const y = (Math.max(0, top[i] + off + (jit ? jit[i] : 0)) * u).toFixed(1);
    pts.push(`${(i * CW * u).toFixed(1)}px ${y}px`, `${((i + 1) * CW * u).toFixed(1)}px ${y}px`);
  }
  pts.push(`${(DESIGN_W * u).toFixed(1)}px ${(totalH * u).toFixed(1)}px`, `0px ${(totalH * u).toFixed(1)}px`);
  return `polygon(${pts.join(",")})`;
}

// ---------- living edges ----------
// While you scroll, every column of every stepped edge keeps shifting in half-column pixel steps,
// each column on its own rhythm. Each column has its own limits so a step never cuts copy:
// "down" stops above this world's logo/text, "up" stops below the previous world's text.
const { JIT_AMP, JIT_STEP, COPY_DRIFT, COPY_MARGIN } = LAYOUT;
const textRect = (s) => [s.x, s.y, s.x + s.w, s.y + (s.wrap ? 3 : s.c.split("\n").length) * s.fs * s.lh];
const boxRect = ([x, y, w, h]) => [x, y, x + w, y + h];
function copyRects(key) {
  if (key === "hero") return HERO.copy.map(textRect);
  if (key === "footer") return [...CONTACT.copy.map(textRect), boxRect(CONTACT.logo.box), boxRect(CONTACT.form.box)];
  const W = WORLDS.find((w) => w.key === key);
  return [boxRect(W.logo.box), textRect(W.head), textRect(W.body), boxRect(storesBox(W.stores))];
}
// advance = how far below the previous section this one starts (design units).
function edgeLimits(top, own, prev, advance) {
  const snap = (v) => clamp(Math.floor(v / JIT_STEP + 1e-6) * JIT_STEP, 0, JIT_AMP);
  const down = [], up = [];
  for (let i = 0; i < COLS; i++) {
    const hit = (r) => r[0] < (i + 1) * CW && r[2] > i * CW;
    const ownTop = Math.min(Infinity, ...own.filter(hit).map((r) => r[1] - COPY_DRIFT));
    const prevBottom = Math.max(-Infinity, ...prev.filter(hit).map((r) => r[3] + COPY_DRIFT));
    down.push(snap(ownTop - top[i] - COPY_MARGIN));
    up.push(snap(Math.min(top[i], advance + top[i] - prevBottom - COPY_MARGIN)));
  }
  return { down, up };
}
function livingEdge(top, ownKey, prevKey, advance, seed) {
  const { down, up } = edgeLimits(top, copyRects(ownKey), copyRects(prevKey), advance);
  const r = seeded(seed);
  const cols = Array.from({ length: COLS }, (_, i) => ({ a: r() * 6.283 + i * 0.55, b: r() * 6.283, sp: 0.75 + r() * 0.5 }));
  const out = new Array(COLS).fill(0);
  return (s) => {
    if (REDUCED) return out;
    const sd = s / u;
    for (let i = 0; i < COLS; i++) {
      const c = cols[i];
      const f = 0.62 * Math.sin(sd * 0.0105 * c.sp + c.a) + 0.38 * Math.sin(sd * 0.024 * c.sp + c.b);
      out[i] = Math.round((f >= 0 ? f * down[i] : f * up[i]) / JIT_STEP) * JIT_STEP;
    }
    return out;
  };
}

// ---------- build ----------
const movers = []; // functions (ctx) => void, run every frame
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const fmt = (n) => n.toFixed(2);

function section(key, y, h, bg, z, ext = EXT) {
  const s = document.createElement("section");
  s.className = "sec";
  s.dataset.key = key;
  s.id = key === "hero" ? "studio" : key === "footer" ? "contact" : key;
  s.style.cssText = `top:calc(${y} * var(--u));height:calc(${h + ext} * var(--u));background:${bg};z-index:${z}`;
  page.append(s);
  return s;
}

function buildHero(geo) {
  const H = HERO;
  const sec = section("hero", H.y, H.h, H.bg, 10);
  const overlay = div("overlay", page, `top:0;z-index:25`);
  const t = H.towers;

  const plate = piece(sec, null);
  image(plate.bob, t ? t.void : H.plate.src, H.plate.box);
  const towers = t ? [["left", -1], ["right", 1]].map(([side, dir]) => {
    const p = piece(sec, null);
    image(p.bob, t[side], t[`${side}_box`]);
    return { ...p, dir };
  }) : [];

  const DEPTH = H.depth;
  const cubes = H.cubes.map((c, i) => {
    const d = DEPTH[c.depth];
    // Near cubes sit above the next section so they can fly past its stepped edge.
    const host = c.depth === "near" ? overlay : sec;
    const p = piece(host, c.box);
    p.outer.style.opacity = d.opacity;
    image(p.bob, c.src, [0, 0, c.box[2], c.box[3]]);
    const dir = Math.sign(c.box[0] + c.box[2] / 2 - DESIGN_W / 2);
    if (!REDUCED && !STILL) gsap.to(p.bob, {
      yPercent: gsap.utils.random(6, 12) * (i % 2 ? 1 : -1),
      rotation: gsap.utils.random(-6, 6),
      duration: gsap.utils.random(2.6, 4.4),
      ease: "sine.inOut", yoyo: true, repeat: -1, delay: gsap.utils.random(0, 2),
    });
    return { ...p, d, dir, depth: c.depth };
  });

  const copy = div("copy", sec);
  const nav = document.createElement("nav");
  nav.className = "fill";
  copy.append(nav);
  image(nav, "tlc-logo.webp", H.nav.logo).dataset.role = "nav";
  NAV.forEach(([label, href], i) => {
    const a = document.createElement("a");
    a.href = href;
    nav.append(a);
    text(a, { f: "barlow", x: H.nav.x[i], y: H.nav.y, w: 100, fs: H.nav.fs, fw: 800, lh: 0.96, c: label, role: "nav" });
  });
  const texts = H.copy.map((s) => text(copy, s));
  const button = H.cta ? cta(copy, H.cta) : null;

  movers.push(({ s, vh }) => {
    const p = clamp(s / (H.h * u), 0, 1.4);
    const e = easeOut(clamp(p));
    const mx = pointer.x * H.pm, my = pointer.y * H.pm;
    plate.outer.style.transform = `translate3d(${fmt(mx * 8 * u)}px,${fmt(s * 0.5 + my * 6 * u)}px,0) scale(${fmt(1 + 0.14 * p)})`;
    for (const tw of towers) {
      tw.outer.style.transform = `translate3d(${fmt(tw.dir * H.part * p * u + mx * 16 * u)}px,${fmt(s * 0.4 + my * 10 * u)}px,0) scale(${fmt(1 + 0.22 * p)})`;
    }
    for (const c of cubes) {
      const { d } = c;
      const x = c.dir * d.spread * e * u + mx * d.md * u;
      const y = s * d.ky + my * d.md * 0.6 * u;
      c.outer.style.transform = `translate3d(${fmt(x)}px,${fmt(y)}px,0) scale(${fmt(1 + d.scale * p)})`;
      if (d.blur) c.outer.style.filter = p > 0.02 ? `blur(${fmt(d.blur * p * u)}px)` : "";
    }
    copy.style.transform = `translate3d(${fmt(-mx * 5 * u)}px,${fmt(s * 0.22 - my * 3 * u)}px,0)`;
    copy.style.opacity = fmt(1 - clamp((p - 0.12) / 0.45));
  });

  return { sec, plate, towers, cubes, texts, button, nav };
}

function buildWorld(W, geo, index) {
  const sec = section(W.key, W.y, W.h, W.bg, W.z);
  const top = geo.masks.find((m) => m.name === W.key).top;
  const delays = edgeDelays(97 + index * 131, ["left", "right", "center", "left"][index]);
  const [sx, sy, sw, sh] = W.scene;
  const sceneCss = `left:calc(${sx} * var(--u));top:calc(${sy} * var(--u));width:calc(${sw} * var(--u));height:calc(${sh} * var(--u));right:auto;bottom:auto`;
  const scene = div("layer", sec, sceneCss);
  const parts = [];

  if (W.layers && W.layers.every((l) => l.box)) {
    for (const L of W.layers) {
      const host = L.overlay ? div("overlay", page, `top:calc(${W.y} * var(--u));z-index:${W.z + 15}`) : scene;
      const holder = L.overlay
        ? div("layer", host, sceneCss)
        : host;
      const p = piece(holder, L.box);
      const img = image(p.bob, L.src, [0, 0, L.box[2], L.box[3]]);
      // The spray image ends in a straight cut: fade its left end and its lower body so only the crest
      // reaches past the pixel edge into the next world.
      if (L.fade) {
        const m = "linear-gradient(to right, transparent 0%, #000 32%), linear-gradient(to bottom, #000 0%, #000 60%, transparent 76%)";
        img.style.maskImage = img.style.webkitMaskImage = m;
        img.style.maskComposite = "intersect";
        img.style.webkitMaskComposite = "source-in";
      }
      if (!REDUCED && !STILL && L.bob) gsap.to(p.bob, { yPercent: L.bob[0], rotation: L.bob[1], duration: L.bob[2], ease: "sine.inOut", yoyo: true, repeat: -1 });
      if (!REDUCED && !STILL && L.sway) gsap.to(p.bob, { x: () => L.sway * u, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      parts.push({ ...p, L });
    }
  } else {
    const p = piece(scene, [0, 0, sw, sh]);
    image(p.bob, W.flatSrc, [0, 0, sw, sh]);
    parts.push({ ...p, L: LAYOUT.flat });
  }

  const veil = div("piece", sec);
  setBox(veil, W.veil.box);
  veil.style.background = W.veil.bg;

  const copy = div("copy", sec);
  const logoWrap = div("piece", copy);
  setBox(logoWrap, W.logo.box);
  image(logoWrap, W.logo.src, [0, 0, W.logo.box[2], W.logo.box[3]]);
  const h = text(copy, W.head);
  const b = text(copy, W.body);
  const button = storeButtons(copy, W.stores, W.key);
  const idx = W.index ? text(copy, W.index) : null;

  const prev = index === 0 ? HERO : WORLDS[index - 1];
  const jitter = livingEdge(top, W.key, index === 0 ? "hero" : prev.key, W.y - prev.y, 311 + index * 97);
  let lastKey = "";
  movers.push(({ s, vh }) => {
    const topPx = W.y * u - s;
    if (!STILL && (topPx > vh + 40 || topPx + (W.h + EXT) * u < -40)) return;
    const d = topPx + (W.h * u) / 2 - vh / 2;
    // t runs from 1 (section just entering at the bottom) to -1 (just leaving at the top), whatever the
    // window shape, so every travel below is in design units and stays inside the scene overscan.
    const t = STILL ? 0 : clamp(d / ((vh + W.h * u) / 2), -1, 1);
    const mx = pointer.x, my = pointer.y;
    // k < 0: the layer lags behind the page (far); k > 0: it overtakes the page (near). Units: design px at t = ±1.
    for (const part of parts) {
      const L = part.L;
      const x = (L.kx || 0) * t * u + mx * L.md * u;
      const y = L.k * t * u + my * L.md * 0.6 * u;
      const zoom = L.zoom ? 1 + L.zoom * Math.abs(t) : 1;
      const rot = L.rock ? L.rock * t : 0;
      part.outer.style.transform = `translate3d(${fmt(x)}px,${fmt(y)}px,0) rotate(${fmt(rot)}deg) scale(${fmt(zoom)})`;
    }
    copy.style.transform = `translate3d(${fmt(-mx * 4 * u)}px,${fmt(-LAYOUT.COPY_T * t * u - my * 3 * u)}px,0)`;
    // The edge is fully built once the section top reaches 70% of the viewport, before its copy reveals;
    // after that its columns keep moving with the scroll.
    const p = STILL ? 1 : clamp((vh - topPx) / (vh * 0.3));
    const jit = STILL ? null : jitter(s);
    const key = `${p.toFixed(3)}|${jit ? jit.join(",") : ""}`;
    if (key !== lastKey) {
      lastKey = key;
      sec.style.clipPath = edgePolygon(top, W.h + EXT, p, delays, jit);
    }
  });

  return { sec, logo: logoWrap, head: h, body: b, button, index: idx };
}

function buildContact(geo) {
  const C = CONTACT;
  const sec = section(C.key, C.y, C.h, C.bg, C.z, 0);
  const top = geo.masks.find((m) => m.name === "footer").top;
  const delays = edgeDelays(4242, "center");
  const copy = div("copy", sec);
  const texts = C.copy.map((s) => text(copy, s));
  const logo = div("piece", copy);
  setBox(logo, C.logo.box);
  image(logo, C.logo.src, [0, 0, C.logo.box[2], C.logo.box[3]]);
  const form = contactForm(copy, C.form);
  const last = WORLDS[WORLDS.length - 1];
  const jitter = livingEdge(top, "footer", last.key, C.y - last.y, 977);
  let lastKey = "";
  movers.push(({ s, vh }) => {
    const topPx = C.y * u - s;
    if (!STILL && topPx > vh + 40) return;
    const p = STILL ? 1 : clamp((vh - topPx) / (vh * 0.3));
    const jit = STILL ? null : jitter(s);
    const key = `${p.toFixed(3)}|${jit ? jit.join(",") : ""}`;
    if (key !== lastKey) {
      lastKey = key;
      sec.style.clipPath = edgePolygon(top, C.h, p, delays, jit);
    }
  });
  return { sec, texts, logo, form };
}


// ---------- store buttons (tlc.pen · comp/StoreButton YMGqW, mobile rY9dD) ----------
// Our diagonal button in place of the official badges. Live stores link out; "coming soon" ones are
// outlined, sit on a translucent backing and are not links.
const { w: STORE_W, h: STORE_H, gap: STORE_GAP, path: STORE_PATH } = LAYOUT.store;
const ICONS = {
  apple: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04c-2.04.027-3.91 1.183-4.961 3.014c-2.117 3.675-.546 9.103 1.519 12.09c1.013 1.454 2.208 3.09 3.792 3.039c1.52-.065 2.09-.987 3.935-.987c1.831 0 2.35.987 3.96.948c1.637-.026 2.676-1.48 3.676-2.948c1.156-1.688 1.636-3.325 1.662-3.415c-.039-.013-3.182-1.221-3.22-4.857c-.026-3.04 2.48-4.494 2.597-4.559c-1.429-2.09-3.623-2.324-4.39-2.376c-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83c-1.207.052-2.662.805-3.532 1.818c-.78.896-1.454 2.338-1.273 3.714c1.338.104 2.715-.688 3.559-1.701",
  play: "m22.018 13.298l-3.919 2.218l-3.515-3.493l3.543-3.521l3.891 2.202a1.49 1.49 0 0 1 0 2.594M1.337.924a1.5 1.5 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087zm12.207 10.065l3.258-3.238L3.45.195a1.47 1.47 0 0 0-.946-.179zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54z",
};
const STORE_NAME = { apple: "APP STORE", play: "GOOGLE PLAY" };
const storesBox = (S) => [S.x, S.y, S.items.length * STORE_W + (S.items.length - 1) * STORE_GAP, STORE_H];
function storeButtons(parent, S, key) {
  return S.items.map((it, i) => {
    const live = Boolean(it.href);
    const el = document.createElement(live ? "a" : "span");
    el.className = `store${live ? "" : " is-soon"}`;
    setBox(el, [S.x + i * (STORE_W + STORE_GAP), S.y, STORE_W, STORE_H]);
    el.style.setProperty("--main", S.main);
    el.style.setProperty("--ink", live ? S.ink : S.main);
    el.style.setProperty("--face", live ? S.main : S.backing);
    const kicker = live ? (it.store === "apple" ? "DOWNLOAD ON THE" : "GET IT ON") : "COMING SOON TO";
    if (live) {
      el.href = it.href;
      el.target = "_blank";
      el.rel = "noopener";
      el.setAttribute("aria-label", `${S.game} on ${it.store === "apple" ? "the App Store" : "Google Play"}`);
      el.addEventListener("click", () => window.gtag?.("event", "store_click", { game: key, store: it.store }));
    } else {
      el.setAttribute("aria-label", `Coming soon to ${it.store === "apple" ? "the App Store" : "Google Play"}`);
    }
    el.innerHTML = `<svg class="st-shape" viewBox="0 0 ${STORE_W} ${STORE_H}" preserveAspectRatio="none" aria-hidden="true"><path d="${STORE_PATH}"/></svg>
      <svg class="st-icon st-icon--${it.store}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[it.store]}"/></svg>
      <span class="st-text"><small>${kicker}</small><b>${STORE_NAME[it.store]}</b></span>`;
    parent.append(el);
    return el;
  });
}

// ---------- contact form ----------
// Layers on this side: the ticket must be fetched first (signed by the Worker), the post waits until
// the ticket is a few seconds old, a hidden honeypot field, client checks, and Turnstile when the
// Worker announces a site key. The Worker repeats every check; nothing here is trusted.
function contactForm(parent, F) {
  const form = document.createElement("form");
  form.className = "cform";
  form.noValidate = true;
  setBox(form, F.box);
  form.style.height = "auto";
  // Fields share the buttons' slant (a quarter of the height), drawn as an SVG behind a transparent input.
  const slab = (w, h) => {
    const k = h * 0.25, d = `M${k + 1} 1L${w - 1} 1L${w - k - 1} ${h - 1}L1 ${h - 1}Z`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="cf-shadow" d="${d}"/><path class="cf-face" d="${d}"/></svg>`;
  };
  form.innerHTML = `
    <div class="cf-row">
      <label class="cf-field"><span>NAME</span><i class="cf-box">${slab(F.field, 52)}<input name="name" type="text" autocomplete="name" maxlength="100" placeholder="Your name" required></i></label>
      <label class="cf-field"><span>EMAIL</span><i class="cf-box">${slab(F.field, 52)}<input name="email" type="email" autocomplete="email" maxlength="180" placeholder="you@studio.com" required></i></label>
    </div>
    <label class="cf-field"><span>THE IDEA</span><i class="cf-box cf-box--tall">${slab(F.idea, 130)}<textarea name="message" maxlength="3000" placeholder="A game, a world, a character… tell us a little." required></textarea></i></label>
    <div class="cf-honey" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
    <div class="cf-turnstile"></div>
    <div class="cf-actions">
      <button type="submit" class="cf-send"><svg viewBox="0 0 ${F.send[0]} ${F.send[1]}" preserveAspectRatio="none" aria-hidden="true"><path d="${F.send[2]}"/></svg><b>SEND IT  →</b></button>
      <p class="cf-note" role="status" aria-live="polite">No spam, no newsletter.<br>Just a reply from us.</p>
    </div>`;
  parent.append(form);
  const note = form.querySelector(".cf-note");
  const label = form.querySelector(".cf-send b");
  const defaultNote = note.innerHTML;
  let ticket = null, ticketAt = 0, sending = false, turnstileToken = "";

  const getTicket = async () => {
    const r = await fetch(`${F.endpoint}/contact/ticket`, { credentials: "omit" });
    const j = await r.json();
    if (!j.ok) throw new Error("ticket");
    ticket = j;
    ticketAt = performance.now();
    if (j.turnstile && !form.dataset.ts) mountTurnstile(j.turnstile);
  };
  const mountTurnstile = (siteKey) => {
    form.dataset.ts = "1";
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.onload = () => window.turnstile.render(form.querySelector(".cf-turnstile"), {
      sitekey: siteKey, size: "flexible", theme: "dark", appearance: "interaction-only",
      callback: (t) => (turnstileToken = t),
    });
    document.head.append(s);
  };
  // Ask for a ticket as the footer approaches; a bot that posts blindly has none.
  new IntersectionObserver((entries, io) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); getTicket().catch(() => {}); }
  }, { rootMargin: "600px" }).observe(form);

  const say = (html, state = "") => { note.innerHTML = html; form.dataset.state = state; };
  const mark = (names) => form.querySelectorAll("input, textarea").forEach((el) => el.closest(".cf-field")?.classList.toggle("bad", names.includes(el.name)));

  form.addEventListener("input", () => { if (form.dataset.state === "error") { say(defaultNote); mark([]); } });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const v = (k) => String(data[k] || "").trim();
    const bad = [];
    if (v("name").length < 2) bad.push("name");
    if (!/^[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}$/i.test(v("email"))) bad.push("email");
    if (v("message").length < 10) bad.push("message");
    mark(bad);
    if (bad.length) return say("A name, a real email and a few words about the idea.", "error");

    sending = true;
    label.textContent = "SENDING…";
    say("&nbsp;", "busy");
    try {
      if (!ticket) await getTicket();
      const wait = 3300 - (performance.now() - ticketAt);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      const post = () => fetch(`${F.endpoint}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: ticket.t, sig: ticket.sig, name: v("name"), email: v("email"), message: v("message"), website: v("website"), turnstile: turnstileToken }),
      });
      let r = await post();
      let j = await r.json().catch(() => ({}));
      if (r.status === 403 && (j.error === "ticket" || j.error === "expired")) {
        await getTicket();
        await new Promise((res) => setTimeout(res, 3300));
        r = await post();
        j = await r.json().catch(() => ({}));
      }
      if (r.ok && j.ok) {
        window.gtag?.("event", "contact_submit", { method: "contact_form" });
        form.reset();
        label.textContent = "SENT  ✓";
        say("Received. We read everything and<br>reply within two working days.", "sent");
        ticket = null;
        getTicket().catch(() => {});
      } else if (r.status === 422) {
        mark(j.fields || []);
        label.textContent = "SEND IT  →";
        say("A name, a real email and a few words about the idea.", "error");
      } else if (r.status === 429) {
        label.textContent = "SEND IT  →";
        say("Easy there — try again in a minute.", "error");
      } else throw new Error(j.error || r.status);
    } catch {
      label.textContent = "SEND IT  →";
      say("That didn’t go through. Try again in a moment.", "error");
    } finally {
      sending = false;
    }
  });
  return form;
}

// ---------- entrances ----------
function heroIntro(hero) {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from(hero.plate.intro, { scale: 1.12, autoAlpha: 0, duration: 1.8 }, 0);
  hero.towers.forEach((tw) => tl.from(tw.intro, { xPercent: tw.dir * 18, autoAlpha: 0, duration: 1.6 }, 0.1));
  hero.cubes.forEach((c, i) => tl.from(c.intro, {
    y: () => -(c.depth === "near" ? 420 : c.depth === "mid" ? 300 : 180) * u,
    rotation: gsap.utils.random(-40, 40), scale: 0.4, autoAlpha: 0, duration: 1.5,
  }, 0.25 + i * 0.07));
  const byRole = (r) => hero.texts.find((t) => t.dataset.role === r);
  tl.from(hero.nav.children, { y: () => -24 * u, autoAlpha: 0, stagger: 0.06, duration: 0.9 }, 0.3);
  tl.from(byRole("anchor"), { autoAlpha: 0, duration: 0.4 }, 0.45);
  byRole("anchor").querySelectorAll(".line > span").forEach((line) => {
    tl.to(line, { scrambleText: { text: line.textContent, chars: "upperCase", speed: 0.6 }, duration: 1.1 }, 0.45);
  });
  byRole("headline").querySelectorAll(".line > span").forEach((line, i) => {
    tl.from(line, { yPercent: 105, duration: 1.1 }, 0.55 + i * 0.12)
      .to(line, { scrambleText: { text: line.textContent, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", speed: 0.5, revealDelay: 0.25 }, duration: 1.1 }, 0.55 + i * 0.12);
  });
  tl.from(byRole("body"), { y: () => 26 * u, autoAlpha: 0, duration: 1 }, 0.95);
  tl.from(byRole("scroll"), { autoAlpha: 0, y: () => 12 * u, duration: 0.8 }, 1.25);
  gsap.to(byRole("scroll"), { y: () => 6 * u, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.2 });
}

function worldReveal(w) {
  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    scrollTrigger: { trigger: w.sec, start: "top 60%", toggleActions: "play none none reverse" },
  });
  tl.from(w.logo, { scale: 0.55, rotation: -8, autoAlpha: 0, duration: 0.9, ease: "back.out(1.8)" }, 0);
  tl.from(w.head.querySelectorAll(".line > span"), { yPercent: 110, duration: 0.9, stagger: 0.09 }, 0.12);
  tl.from(w.body.querySelectorAll(".line > span"), { yPercent: 110, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 0.3);
  tl.from(w.button, { clipPath: "inset(0 100% 0 0)", duration: 0.7, ease: "power3.inOut", stagger: 0.12 }, 0.42);
  tl.from(w.button.map((b) => b.querySelector(".st-text")), { x: () => -14 * u, autoAlpha: 0, duration: 0.6, stagger: 0.12 }, 0.62);
  if (w.index) tl.from(w.index, { autoAlpha: 0, duration: 0.2 }, 0.5)
    .to(w.index.querySelector(".line > span"), { scrambleText: { text: w.index.textContent, chars: "0123456789/", speed: 0.5 }, duration: 0.9 }, 0.5);
}

function contactReveal(c) {
  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    scrollTrigger: { trigger: c.sec, start: "top 65%", toggleActions: "play none none reverse" },
  });
  tl.from(c.texts[0].querySelectorAll(".line > span"), { yPercent: 110, duration: 0.9, stagger: 0.1 }, 0.05);
  tl.from(c.texts.slice(1), { autoAlpha: 0, y: () => 16 * u, stagger: 0.1, duration: 0.8 }, 0.35);
  tl.from(c.logo, { scale: 0.6, rotation: 10, autoAlpha: 0, duration: 1, ease: "back.out(1.6)" }, 0.2);
  tl.from(c.form.querySelectorAll(".cf-field, .cf-actions"), { autoAlpha: 0, y: () => 18 * u, stagger: 0.08, duration: 0.8 }, 0.3);
}

// ---------- pixel boot loader (tlc.pen · 07 LOADER / PIXEL BOOT) ----------
// Real progress: fonts + every page image decoded. The logo rebuilds itself cell by cell, the bar fills
// in 12 steps, then the panel lifts in edge-column steps (centre first) while the hero intro plays.
function bootLoader() {
  const el = document.getElementById("loader");
  const cellsHost = el.querySelector(".ld-cells");
  const segs = [...el.querySelectorAll(".ld-bar i")];
  const pct = el.querySelector(".ld-pct");
  const GRID_C = 11, GRID_R = 9, CELL = 20, LOGO_H = 163;
  const cells = [];
  for (let r = 0; r < GRID_R; r++) for (let c = 0; c < GRID_C; c++) {
    if (r * CELL >= LOGO_H) continue;
    const b = document.createElement("b");
    b.style.left = `calc(${c * CELL} * var(--lu))`;
    b.style.top = `calc(${r * CELL} * var(--lu))`;
    b.style.backgroundPosition = `calc(${-c * CELL} * var(--lu)) calc(${-r * CELL} * var(--lu))`;
    cellsHost.append(b);
    cells.push(b);
  }
  const rnd = seeded(4242);
  const order = cells.map((b) => [rnd(), b]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

  let total = 1, loaded = 0, shown = 0, lit = 0, segLit = 0, started = performance.now();
  let resolveDone;
  const done = new Promise((r) => (resolveDone = r));
  const MIN_MS = 1300, MAX_MS = 9000;

  const tick = (time, dt) => {
    const target = performance.now() - started > MAX_MS ? 1 : loaded / total;
    // Never faster than MIN_MS end to end, never backwards.
    shown = Math.min(target, shown + dt / MIN_MS);
    const wantCells = Math.floor(shown * order.length);
    while (lit < wantCells) order[lit++].classList.add("on");
    const wantSegs = Math.floor(shown * 12 + 1e-6);
    while (segLit < wantSegs) segs[segLit++].classList.add("on");
    pct.textContent = `${String(Math.floor(shown * 100)).padStart(3, "0")}%`;
    if (shown >= 1) { gsap.ticker.remove(tick); resolveDone(); }
  };
  gsap.ticker.add(tick);

  return {
    done,
    track(promises) {
      total = promises.length;
      promises.forEach((p) => Promise.resolve(p).finally(() => loaded++));
    },
    exit(onLift) {
      const content = el.querySelector(".ld-content");
      const mid = (COLS - 1) / 2;
      const delays = Array.from({ length: COLS }, (_, i) => 0.42 * (Math.abs(i - mid) / mid) + 0.06 * rnd());
      const lift = { p: 0 };
      const step = CW * u;
      // A 4px lavender rim (the bar's colour) follows the stepped edge so it reads against the dark hero.
      const rim = document.createElement("div");
      rim.id = "loader-rim";
      document.body.append(rim);
      const draw = () => {
        const vh = innerHeight, w = innerWidth, cw = w / COLS;
        const pts = [`0px 0px`, `${w}px 0px`], rimPts = [`0px 0px`, `${w}px 0px`];
        const rimH = Math.max(3, 4 * u);
        for (let i = COLS - 1; i >= 0; i--) {
          const q = clamp((lift.p - delays[i]) / 0.52);
          const y = Math.max(0, Math.round((vh * (1 - q * q)) / step) * step);
          const yr = y > 0 ? y + rimH : 0;
          pts.push(`${((i + 1) * cw).toFixed(1)}px ${y.toFixed(1)}px`, `${(i * cw).toFixed(1)}px ${y.toFixed(1)}px`);
          rimPts.push(`${((i + 1) * cw).toFixed(1)}px ${yr.toFixed(1)}px`, `${(i * cw).toFixed(1)}px ${yr.toFixed(1)}px`);
        }
        el.style.clipPath = `polygon(${pts.join(",")})`;
        rim.style.clipPath = `polygon(${rimPts.join(",")})`;
      };
      const tl = gsap.timeline({ onComplete: () => { el.remove(); rim.remove(); document.documentElement.classList.remove("is-booting"); } });
      tl.to(el.querySelector(".ld-logo"), { y: () => -10 * u, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, 0.2)
        .to(content, { y: () => -40 * u, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0.5)
        .add(onLift, 0.62)
        .to(lift, { p: 1, duration: 1.05, ease: "none", onUpdate: draw }, 0.62);
      return tl;
    },
  };
}

// ---------- run ----------
async function exists(src) {
  try { return (await fetch(A + src, { method: "HEAD" })).ok; } catch { return false; }
}

// Crossing between the phone and desktop layouts (rotating a phone, resizing a window) rebuilds the page:
// remember how far down the reader was, reload, and skip the loader on the way back.
const RELAYOUT = "tlc-relayout";
function takeRelayout() {
  try {
    const v = JSON.parse(sessionStorage.getItem(RELAYOUT) || "null");
    sessionStorage.removeItem(RELAYOUT);
    return v && Date.now() - v.at < 15000 ? v : null;
  } catch { return null; }
}
function relayout() {
  try {
    const max = document.documentElement.scrollHeight - innerHeight;
    sessionStorage.setItem(RELAYOUT, JSON.stringify({ f: max > 0 ? scrollY / max : 0, at: Date.now() }));
  } catch {}
  location.reload();
}

// Mouse moves the parallax on desktop; on touch screens the device tilt does (iOS asks once, on a tap).
// The first reading is the neutral pose, and it drifts slowly toward the current grip.
function trackPointer() {
  if (REDUCED || STILL) return;
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / innerHeight) * 2 - 1;
    });
    return;
  }
  const RANGE = 22; // degrees of tilt for the full parallax
  let neutral = null;
  const onTilt = (e) => {
    if (e.beta === null || e.gamma === null) return;
    const landscape = innerWidth > innerHeight;
    const lr = landscape ? e.beta : e.gamma, fb = landscape ? -e.gamma : e.beta;
    if (!neutral) neutral = { lr, fb };
    neutral.lr += (lr - neutral.lr) * 0.01;
    neutral.fb += (fb - neutral.fb) * 0.01;
    pointer.tx = clamp((lr - neutral.lr) / RANGE, -1, 1);
    pointer.ty = clamp((fb - neutral.fb) / RANGE, -1, 1);
  };
  const listen = () => addEventListener("deviceorientation", onTilt, { passive: true });
  const DOE = window.DeviceOrientationEvent;
  if (typeof DOE?.requestPermission === "function") {
    // Chrome answers straight away; iOS needs a tap, so a refused call is retried on each touch
    // until the visitor has answered once.
    let asked = false;
    const ask = () => DOE.requestPermission().then((state) => {
      removeEventListener("touchend", ask);
      if (state === "granted" && !asked) listen();
      asked = true;
    }).catch(() => {});
    addEventListener("touchend", ask, { passive: true });
    ask();
  } else if (DOE) listen();
}

async function main() {
  const back = takeRelayout();
  const boot = REDUCED || STILL || back ? null : bootLoader();
  const geo = await (await fetch(LAYOUT.geometry)).json();
  if (HERO.towers && !(await exists(HERO.towers.left))) HERO.towers = null;
  for (const W of WORLDS) if (W.layers && !(await exists(W.layers[0].src))) W.layers = null;

  const resize = () => {
    u = document.documentElement.clientWidth / DESIGN_W;
    document.documentElement.style.setProperty("--u", `${u}px`);
  };
  resize();
  page.style.setProperty("--page-h", PAGE_H);

  const hero = buildHero(geo);
  const worlds = WORLDS.map((W, i) => buildWorld(W, geo, i));
  const contact = buildContact(geo);

  const waits = [document.fonts.ready, ...[...page.querySelectorAll("img")].map((img) => img.decode().catch(() => {}))];
  if (boot) { boot.track(waits); await boot.done; } else await Promise.all(waits);

  const lenis = REDUCED || STILL ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: true });
  const frame = () => {
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    const ctx = { s: lenis ? lenis.scroll : window.scrollY, vh: window.innerHeight };
    for (const m of movers) m(ctx);
  };
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  gsap.ticker.add(frame);
  trackPointer();
  let lastW = document.documentElement.clientWidth;
  addEventListener("resize", () => {
    if (!params.has("mobile") && !params.has("desktop") && wantMobile() !== MOBILE) return relayout();
    // Phone toolbars only change the height; the layout depends on the width alone.
    const w = document.documentElement.clientWidth;
    if (w === lastW) return;
    lastW = w;
    resize();
    ScrollTrigger.refresh();
  });

  document.body.classList.remove("is-loading");
  frame();
  const dropLoader = () => {
    document.getElementById("loader").remove();
    document.documentElement.classList.remove("is-booting");
  };
  if (!REDUCED && !STILL) {
    if (boot) {
      lenis.stop();
      boot.exit(() => { heroIntro(hero); lenis.start(); });
    } else dropLoader();
    worlds.forEach(worldReveal);
    contactReveal(contact);
  } else dropLoader();
  if (back) {
    const y = back.f * (document.documentElement.scrollHeight - innerHeight);
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  }
  frame();
  window.__tlc = { lenis, gsap, ScrollTrigger, mobile: MOBILE };
}

main();
