"use client";

import React from "react";

import { MIN_POINTS, type MorphSettings } from "./MorphControls";
import {
  easings,
  morphShape,
  placePoints,
  rectangle,
  scale,
  seededRandom,
  toPathData,
  type Shape,
} from "./morph/morph";
import { PointsOverlay } from "./PointsOverlay";

/** How small the rectangle gets at progress 1, about its centre. */
const SHRINK = 0.5;

interface Props {
  /** Size of the full rectangle, in SVG user units. */
  width: number;
  height: number;
  /** 0 is full size, 1 is shrunk to half size. */
  progress: number;
  settings: MorphSettings;
  /**
   * Added to `settings.seed`, so rectangles sharing settings can each get
   * their own point layout.
   */
  seedOffset?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Shown as the SVG's title. */
  title?: string;
  onClick?: () => void;
  ref?: React.Ref<SVGSVGElement>;
}

/**
 * The shape of a `width` x `height` rectangle that shrinks to half size as
 * `progress` goes from 0 to 1, its points moving on the stretch
 * experiment's staggered timeline. Extra points beyond the corners sit at
 * seeded random positions around the outline, offset by `seedOffset`.
 */
export function useMorphShape(
  width: number,
  height: number,
  progress: number,
  settings: MorphSettings,
  seedOffset = 0,
): Shape {
  const { pointCount, spacing, seed } = settings;

  // The full-size rectangle and the shrunk one it morphs to.
  const [large, small] = React.useMemo(() => {
    const extras = placePoints(
      pointCount - MIN_POINTS,
      spacing / 100,
      width,
      height,
      seededRandom(seed + seedOffset),
    );
    const full = rectangle(width, height, extras);
    return [full, scale(full, SHRINK, [width / 2, height / 2])];
  }, [pointCount, spacing, seed, seedOffset, width, height]);

  return morphShape(large, small, progress, {
    angle: settings.angle,
    pointDuration: settings.pointDuration,
    easing: easings[settings.easing],
  });
}

/**
 * The morphing rectangle from `useMorphShape`, drawn as an SVG path. Style
 * the shape with `className > path`.
 */
export function MorphingRect({
  width,
  height,
  progress,
  settings,
  seedOffset = 0,
  className,
  style,
  title,
  onClick,
  ref,
}: Props) {
  const shape = useMorphShape(width, height, progress, settings, seedOffset);

  return (
    <svg
      ref={ref}
      className={className}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={toPathData(shape)} onClick={onClick} />
      {settings.showPoints && <PointsOverlay shape={shape} />}
    </svg>
  );
}
