"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import {
  morphClipPath,
  randomRotation,
  randomShapePair,
  type ShapeName,
} from "./shapes";
import type { Size } from "./videoSize";
import styles from "./reveal.module.scss";

interface Props extends Size {
  name: string;
}

/** Fraction of the element's height currently inside the viewport, 0..1. */
function visibleFraction(el: HTMLElement): number {
  const { top, bottom, height } = el.getBoundingClientRect();
  if (height === 0) return 0;
  const visible = Math.min(bottom, window.innerHeight) - Math.max(top, 0);
  return Math.min(1, Math.max(0, visible / height));
}

/**
 * Whether the element is cut off more at the top of the viewport (leaving as
 * you scroll down) than at the bottom (arriving).
 */
function isLeaving(el: HTMLElement): boolean {
  const { top, bottom } = el.getBoundingClientRect();
  return -top > bottom - window.innerHeight;
}

/** Radius of the circle every shape is inscribed in before it grows. */
const SHAPE_RADIUS = 180;

/** Maps visibility to morph progress: shape below 50%, rectangle at 100%. */
function revealProgress(visible: number): number {
  return Math.min(1, Math.max(0, (visible - 0.5) / 0.5));
}

/**
 * A grey stand-in for a project video. It is clipped to a shape (circle,
 * diamond, triangle or hexagon) while less than half of it is on screen and
 * morphs into the full rectangle as it becomes fully visible, driven directly
 * by scroll position. It arrives from the bottom as one random shape and
 * leaves through the top as a different one, each with its own random twist.
 * Until it mounts, the CSS fallback clips it to a circle.
 */
export function Placeholder({ name, width, height }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Chosen on the client only, so server and client markup match.
    const [inShape, outShape] = randomShapePair();
    const twists: Record<"in" | "out", { shape: ShapeName; rotation: number }> =
      {
        in: { shape: inShape, rotation: randomRotation() },
        out: { shape: outShape, rotation: randomRotation() },
      };
    let frame = 0;
    let last = "";
    const update = () => {
      frame = 0;
      const progress = revealProgress(visibleFraction(el));
      const { shape, rotation } = twists[isLeaving(el) ? "out" : "in"];
      const { offsetWidth: w, offsetHeight: h } = el;
      // Skip rebuilding the polygon when nothing it depends on has changed.
      const key = `${shape} ${progress.toFixed(4)} ${w} ${h}`;
      if (key === last) return;
      last = key;
      el.style.clipPath = morphClipPath(
        shape,
        rotation,
        SHAPE_RADIUS,
        w,
        h,
        progress,
      );
    };
    // Coalesce scroll and resize events into one measurement per frame.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={styles.placeholder}
      style={
        { width, height, "--circle-radius": `${SHAPE_RADIUS}px` } as CSSProperties
      }
      title={name}
    />
  );
}
