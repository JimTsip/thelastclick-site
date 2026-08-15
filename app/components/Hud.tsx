"use client";

import { useEffect } from "react";

import { FLOORS } from "../lib/floors";

const LABELS: Record<string, string> = {
  hero: "SURFACE",
  services: "WORKSHOP",
  proof: "RECORD",
  process: "PIPELINE",
  contact: "VAULT",
};

/**
 * The depth gauge.
 *
 * Deliberately independent of the 3D scene: it drives itself from scroll, so it
 * is present and correct on every path — WebGL, no WebGL, reduced motion. It
 * writes to the DOM directly rather than through React state, because it
 * updates every frame and a re-render per frame would be absurd.
 */
export default function Hud() {
  useEffect(() => {
    const readout = document.getElementById("hud-depth");
    const marker = document.getElementById("hud-marker");
    const label = document.getElementById("hud-label");
    const index = document.getElementById("hud-index");
    if (!readout || !marker || !label || !index) return;

    const sections = FLOORS.map((floor) =>
      document.querySelector<HTMLElement>(`[data-floor="${floor.id}"]`),
    );

    let frame = 0;
    let lastFloor = -1;
    let lastDepth = -1;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      const depth = Math.round(progress * 100);
      if (depth !== lastDepth) {
        lastDepth = depth;
        readout.textContent = String(depth).padStart(3, "0");
        marker.style.top = `${progress * 100}%`;
      }

      // Which floor owns the middle of the screen right now.
      const middle = window.scrollY + window.innerHeight / 2;
      let current = 0;
      sections.forEach((section, i) => {
        if (section && section.offsetTop <= middle) current = i;
      });

      if (current !== lastFloor) {
        lastFloor = current;
        label.textContent = LABELS[FLOORS[current].id] ?? "";
        index.textContent = String(current + 1).padStart(2, "0");
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <aside className="hud" aria-hidden="true">
      <div className="hud-stack">
        <span className="hud-caption">Depth</span>
        <span className="hud-readout" id="hud-depth">
          000
        </span>
        <div className="hud-track">
          <span className="hud-marker" id="hud-marker" />
        </div>
        <span className="hud-level">
          <b id="hud-index">01</b>
          <i id="hud-label">SURFACE</i>
        </span>
      </div>
    </aside>
  );
}
