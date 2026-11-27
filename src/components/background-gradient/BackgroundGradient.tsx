import React from "react";

import { rainbowGradient } from "./gradient";
import styles from "./background-gradient.module.scss";

export interface BackgroundGradientProps {
  /** Number of hues in the gradient. */
  count: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Fills its nearest positioned ancestor with a rainbow gradient.
 */
export function BackgroundGradient({
  count,
  className,
  style,
}: BackgroundGradientProps) {
  return (
    <div
      className={className ? `${styles.gradient} ${className}` : styles.gradient}
      style={{ background: rainbowGradient(count), ...style }}
      aria-hidden="true"
    />
  );
}
