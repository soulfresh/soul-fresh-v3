"use client";

import React from "react";

import { MIN_POINTS, type MorphSettings } from "./MorphControls";
import {
  easings,
  furthestPointProgress,
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
  /**
   * Shown as the SVG's title, and the accessible name of the shape. Without
   * a title or `onClick` the rectangle is decorative and hidden from
   * assistive technology.
   */
  title?: string;
  /** Makes the shape a button, activated by clicking, Enter or Space. */
  onClick?: () => void;
  ref?: React.Ref<SVGSVGElement>;
}

export interface MorphState {
  shape: Shape;
  /**
   * The smallest scale, about the centre, at which the full rectangle still
   * covers every point of `shape`: from 1 at full size down to the shrunk
   * size. Scaling content by it keeps the morph always uncovering content.
   */
  coverScale: number;
  /**
   * How far the point that has moved furthest is through its own move: 0 at
   * full size, 1 when shrunk. `coverScale` follows it, so anything else
   * keyed to it moves in step with the scale.
   */
  furthest: number;
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
): MorphState {
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

  const options = {
    angle: settings.angle,
    pointDuration: settings.pointDuration,
    easing: easings[settings.easing],
  };
  // Every point moves straight towards the centre, so the one that has
  // moved furthest is the one that needs the largest scale to cover it.
  const furthest = furthestPointProgress(large, progress, options);
  return {
    shape: morphShape(large, small, progress, options),
    coverScale: 1 - (1 - SHRINK) * furthest,
    furthest,
  };
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
  const { shape } = useMorphShape(
    width,
    height,
    progress,
    settings,
    seedOffset,
  );

  return (
    <svg
      ref={ref}
      className={className}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      role={title && !onClick ? "img" : undefined}
      aria-hidden={title || onClick ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path
        d={toPathData(shape)}
        {...(onClick && {
          role: "button",
          tabIndex: 0,
          "aria-label": title,
          onClick,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          },
        })}
      />
      {settings.showPoints && <PointsOverlay shape={shape} />}
    </svg>
  );
}
