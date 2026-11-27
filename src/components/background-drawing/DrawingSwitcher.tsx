"use client";

import React from "react";

import { BackgroundDrawing } from "./BackgroundDrawing";
import { drawingNames, type DrawingName } from "./drawings";

export interface DrawingSwitcherProps {
  /** 0–1 progress value passed to the current drawing. */
  percent: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Shows the drawings in a random order, moving to the next one on click.
 */
export function DrawingSwitcher({
  percent,
  className,
  style,
}: DrawingSwitcherProps) {
  // Shuffled after mount so server and hydration renders are both empty.
  const [order, setOrder] = React.useState<DrawingName[] | null>(null);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setOrder(shuffle(drawingNames));
  }, []);

  if (!order) return null;

  return (
    <BackgroundDrawing
      drawing={order[index]}
      percent={percent}
      className={className}
      style={style}
      onClick={() => setIndex((i) => (i + 1) % order.length)}
    />
  );
}

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
