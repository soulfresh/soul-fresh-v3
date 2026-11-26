"use client";

import { DrawingSwitcher } from "@/components/background-drawing";
import { useScrollPercent } from "@/components/dimensions";

import styles from "./home-background.module.scss";

/** Scroll-driven drawing in a fixed panel on the right side of the page. */
export function HomeBackground() {
  const percent = useScrollPercent();
  return (
    <div className={styles.homeBackground}>
      <DrawingSwitcher percent={percent} />
    </div>
  );
}
