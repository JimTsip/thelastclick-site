"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * The boot screen.
 *
 * A pixel loader that covers the page while the tower is being built. It is
 * honest about what it waits for — the scene signalling `scene-live` — but it
 * never holds the visitor hostage: it dismisses itself after MAX_MS no matter
 * what, and immediately on the no-WebGL path, where there is nothing to load.
 *
 * Rendered from the server so it is on screen from the very first paint. The
 * bar's fill is CSS, so it animates before any JS has run. It leaves with a
 * hard cut and a one-frame flash, like a cabinet coming out of attract mode.
 */
const MIN_MS = 900;
const MAX_MS = 2600;

export default function BootScreen() {
  // Server and first client render agree on "visible"; the session shortcut
  // is applied in the effect so hydration never sees a mismatch.
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (gone) return;
    if (sessionStorage.getItem("tlc-booted") === "1") {
      // Not synchronous: lets hydration commit first, then removes the screen.
      const t = window.setTimeout(() => setGone(true), 0);
      return () => window.clearTimeout(t);
    }

    const started = performance.now();
    let timer = 0;

    const dismiss = () => {
      const elapsed = performance.now() - started;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        sessionStorage.setItem("tlc-booted", "1");
        setGone(true);
      }, Math.max(0, MIN_MS - elapsed));
    };

    // Ready as soon as the scene draws its first frame, or straight away when
    // there is no scene to wait for.
    const observer = new MutationObserver(() => {
      const c = document.body.classList;
      if (c.contains("scene-live") || c.contains("no-webgl")) dismiss();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    if (document.body.classList.contains("scene-live") || document.body.classList.contains("no-webgl")) {
      dismiss();
    }

    // Belt and braces.
    const cap = window.setTimeout(dismiss, MAX_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(cap);
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div className="boot" role="status" aria-live="polite" aria-label="Loading">
      <div className="boot-inner">
        <Image
          className="boot-logo"
          src="/TLC-logo.png"
          alt=""
          width={220}
          height={163}
          priority
        />
        <div className="boot-bar" aria-hidden="true">
          <span className="boot-fill" />
        </div>
        <p className="boot-caption">
          <span className="boot-blink" aria-hidden="true">
            ▮
          </span>{" "}
          Loading
        </p>
      </div>
    </div>
  );
}
