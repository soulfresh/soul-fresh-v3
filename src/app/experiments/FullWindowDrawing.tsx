"use client";

import { DrawingSwitcher } from "@/components/background-drawing";
import { useScrollPercent } from "@/components/dimensions";

import styles from "./full-window-drawing.module.scss";

/**
 * The home page's scroll-driven background drawing, filling the whole
 * window rather than the home page's right-hand panel. Clicking it cycles
 * the drawing.
 */
export function FullWindowDrawing() {
  const percent = useScrollPercent();
  return (
    <div className={styles.background} aria-hidden="true">
      <DrawingSwitcher percent={percent} />
    </div>
  );
}
