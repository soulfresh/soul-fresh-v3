"use client";

import { useEffect, useRef } from "react";

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

/** Maps visibility to morph progress: circle below 50%, rectangle at 100%. */
function revealProgress(visible: number): number {
  return Math.min(1, Math.max(0, (visible - 0.5) / 0.5));
}

/**
 * A grey stand-in for a project video. It is clipped to a circle while less
 * than half of it is on screen and morphs into the full rectangle as it
 * becomes fully visible, driven directly by scroll position.
 */
export function Placeholder({ name, width, height }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = revealProgress(visibleFraction(el));
      el.style.setProperty("--reveal", progress.toFixed(4));
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
      style={{ width, height }}
      title={name}
    />
  );
}
