"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const TowerScene = dynamic(() => import("./TowerScene"), { ssr: false });

/**
 * Decides whether the 3D scene should exist at all, and only then imports it.
 *
 * The capability check runs *before* the dynamic import so a device that cannot
 * or should not run the scene never downloads the three.js chunk. Everything
 * below this component is decoration; the page is complete without it.
 */
function canRunScene(): boolean {
  if (typeof window === "undefined") return false;

  // Honouring an explicit request to save data is free and correct.
  if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return false;

  // No device-tier heuristics. The scene is ~18 draw calls and ~22k triangles
  // — a 2018 phone runs it. An earlier cores/memory gate wrongly turned the
  // scene off on real iPhones, whose Safari reports few or no cores.
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ??
      probe.getContext("webgl") ??
      probe.getContext("experimental-webgl");
    // Do NOT lose the probe context here: on Safari that can poison the
    // context the real renderer is about to create on another canvas.
    return !!gl;
  } catch {
    return false;
  }
}

export default function TowerSceneMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // ?nogl=1 forces the fallback so it can be tested without a broken GPU.
    if (new URLSearchParams(window.location.search).has("nogl")) {
      document.body.classList.add("no-webgl");
      return;
    }

    if (!canRunScene()) {
      document.body.classList.add("no-webgl");
      return;
    }

    // Wait for the page to settle before pulling in ~150KB of renderer.
    // Safari has no requestIdleCallback, hence the timeout fallback.
    const start = () => setEnabled(true);
    const idleCapable = typeof window.requestIdleCallback === "function";
    const handle = idleCapable
      ? window.requestIdleCallback(start, { timeout: 2000 })
      : window.setTimeout(start, 300);

    return () => {
      if (idleCapable) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  if (!enabled) return null;
  return <TowerScene />;
}
