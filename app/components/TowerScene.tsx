"use client";

import { useEffect } from "react";
import * as THREE from "three";

import { FLOORS, floorY } from "../lib/floors";
import { EMISSIVE, PALETTE, THEME_STOPS } from "../lib/palette";

/**
 * The tower.
 *
 * A fixed WebGL canvas sits behind the document while normal HTML scrolls over
 * it. Scroll progress flies a perspective camera DOWN a square voxel shaft.
 *
 * The camera looks HORIZONTALLY and descends. It deliberately does not look
 * down the shaft axis: that produces a mushy tunnel with nowhere legible to put
 * text. Looking forward while falling is the Downwell / Ice Climber framing.
 *
 * THE DISPLAY TYPE LIVES IN THE SCENE. Headings are rendered to canvas textures
 * and hung in world space at each floor, so they take real perspective, real
 * fog, real parallax, and get wiped by the foreground beams. The DOM keeps a
 * copy of every word for search engines, screen readers and the no-WebGL path;
 * when the scene is live that copy is visually hidden and the 3D text is what
 * you read. Body copy stays in the DOM — it has to be selectable — but is
 * pushed by the same pointer parallax so it belongs to the same space.
 *
 * Everything is procedural. There are no 3D assets to download.
 *
 * This is the only module allowed to import three; see the no-restricted-imports
 * rule in eslint.config.mjs.
 */

/* -------------------------------------------------------------------------- */
/* tuning                                                                      */
/* -------------------------------------------------------------------------- */

const BACK_WALL_Z = -14;
const CAMERA_REST_Z = 7.5;
const SHAFT_HALF_WIDTH = 17;
const SHAFT_FRONT_Z = 10;

const SKY_HEADROOM = 20;
const FLOOR_UNDERRUN = 26;

const SCROLL_SMOOTHING = 0.22;
const PARALLAX_SMOOTHING = 0.055;

const CONVEYOR_COUNT = 40;
const COIN_COUNT = 22;

type Box = [x: number, y: number, z: number, sx: number, sy: number, sz: number];

/** Copy that is drawn into the scene. Mirrors the DOM in page.tsx. */
const FLOOR_TEXT: Record<string, { eyebrow: string; title: string[] }> = {
  hero: { eyebrow: "", title: [] },
  services: { eyebrow: "What we build", title: ["Three things,", "done properly."] },
  proof: { eyebrow: "Track record", title: ["Shipped,", "not shelved."] },
  process: { eyebrow: "How we work", title: ["Four gates,", "in order."] },
  contact: { eyebrow: "", title: ["Let's build what", "should exist next."] },
};

export default function TowerScene() {
  useEffect(() => {
    const canvas = document.getElementById("tower-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const debug = new URLSearchParams(window.location.search).has("debug");

    /* ---------------------------------------------------------------- setup */

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      document.body.classList.add("no-webgl");
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let mobile = window.innerWidth < 720;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const world = new THREE.Group();
    scene.add(world);

    const camera = new THREE.PerspectiveCamera(
      mobile ? 62 : 55,
      window.innerWidth / window.innerHeight,
      0.5,
      400,
    );
    camera.position.set(0, SKY_HEADROOM * 0.4, CAMERA_REST_Z);

    const fog = new THREE.Fog(0x2a0a7d, 34, 120);
    scene.fog = fog;
    scene.background = new THREE.Color(0x25006f);

    /* ------------------------------------------------------------ resources */

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const keepGeometry = <T extends THREE.BufferGeometry>(g: T) => (geometries.push(g), g);
    const keepMaterial = <T extends THREE.Material>(m: T) => (materials.push(m), m);

    /**
     * Real lighting, banded into five steps. This is what makes lit voxels read
     * as 8-bit rather than as generic low-poly: normals and falloff are genuine,
     * the output is quantized. If the shader chunk ever moves the patch is
     * skipped rather than producing a black screen — hence the guard, and hence
     * the exact version pin in package.json.
     */
    const posterize = (material: THREE.Material) => {
      material.onBeforeCompile = (shader) => {
        const anchor = "#include <dithering_fragment>";
        if (!shader.fragmentShader.includes(anchor)) return;
        if (!shader.fragmentShader.includes("gl_FragColor")) return;
        shader.fragmentShader = shader.fragmentShader.replace(
          anchor,
          `${anchor}\n\tgl_FragColor.rgb = floor( gl_FragColor.rgb * 5.0 + 0.5 ) / 5.0;`,
        );
      };
      material.customProgramCacheKey = () => "tlc-posterize-v1";
      return material;
    };

    const litMaterials = PALETTE.map(
      (hex) =>
        keepMaterial(
          posterize(
            new THREE.MeshLambertMaterial({ color: new THREE.Color(hex), flatShading: true }),
          ),
        ) as THREE.MeshLambertMaterial,
    );

    const unitBox = keepGeometry(new THREE.BoxGeometry(1, 1, 1));

    // Scratch objects shared by every instance writer in this scene.
    const instanced: THREE.InstancedMesh[] = [];
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const spin = new THREE.Euler();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();

    scene.add(new THREE.AmbientLight(0x5a34c8, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(-0.6, 1, 0.75);
    scene.add(key);
    const uplight = new THREE.DirectionalLight(0x9a6cff, 0.7);
    uplight.position.set(0.4, -1, 0.5);
    scene.add(uplight);

    /* ----------------------------------------------------------------- text */

    /**
     * next/font mangles family names at build time, so the only reliable way to
     * use the same faces on a canvas is to ask the document what they resolved
     * to.
     */
    const resolveFont = (variable: string, fallback: string) => {
      const probe = document.createElement("span");
      probe.style.fontFamily = `var(${variable})`;
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).fontFamily;
      probe.remove();
      return resolved || fallback;
    };

    const displayFont = resolveFont("--font-jersey", "sans-serif");

    /**
     * FOUR WAYS TO PUT THE TITLES IN THE WORLD.
     *
     * Selected with ?mode=sky|carved|assemble|dom so they can be compared
     * live on the same shaft. None of them uses a box, a card or a frame — the
     * brief was explicit about that. Every mode shares one rasteriser (the real
     * display font drawn to a canvas) and differs only in where the type lives
     * and how it moves:
     *
     *  sky      — enormous type deep BEHIND the wall, like a skyline. The
     *             mosaic and platforms pass in front of it with parallax and
     *             occlude it as you fall. Legible because it is huge.
     *  carved   — type extruded OUT OF the back wall as raised voxel relief; the
     *             wall is flattened to dark stone around it and only the letters
     *             stand proud, separated by light and shadow alone.
     *  assemble — the letters are loose voxels drifting in the shaft that fly
     *             together into words as their floor comes into view, then
     *             scatter again as you leave. Driven by scroll, so reversible.
     *  dom      — no 3D type at all; the HTML headings stay, and the effort goes
     *             into the floors themselves being real game scenes.
     */
    type TitleMode = "sky" | "carved" | "assemble" | "dom";
    const params = new URLSearchParams(window.location.search);
    const rawMode = params.get("mode");
    const titleMode: TitleMode =
      rawMode === "sky" || rawMode === "carved" || rawMode === "assemble" || rawMode === "dom"
        ? rawMode
        : "sky";
    document.body.dataset.titleMode = titleMode;

    /** Rasterises lines of display type. Returns lit cells at a given cell size. */
    const rasterTitle = (lines: string[], fontPx: number, cell: number) => {
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return null;
      probe.font = `${fontPx}px ${displayFont}`;
      const lineWidths = lines.map((line) => probe.measureText(line.toUpperCase()).width);
      const width = Math.ceil(Math.max(...lineWidths)) + cell * 2;
      const lineH = Math.round(fontPx * 1.05);
      const height = lineH * lines.length + cell * 2;

      const surface = document.createElement("canvas");
      surface.width = width;
      surface.height = height;
      const ctx = surface.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.font = `${fontPx}px ${displayFont}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#fff";
      lines.forEach((line, i) => ctx.fillText(line.toUpperCase(), cell, cell + i * lineH));

      const data = ctx.getImageData(0, 0, width, height).data;
      const cells: [number, number][] = [];
      const half = Math.floor(cell / 2);
      for (let y = 0; y + half < height; y += cell) {
        for (let x = 0; x + half < width; x += cell) {
          if (data[((y + half) * width + (x + half)) * 4 + 3] >= 128) {
            cells.push([x / cell, y / cell]);
          }
        }
      }
      return { cells, cols: Math.ceil(width / cell), rows: Math.ceil(height / cell), lineWidths, width };
    };

    /** A crisp canvas texture of the type, for the modes that want a plane. */
    const textureTitle = (lines: string[], fontPx: number, colour: string) => {
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return null;
      probe.font = `${fontPx}px ${displayFont}`;
      const width = Math.ceil(Math.max(...lines.map((l) => probe.measureText(l.toUpperCase()).width))) + 16;
      const lineH = Math.round(fontPx * 1.02);
      const height = lineH * lines.length + 16;
      const surface = document.createElement("canvas");
      surface.width = width;
      surface.height = height;
      const ctx = surface.getContext("2d");
      if (!ctx) return null;
      ctx.font = `${fontPx}px ${displayFont}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = colour;
      lines.forEach((line, i) => ctx.fillText(line.toUpperCase(), 8, 8 + i * lineH));
      const texture = new THREE.CanvasTexture(surface);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      textures.push(texture);
      return { texture, aspect: height / width };
    };

    interface TitleHandle {
      /** Root of everything this title added. */
      root: THREE.Object3D;
      /** For assemble mode: the moving letter voxels and their rest poses. */
      cells?: THREE.InstancedMesh;
      rest?: Float32Array;
      seeds?: Float32Array;
      count?: number;
      floorIndex: number;
      side: "left" | "right" | "center";
    }
    const titles: TitleHandle[] = [];

    const skyMaterial = keepMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    );

    const carveFace = keepMaterial(
      new THREE.MeshLambertMaterial({ color: 0xf4efff, flatShading: true }),
    );
    const carveSide = keepMaterial(
      new THREE.MeshLambertMaterial({ color: new THREE.Color(PALETTE[6]), flatShading: true }),
    );
    const assembleMaterial = keepMaterial(
      new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, fog: false }),
    );

    /* --- sky ---------------------------------------------------------------- */
    const buildSky = (lines: string[], floorIndex: number, side: "left" | "right" | "center") => {
      const tex = textureTitle(lines, 160, "#ffffff");
      if (!tex) return;
      // Half the shaft wide, deep behind the back wall, so wall geometry
      // occludes it and parallax makes it drift slower than the mosaic.
      // Wide enough to dominate the frame, small enough that a two-line
      // heading is read as a phrase rather than as one word at a time.
      const width = 26;
      const geometry = keepGeometry(new THREE.PlaneGeometry(width, width * tex.aspect));
      const material = skyMaterial.clone();
      material.map = tex.texture;
      material.opacity = 0.92;
      keepMaterial(material);
      const mesh = new THREE.Mesh(geometry, material);
      // Sit the type in the half of the frame the copy is NOT in.
      const x = side === "left" ? 5 : side === "right" ? -5 : 0;
      mesh.position.set(x, floorY(floorIndex) + 3, BACK_WALL_Z - 9);
      mesh.renderOrder = -1;
      world.add(mesh);
      titles.push({ root: mesh, floorIndex, side });
    };

    /* --- carved ------------------------------------------------------------- */
    const buildCarved = (lines: string[], floorIndex: number, side: "left" | "right" | "center") => {
      const raster = rasterTitle(lines, 40, 4);
      if (!raster) return;
      const unit = 0.5; // world units per text cell
      const w = raster.cols * unit;
      const h = raster.rows * unit;
      // On the side of the shaft the copy is NOT in.
      const cx = side === "left" ? 5.5 : side === "right" ? -5.5 : 0;
      const top = floorY(floorIndex) + 3 + h / 2;

      const group = new THREE.Group();
      // Flat dark stone behind the relief so nothing else in the mosaic
      // competes with the letters. Sits just proud of the backing plane.
      const stone = new THREE.Mesh(unitBox, litMaterials[0]);
      stone.scale.set(w + 6, h + 4, 1.2);
      stone.position.set(cx, top - h / 2, BACK_WALL_Z + 0.2);
      group.add(stone);

      const face = new THREE.InstancedMesh(unitBox, carveFace, raster.cells.length);
      const sides = new THREE.InstancedMesh(unitBox, carveSide, raster.cells.length);
      face.frustumCulled = sides.frustumCulled = false;
      raster.cells.forEach(([gx, gy], i) => {
        const x = cx - w / 2 + (gx + 0.5) * unit;
        const y = top - (gy + 0.5) * unit;
        // Face block stands 2.2 proud of the stone.
        position.set(x, y, BACK_WALL_Z + 0.8 + 1.1);
        scale.set(unit, unit, 2.2);
        matrix.compose(position, quaternion, scale);
        face.setMatrixAt(i, matrix);
        // A darker step behind each cell reads as the letter's side wall.
        position.set(x + unit * 0.35, y - unit * 0.35, BACK_WALL_Z + 0.8 + 0.5);
        scale.set(unit, unit, 1.0);
        matrix.compose(position, quaternion, scale);
        sides.setMatrixAt(i, matrix);
      });
      face.instanceMatrix.needsUpdate = sides.instanceMatrix.needsUpdate = true;
      group.add(sides, face);
      instanced.push(face, sides);
      world.add(group);
      titles.push({ root: group, floorIndex, side });
    };

    /* --- assemble ----------------------------------------------------------- */
    const buildAssemble = (lines: string[], floorIndex: number, side: "left" | "right" | "center") => {
      const raster = rasterTitle(lines, 40, 4);
      if (!raster) return;
      const unit = 0.5;
      const w = raster.cols * unit;
      const h = raster.rows * unit;
      const cx = side === "left" ? 5.5 : side === "right" ? -5.5 : 0;
      const top = floorY(floorIndex) + 3 + h / 2;
      // Just in front of the wall furniture, well behind the camera.
      const z = BACK_WALL_Z + 6;

      const count = raster.cells.length;
      const rest = new Float32Array(count * 3);
      const seeds = new Float32Array(count * 4);
      raster.cells.forEach(([gx, gy], i) => {
        rest[i * 3] = cx - w / 2 + (gx + 0.5) * unit;
        rest[i * 3 + 1] = top - (gy + 0.5) * unit;
        rest[i * 3 + 2] = z;
        // Where this voxel drifts when the word is apart: a wide random cloud.
        seeds[i * 4] = (hashScalar(i, 1) - 0.5) * 30;
        seeds[i * 4 + 1] = (hashScalar(i, 2) - 0.5) * 26;
        seeds[i * 4 + 2] = -3 + hashScalar(i, 3) * 8;
        seeds[i * 4 + 3] = hashScalar(i, 4);
      });

      const cells = new THREE.InstancedMesh(unitBox, assembleMaterial, count);
      cells.frustumCulled = false;
      world.add(cells);
      instanced.push(cells);
      titles.push({ root: cells, cells, rest, seeds, count, floorIndex, side });
    };

    const hashScalar = (i: number, salt: number) => {
      let h = (i * 374761393 + salt * 668265263) >>> 0;
      h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };

    /** Called every frame in assemble mode. */
    const animateAssemble = (progress: number) => {
      for (let t = 0; t < titles.length; t += 1) {
        const title = titles[t];
        if (!title.cells || !title.rest || !title.seeds || !title.count) continue;
        // 0 when the floor is centred, 1 when a whole floor away.
        const away = THREE.MathUtils.clamp(
          Math.abs(progress - floorProgressCentre[title.floorIndex]) / floorProgressSpan,
          0,
          1,
        );
        // Snap together over the middle third of the approach.
        const gather = 1 - THREE.MathUtils.smootherstep(away, 0.18, 0.62);
        for (let i = 0; i < title.count; i += 1) {
          const rx = title.rest[i * 3];
          const ry = title.rest[i * 3 + 1];
          const rz = title.rest[i * 3 + 2];
          const sx = title.seeds[i * 4];
          const sy = title.seeds[i * 4 + 1];
          const sz = title.seeds[i * 4 + 2];
          const phase = title.seeds[i * 4 + 3];
          const drift = 1 - gather;
          position.set(
            rx + sx * drift + Math.sin(clock.elapsedTime * 0.7 + phase * 6.3) * drift * 0.6,
            ry + sy * drift,
            rz + sz * drift,
          );
          spin.set(drift * phase * 6, drift * 4 + phase, 0);
          quaternion.setFromEuler(spin);
          const s = 0.5 * (0.55 + gather * 0.45);
          scale.set(s, s, s);
          matrix.compose(position, quaternion, scale);
          title.cells.setMatrixAt(i, matrix);
        }
        quaternion.identity();
        title.cells.instanceMatrix.needsUpdate = true;
      }
    };


    /* ------------------------------------------------------------- geometry */

    const buckets: Box[][] = PALETTE.map(() => []);
    const box = (colour: number, b: Box) => buckets[colour].push(b);

    const topY = SKY_HEADROOM;
    const bottomY = floorY(FLOORS.length - 1) - FLOOR_UNDERRUN;

    /** Deterministic — the tower must be the same building on every reload. */
    const hash = (i: number, j: number) => {
      let h = (i * 374761393 + j * 668265263) >>> 0;
      h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };

    // --- the shaft ---------------------------------------------------------

    /**
     * The zone around every floor's heading. What happens there depends on the
     * title mode:
     *  sky     — the wall OPENS: no backing, mosaic thinned to a scatter, so the
     *            giant type behind is seen through the gaps in the masonry.
     *  carved  — the relief supplies its own flat stone; mosaic thinned.
     *  others  — mosaic thinned so bright cells never sit behind the type.
     */
    const inQuietZone = (x: number, y: number) => {
      for (let i = 0; i < FLOORS.length; i += 1) {
        const side = FLOORS[i].side;
        const cy = floorY(i) + 4;
        const cx = side === "left" ? 5.5 : side === "right" ? -5.5 : 0;
        const halfW = titleMode === "sky" ? 20 : side === "center" ? 15 : 12;
        const halfH = titleMode === "sky" ? 11 : 8;
        if (Math.abs(y - cy) < halfH && Math.abs(x - cx) < halfW) return true;
      }
      return false;
    };

    // Backing plane, in 2-unit bands so it can be omitted where the sky
    // titles need to show through.
    for (let y = topY; y >= bottomY; y -= 2) {
      if (titleMode === "sky" && inQuietZone(0, y)) {
        // Keep the very edges so the shaft still reads as enclosed.
        box(0, [-SHAFT_HALF_WIDTH - 1, y, BACK_WALL_Z - 1.5, 4, 2, 1]);
        box(0, [SHAFT_HALF_WIDTH + 1, y, BACK_WALL_Z - 1.5, 4, 2, 1]);
        continue;
      }
      box(0, [0, y, BACK_WALL_Z - 1.5, SHAFT_HALF_WIDTH * 2 + 4, 2, 1]);
    }

    const COLS = 9;
    for (let col = -COLS; col <= COLS; col += 1) {
      for (let y = topY; y >= bottomY; y -= 2) {
        const row = Math.round(y / 2);
        const r = hash(col, row);
        if (r < 0.44) continue;
        if (inQuietZone(col * 2, y) && r < (titleMode === "sky" ? 0.82 : 0.9)) continue;
        const band = Math.abs(row) % 8;
        const depth = r < 0.62 ? 0.4 : r < 0.85 ? 1.3 : 2.4;
        let colour = r < 0.62 ? 1 : r < 0.85 ? 2 : 4;
        if (band === 0) colour = 5;
        box(colour, [col * 2, y, BACK_WALL_Z + depth, 2, 2, depth * 2]);
      }
    }

    for (let y = topY; y >= bottomY; y -= 4) {
      const beat = Math.abs(Math.round(y / 4)) % 4 === 0;
      const ribColour = beat ? 4 : 2;
      const midZ = (BACK_WALL_Z + SHAFT_FRONT_Z) / 2;
      const ribDepth = SHAFT_FRONT_Z - BACK_WALL_Z;
      box(ribColour, [-SHAFT_HALF_WIDTH, y, midZ, 2, 4, ribDepth]);
      box(ribColour, [SHAFT_HALF_WIDTH, y, midZ, 2, 4, ribDepth]);
      if (beat) {
        box(6, [-SHAFT_HALF_WIDTH + 1.5, y, midZ + 2, 1, 2, 4]);
        box(6, [SHAFT_HALF_WIDTH - 1.5, y, midZ + 2, 1, 2, 4]);
      }
    }

    // --- far silhouettes, glimpsed through the gaps -------------------------
    for (let y = topY; y >= bottomY; y -= 9) {
      const r = hash(7, Math.round(y));
      const x = (r - 0.5) * 26;
      const height = 6 + r * 12;
      box(0, [x, y, BACK_WALL_Z - 5, 3 + r * 4, height, 2]);
      box(0, [x + 6, y - 4, BACK_WALL_Z - 6, 2, height * 0.6, 2]);
    }

    // --- service pipes -----------------------------------------------------
    [-13.5, 13.5].forEach((x, side) => {
      for (let y = topY; y >= bottomY; y -= 2) {
        box(2, [x, y, BACK_WALL_Z + 3.5, 1, 2, 1]);
        if (Math.abs(Math.round(y)) % 10 === (side === 0 ? 0 : 4)) {
          box(4, [x, y, BACK_WALL_Z + 3.7, 2, 1, 2]);
        }
      }
    });

    // --- a maintenance ladder ----------------------------------------------
    for (let y = topY; y >= bottomY; y -= 2) box(4, [-16, y, BACK_WALL_Z + 5, 3, 0.6, 0.6]);
    for (let y = topY; y >= bottomY; y -= 8) {
      box(2, [-17.2, y, BACK_WALL_Z + 5, 0.6, 8, 0.6]);
      box(2, [-14.8, y, BACK_WALL_Z + 5, 0.6, 8, 0.6]);
    }

    // --- platforms, alternating sides — the platformer read ----------------
    for (let i = 0; i < 26; i += 1) {
      const y = topY - 6 - i * 9;
      if (y < bottomY) break;
      const left = i % 2 === 0;
      const x = left ? -12 : 12;
      const width = 8 + hash(i, 3) * 4;
      box(1, [x, y, BACK_WALL_Z + 6, width, 1.5, 7]);
      for (let s = -Math.floor(width / 2); s <= Math.floor(width / 2); s += 2) {
        box(s % 4 === 0 ? 7 : 1, [x + s, y + 1.1, BACK_WALL_Z + 9, 2, 0.6, 1]);
      }
      box(1, [x + (left ? -width / 2 : width / 2) * 0.7, y - 2.5, BACK_WALL_Z + 4, 1.5, 4, 3]);
    }

    // --- the sky lobby -----------------------------------------------------
    box(3, [0, SKY_HEADROOM - 5, BACK_WALL_Z + 10, 26, 2, 16]);
    box(5, [0, SKY_HEADROOM - 4, BACK_WALL_Z + 10, 22, 1, 12]);
    for (let s = -12; s <= 12; s += 2) {
      box(s % 4 === 0 ? 7 : 1, [s, SKY_HEADROOM - 3.4, BACK_WALL_Z + 18, 2, 0.8, 1]);
    }

    // --- the workshop ------------------------------------------------------
    const workshopY = floorY(1);
    [6, 11, 16].forEach((x, index) => {
      const height = 5 + index;
      const baseY = workshopY - 1;
      box(1, [x, baseY + height / 2, BACK_WALL_Z + 2.5, 4.4, height, 5]);
      box(4, [x, baseY + height / 2, BACK_WALL_Z + 5.2, 3, height - 2, 1]);
      box(7, [x, baseY + height - 1.5, BACK_WALL_Z + 5.8, 2, 1.6, 1]);
      box(1, [x - 1.6, baseY - 1.5, BACK_WALL_Z + 2.5, 1, 3, 5]);
      box(1, [x + 1.6, baseY - 1.5, BACK_WALL_Z + 2.5, 1, 3, 5]);
      box(2, [x + 2, baseY + height + 1, BACK_WALL_Z + 2.5, 1, 3, 1]);
    });
    box(2, [11, workshopY - 3.5, BACK_WALL_Z + 6, 20, 1, 2.4]);
    box(4, [11, workshopY - 3, BACK_WALL_Z + 6, 20, 0.4, 2.8]);

    // --- the near layer: beams that whip past ------------------------------
    for (let y = topY; y >= bottomY; y -= 18) {
      box(0, [0, y, CAMERA_REST_Z - 3.5, SHAFT_HALF_WIDTH * 2 + 6, 1.6, 2]);
      box(1, [0, y - 1.4, CAMERA_REST_Z - 3.5, SHAFT_HALF_WIDTH * 2 + 6, 0.5, 2.4]);
      for (let x = -15; x <= 15; x += 5) box(2, [x, y, CAMERA_REST_Z - 2.2, 1, 1, 1]);
    }

    /* --------------------------------------------------- build the instances */

    buckets.forEach((boxes, colour) => {
      if (boxes.length === 0) return;
      const mesh = new THREE.InstancedMesh(unitBox, litMaterials[colour], boxes.length);
      mesh.frustumCulled = false;
      boxes.forEach(([x, y, z, sx, sy, sz], i) => {
        position.set(x, y, z);
        scale.set(sx, sy, sz);
        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      world.add(mesh);
      instanced.push(mesh);
    });

    // --- chevrons pointing down the shaft ----------------------------------
    const chevronCells: [x: number, y: number, group: number][] = [];
    for (let g = 0; g < 40; g += 1) {
      const baseY = topY - 4 - g * 7;
      if (baseY < bottomY) break;
      for (let arm = -2; arm <= 2; arm += 1) {
        chevronCells.push([arm * 1.1, baseY - Math.abs(arm) * 1.1, g]);
      }
    }

    const chevronMaterial = keepMaterial(
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, fog: false }),
    );
    const chevrons = new THREE.InstancedMesh(unitBox, chevronMaterial, chevronCells.length);
    chevrons.frustumCulled = false;
    chevrons.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(chevronCells.length * 3),
      3,
    );
    chevronCells.forEach(([x, y], i) => {
      position.set(x, y, BACK_WALL_Z + 3);
      scale.set(0.9, 0.9, 0.4);
      matrix.compose(position, quaternion, scale);
      chevrons.setMatrixAt(i, matrix);
    });
    chevrons.instanceMatrix.needsUpdate = true;
    world.add(chevrons);
    instanced.push(chevrons);

    // --- collectibles marking the route ------------------------------------
    const coinAnchors: [x: number, y: number][] = [];
    for (let i = 0; i < COIN_COUNT; i += 1) {
      const y = topY - 8 - i * 8;
      if (y < bottomY) break;
      coinAnchors.push([Math.sin(i * 0.8) * 12, y]);
    }
    const coinMaterial = keepMaterial(
      posterize(new THREE.MeshLambertMaterial({ color: new THREE.Color(EMISSIVE.signal) })),
    );
    const coins = new THREE.InstancedMesh(unitBox, coinMaterial, coinAnchors.length);
    coins.frustumCulled = false;
    world.add(coins);
    instanced.push(coins);

    // --- the assembly line: the only geometry rewritten per frame -----------
    const conveyor = new THREE.InstancedMesh(unitBox, litMaterials[6], CONVEYOR_COUNT);
    conveyor.frustumCulled = false;
    conveyor.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(CONVEYOR_COUNT * 3),
      3,
    );
    world.add(conveyor);
    instanced.push(conveyor);

    const rawColour = new THREE.Color(PALETTE[3]);
    const doneColour = new THREE.Color(EMISSIVE.signal);
    const partColour = new THREE.Color();
    const chevronColour = new THREE.Color();
    const chevronDim = new THREE.Color(PALETTE[4]);
    const chevronLit = new THREE.Color(EMISSIVE.hot);

    /* ------------------------------------------------------ hang the titles */

    /**
     * Titles are placed in WORLD space at their floor's Y, inside the rotating
     * world group — they are scenery, not overlays. The scroll model below
     * guarantees a floor's Y is centred on screen exactly when its HTML copy
     * is, so the 3D title and the DOM body land together without projecting
     * anything from the DOM.
     */
    const buildText = () => {
      if (titleMode === "dom") return;
      FLOORS.forEach((floor, index) => {
        const copy = FLOOR_TEXT[floor.id];
        if (!copy || copy.title.length === 0) return;
        if (titleMode === "sky") buildSky(copy.title, index, floor.side);
        else if (titleMode === "carved") buildCarved(copy.title, index, floor.side);
        else buildAssemble(copy.title, index, floor.side);
      });
    };

    /** Scroll progress at which each floor's copy is centred; filled by measure(). */
    const floorProgressCentre: number[] = FLOORS.map(() => 0);
    let floorProgressSpan = 0.2;

    /* --------------------------------------------------------- scroll model */

    let anchors: { p: number; y: number }[] = [];
    let viewportHeight = window.innerHeight;

    const measure = () => {
      const scrollMax = document.documentElement.scrollHeight - viewportHeight;
      if (scrollMax <= 0) {
        anchors = [{ p: 0, y: 0 }];
        return;
      }
      const next: { p: number; y: number }[] = [];
      FLOORS.forEach((floor, index) => {
        const inner = document.querySelector<HTMLElement>(
          `[data-floor="${floor.id}"] .floor-inner`,
        );
        if (!inner) return;
        const rect = inner.getBoundingClientRect();
        const centre = rect.top + window.scrollY + rect.height / 2;
        const p = THREE.MathUtils.clamp((centre - viewportHeight / 2) / scrollMax, 0, 1);
        next.push({ p, y: floorY(index) });
        floorProgressCentre[index] = p;
      });
      if (next.length >= 2) {
        anchors = next;
        // Typical distance between floors in progress space, for the assemble
        // window. Median-ish: the middle pair.
        const mid = Math.floor(next.length / 2);
        floorProgressSpan = Math.max(0.05, next[mid].p - next[mid - 1].p);
      }
    };

    const mapY = (p: number) => {
      if (anchors.length === 0) return 0;
      if (anchors.length === 1) return anchors[0].y;
      if (p <= anchors[0].p) {
        const [a, b] = anchors;
        const span = b.p - a.p || 1;
        return a.y + ((p - a.p) / span) * (b.y - a.y);
      }
      for (let i = 0; i < anchors.length - 1; i += 1) {
        const a = anchors[i];
        const b = anchors[i + 1];
        if (p <= b.p) {
          const span = b.p - a.p || 1;
          return THREE.MathUtils.lerp(a.y, b.y, (p - a.p) / span);
        }
      }
      const a = anchors[anchors.length - 2];
      const b = anchors[anchors.length - 1];
      const span = b.p - a.p || 1;
      return b.y + ((p - b.p) / span) * (b.y - a.y);
    };

    let targetProgress = 0;
    let smoothProgress = 0;

    const readProgress = () => {
      const scrollMax = document.documentElement.scrollHeight - viewportHeight;
      targetProgress = scrollMax > 0 ? THREE.MathUtils.clamp(window.scrollY / scrollMax, 0, 1) : 0;
    };

    /* ------------------------------------------------------------- parallax */

    const parallax = new THREE.Vector2();
    const parallaxTarget = new THREE.Vector2();
    const bodies = Array.from(document.querySelectorAll<HTMLElement>(".floor-inner"));

    const onPointerMove = (event: PointerEvent) => {
      parallaxTarget.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    const onPointerLeave = () => parallaxTarget.set(0, 0);

    /* ---------------------------------------------------------- theme grade */

    const themeColours = PALETTE.map(() => new THREE.Color());
    const fogColour = new THREE.Color();
    const backgroundColour = new THREE.Color();
    const stopColours = THEME_STOPS.map((stop) => ({
      palette: stop.palette.map((hex) => new THREE.Color(hex)),
      fog: new THREE.Color(stop.fog),
      background: new THREE.Color(stop.background),
    }));

    const applyTheme = (p: number) => {
      let index = 0;
      while (index < THEME_STOPS.length - 2 && p > THEME_STOPS[index + 1].t) index += 1;
      const a = THEME_STOPS[index];
      const b = THEME_STOPS[index + 1];
      const span = b.t - a.t || 1;
      const t = THREE.MathUtils.clamp((p - a.t) / span, 0, 1);
      const ca = stopColours[index];
      const cb = stopColours[index + 1];
      for (let i = 0; i < themeColours.length; i += 1) {
        themeColours[i].copy(ca.palette[i]).lerp(cb.palette[i], t);
        litMaterials[i].color.copy(themeColours[i]);
      }
      fog.color.copy(fogColour.copy(ca.fog).lerp(cb.fog, t));
      (scene.background as THREE.Color).copy(
        backgroundColour.copy(ca.background).lerp(cb.background, t),
      );
    };

    /* ------------------------------------------------------------ lifecycle */

    const onResize = () => {
      const nextHeight = window.innerHeight;
      if (Math.abs(nextHeight - viewportHeight) > 80) viewportHeight = nextHeight;
      mobile = window.innerWidth < 720;
      camera.fov = mobile ? 62 : 55;
      camera.aspect = window.innerWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
      renderer.setSize(window.innerWidth, nextHeight, false);
      measure();
      readProgress();
    };

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };

    const clock = new THREE.Clock();
    let frames = 0;
    let frameAccumulator = 0;

    const tick = () => {
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      smoothProgress += (targetProgress - smoothProgress) * (reducedMotion ? 1 : SCROLL_SMOOTHING);
      parallax.lerp(parallaxTarget, reducedMotion ? 1 : PARALLAX_SMOOTHING);
      const eased = smoothProgress;

      // Pitch driven by scroll VELOCITY, not position: scroll fast and the
      // camera leans into the dive, stop and it settles. The speed term is free
      // — it is the lerp residual.
      const descentSpeed = Math.abs(targetProgress - smoothProgress);
      const lookAhead = 2.2 + THREE.MathUtils.clamp(descentSpeed * 26, 0, 9);

      camera.position.y = mapY(eased);
      camera.position.x = Math.sin(eased * Math.PI * 3.7) * 1.6 + parallax.x * 0.9;
      camera.position.z = CAMERA_REST_Z + Math.sin(eased * Math.PI * 2.3) * 1.4 + parallax.y * 0.35;
      camera.lookAt(
        camera.position.x * -0.2 + parallax.x * 1.4,
        camera.position.y - lookAhead,
        BACK_WALL_Z,
      );
      camera.rotation.z = Math.sin(eased * Math.PI * 4.3) * 0.016 - parallax.x * 0.01;

      world.rotation.y = eased * 0.18;
      fog.near = 34 + Math.sin(eased * Math.PI) * 8;
      applyTheme(eased);

      if (titleMode === "assemble") animateAssemble(eased);

      // DOM body copy is pushed by the same pointer parallax, so the words and
      // the shaft feel like one space rather than two layers.
      const px = parallax.x * -14;
      const py = parallax.y * -8;
      for (let i = 0; i < bodies.length; i += 1) {
        bodies[i].style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      if (!reducedMotion) {
        for (let i = 0; i < CONVEYOR_COUNT; i += 1) {
          const t = (elapsed * 0.09 + i / CONVEYOR_COUNT) % 1;
          const x = 1 + t * 18;
          const size = 0.7 + Math.sin(t * Math.PI) * 0.35;
          position.set(x, workshopY - 2.5 + Math.sin(t * Math.PI * 3) * 0.25, BACK_WALL_Z + 6);
          scale.setScalar(size);
          matrix.compose(position, quaternion, scale);
          conveyor.setMatrixAt(i, matrix);
          partColour.copy(rawColour).lerp(doneColour, THREE.MathUtils.smootherstep(t, 0.25, 0.8));
          conveyor.setColorAt(i, partColour);
        }
        conveyor.instanceMatrix.needsUpdate = true;
        if (conveyor.instanceColor) conveyor.instanceColor.needsUpdate = true;

        for (let i = 0; i < coinAnchors.length; i += 1) {
          const [x, y] = coinAnchors[i];
          spin.set(0, elapsed * 2.1 + i, 0);
          quaternion.setFromEuler(spin);
          position.set(x, y + Math.sin(elapsed * 1.6 + i) * 0.35, BACK_WALL_Z + 9);
          scale.set(1.5, 1.5, 0.3);
          matrix.compose(position, quaternion, scale);
          coins.setMatrixAt(i, matrix);
        }
        quaternion.identity();
        coins.instanceMatrix.needsUpdate = true;

        // Chevrons fire in sequence, like a runway.
        for (let i = 0; i < chevronCells.length; i += 1) {
          const phase = (elapsed * 1.6 - chevronCells[i][2] * 0.25) % 1;
          const lit = phase > 0 && phase < 0.28 ? 1 : 0.12;
          chevronColour.copy(chevronDim).lerp(chevronLit, lit);
          chevrons.setColorAt(i, chevronColour);
        }
        if (chevrons.instanceColor) chevrons.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (debug) {
        frames += 1;
        frameAccumulator += delta;
        if (frameAccumulator > 0.5) {
          const info = renderer.info.render;
          const overlay = document.getElementById("tower-debug");
          if (overlay) {
            overlay.textContent =
              `${Math.round(frames / frameAccumulator)} fps · ${info.calls} calls · ` +
              `${info.triangles.toLocaleString()} tris · p=${smoothProgress.toFixed(3)} ` +
              `y=${camera.position.y.toFixed(1)}`;
          }
          frames = 0;
          frameAccumulator = 0;
        }
      }
    };

    /* ----------------------------------------------------------------- boot */

    if (debug) {
      const overlay = document.createElement("div");
      overlay.id = "tower-debug";
      document.body.appendChild(overlay);
    }

    document.body.classList.add("scene-live");
    measure();
    readProgress();
    applyTheme(0);
    smoothProgress = targetProgress;
    onResize();

    // Titles are drawn with the real web fonts, so they must wait for them.
    let textReady = false;
    const drawTextWhenReady = () => {
      if (textReady) return;
      textReady = true;
      buildText();
      // In dom mode the HTML headings ARE the titles; leave them visible.
      if (titleMode !== "dom") document.body.classList.add("scene-text");
    };
    if (document.fonts?.status === "loaded") drawTextWhenReady();
    document.fonts?.ready.then(() => {
      drawTextWhenReady();
      measure();
      readProgress();
    });

    renderer.setAnimationLoop(tick);

    const onVisibility = () => {
      renderer.setAnimationLoop(document.hidden ? null : tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      readProgress();
    });
    const main = document.querySelector("main");
    if (main) resizeObserver.observe(main);

    window.addEventListener("scroll", readProgress, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("scroll", readProgress);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      resizeObserver.disconnect();

      document.body.classList.remove("scene-live", "scene-text");
      document.getElementById("tower-debug")?.remove();
      bodies.forEach((element) => element.style.removeProperty("transform"));

      instanced.forEach((mesh) => mesh.dispose());
      textures.forEach((texture) => texture.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas id="tower-canvas" aria-hidden="true" role="presentation" tabIndex={-1} />
      <div className="bloom-veil" aria-hidden="true" />
    </>
  );
}
