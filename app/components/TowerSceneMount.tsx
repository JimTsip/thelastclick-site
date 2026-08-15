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

  // A small phone with little memory or few cores gets the static page. A great
  // static page beats a bad 3D one.
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (window.innerWidth < 480 && (cores <= 4 || memory < 4)) return false;

  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ??
      probe.getContext("webgl") ??
      probe.getContext("experimental-webgl");
    if (!gl) return false;
    // Release the probe context immediately; browsers cap concurrent contexts.
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
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
