"use client";

import { DrawingSwitcher } from "@/components/background-drawing";
import { useScrollPercent } from "@/components/dimensions";

import styles from "./logo.module.scss";

/** Full-window drawing driven by page scroll, like the home page. */
export function LogoBackground() {
  const percent = useScrollPercent();
  return (
    <div className={styles.background} aria-hidden="true">
      <DrawingSwitcher percent={percent} />
    </div>
  );
}
