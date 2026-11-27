"use client";

import { DrawingSwitcher } from "@/components/background-drawing";
import { useScrollPercent } from "@/components/dimensions";

import styles from "./stretch.module.scss";

/** Full-window drawing driven by page scroll, like the home page. */
export function StretchBackground() {
  const percent = useScrollPercent();
  return (
    <div className={styles.background} aria-hidden="true">
      <DrawingSwitcher percent={percent} />
    </div>
  );
}
