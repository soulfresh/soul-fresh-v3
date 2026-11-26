"use client";

import React from "react";

import { DrawingSwitcher } from "@/components/background-drawing";
import { useScrollPercent } from "@/components/dimensions";

import styles from "./home-background.module.scss";

/** Scroll-driven drawing in a fixed panel on the right side of the page. */
export function HomeBackground() {
  const percent = useScrollPercent();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Wait for mount so the CSS fade-in starts when the drawing appears, not at first HTML paint.
  if (!mounted) return null;

  return (
    <div className={styles.homeBackground} aria-hidden="true">
      <DrawingSwitcher percent={percent} />
    </div>
  );
}
