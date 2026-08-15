/**
 * The tower's colour system.
 *
 * Deliberately tiny: eight lit colours and two emissive accents, all derived
 * from the brand tokens in globals.css. The 8-bit read depends on this
 * discipline as much as it depends on the posterize shader — a voxel scene
 * with a continuous palette just looks like low-poly.
 *
 * Plain hex strings, not THREE.Color, so this module can be imported from
 * server components without dragging three into the server graph.
 */

/** Ordered darkest → lightest. Index is the material slot in the scene. */
export const PALETTE = [
  "#080b30", // 0 void      — deepest shadow, undersides
  "#13083f", // 1 shell     — shaft structure in shadow
  "#1d0a5c", // 2 deep
  "#25006f", // 3 base      — brand background
  "#3a12a6", // 4 mid
  "#4b13d1", // 5 bright    — brand purple
  "#7b43ff", // 6 violet    — lit faces
  "#a77cff", // 7 lavender  — highlights
] as const;

export type PaletteIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Self-lit accents. These bypass lighting entirely (MeshBasicMaterial). */
export const EMISSIVE = {
  signal: "#c9a8ff",
  hot: "#ffffff",
} as const;

/**
 * Scroll-keyed colour grading.
 *
 * Each stop is a full palette plus fog and background. Between stops the scene
 * lerps every slot per frame, which costs eight Color.lerp calls — cheap
 * because the palette is shared material state, not per-instance colour.
 *
 * The arc: open sky at the top, deepening as you descend, then warming into
 * lavender at the bottom so the vault floor feels like arriving somewhere
 * rather than bottoming out in the dark.
 */
export interface ThemeStop {
  t: number;
  palette: readonly string[];
  fog: string;
  background: string;
}

export const THEME_STOPS: ThemeStop[] = [
  {
    t: 0,
    palette: PALETTE,
    fog: "#2a0a7d",
    background: "#25006f",
  },
  {
    t: 0.3,
    palette: ["#06081f", "#0e0630", "#170847", "#1d0a5c", "#2f0e88", "#4111b8", "#6a35e8", "#9a6cff"],
    fog: "#1a0757",
    background: "#18004d",
  },
  {
    t: 0.62,
    palette: ["#04061a", "#0a0526", "#120638", "#180749", "#260b70", "#360d9c", "#5c2ad4", "#8f5eff"],
    fog: "#100540",
    background: "#0e0436",
  },
  {
    t: 1,
    palette: ["#0a0730", "#150a4c", "#200e68", "#2b1288", "#3d1cb0", "#5325d8", "#8358ff", "#c3a4ff"],
    fog: "#2a1180",
    background: "#1d0a5c",
  },
];
