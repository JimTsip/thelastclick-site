/**
 * The tower, as data.
 *
 * This module is the single source of truth for how many floors exist, how tall
 * each one is, and where it sits in world space. It is imported by both the
 * server-rendered page and the client-only 3D scene, so it must stay free of
 * `"use client"`, of React, and of any `three` import.
 *
 * To add a floor later (products is the one we know about), add an entry to
 * FLOORS, add copy for it in page.tsx, and register a builder for it in
 * TowerScene.tsx. Nothing else moves: world-space Y is derived from the index,
 * and scroll windows are measured from the live DOM rather than hardcoded.
 */

/** Vertical distance between floor centres, in world units (1 unit = 1 voxel). */
export const FLOOR_PITCH = 64;

export type FloorId = "hero" | "services" | "proof" | "process" | "contact";

export interface Floor {
  id: FloorId;
  /**
   * Scroll height of this floor in viewport heights. Drives the CSS
   * `min-height` and, indirectly, how long the floor stays on screen.
   * It deliberately does NOT drive world-space Y — see floorY().
   */
  span: number;
  /**
   * Which side of the frame the copy sits on. The voxel set piece is built on
   * the opposite side so text never lands on top of geometry.
   */
  side: "left" | "right" | "center";
}

export const FLOORS: Floor[] = [
  { id: "hero", span: 1.8, side: "center" },
  { id: "services", span: 1.6, side: "left" },
  { id: "proof", span: 1.6, side: "right" },
  // { id: "products", span: 1.6, side: "left" },  ← insertion point, see module docs
  { id: "process", span: 1.6, side: "center" },
  { id: "contact", span: 1.0, side: "center" },
];

/** Total document height in viewport heights. */
export const TOTAL_SPAN = FLOORS.reduce((sum, floor) => sum + floor.span, 0);

/**
 * World-space Y of a floor's centre.
 *
 * Floors are evenly pitched even though their scroll spans differ. The camera
 * reconciles the two with a piecewise-linear map built from measured DOM
 * offsets, which is what guarantees a floor's set piece is centred exactly when
 * its heading is.
 */
export function floorY(index: number): number {
  return -index * FLOOR_PITCH;
}
