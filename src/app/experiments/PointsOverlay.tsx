"use client";

import React from "react";

import type { Point, Shape } from "@/fonts/types";

import styles from "./points-overlay.module.scss";

/** Width of an anchor square and diameter of a control circle, in screen px. */
const MARKER_SIZE = 2.5;

interface Props {
  shape: Shape;
}

/**
 * Anchors as squares and control points as circles, with handles joining
 * each control point to the anchor it belongs to. Render it inside the SVG
 * that draws `shape`.
 *
 * Markers stay the same size on screen whatever the SVG's viewBox or
 * rendered size, so overlays look alike across experiments. That needs the
 * SVG's measured scale, so nothing is drawn until it has been measured.
 */
export function PointsOverlay({ shape }: Props) {
  const ref = React.useRef<SVGGElement>(null);
  // SVG user units per screen pixel.
  const [unitsPerPx, setUnitsPerPx] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const group = ref.current;
    const svg = group?.ownerSVGElement;
    if (!group || !svg) return;
    const measure = () => {
      const matrix = group.getScreenCTM();
      if (matrix && matrix.a > 0) setUnitsPerPx(1 / matrix.a);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const anchors: Point[] = [];
  const controls: Point[] = [];
  const handles: [Point, Point][] = [];
  let current: Point = [0, 0];
  for (const segment of shape) {
    if (segment[0] === "M" || segment[0] === "L") {
      current = segment[1];
      anchors.push(current);
    } else if (segment[0] === "C") {
      const [, c1, c2, to] = segment;
      handles.push([current, c1], [c2, to]);
      controls.push(c1, c2);
      anchors.push(to);
      current = to;
    }
  }

  const size = unitsPerPx === null ? 0 : MARKER_SIZE * unitsPerPx;

  return (
    <g ref={ref} className={styles.points}>
      {unitsPerPx !== null && (
        <>
          {handles.map(([[x1, y1], [x2, y2]], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
          {anchors.map(([x, y], i) => (
            <rect
              key={i}
              x={x - size / 2}
              y={y - size / 2}
              width={size}
              height={size}
            />
          ))}
          {controls.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={size / 2} />
          ))}
        </>
      )}
    </g>
  );
}
