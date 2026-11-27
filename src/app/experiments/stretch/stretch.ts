import type { Point, Segment, Shape } from "@/fonts/types";

import { staggeredProgress, type StaggerOptions } from "../stagger";

export type { Point, Segment, Shape };
export { easings, type Easing, type EasingName } from "../stagger";

/**
 * `angle` is the direction of travel. A small `pointDuration` stretches the
 * shape a lot; 1 moves every point together with no stretch.
 */
export interface StretchOptions extends StaggerOptions {
  /** How far every point travels, in path units. */
  distance: number;
}

/**
 * Move each point `distance` along `angle`, starting with the points that
 * lead in that direction and ending with the trailing ones. In between, the
 * shape stretches toward its destination.
 *
 * `progress` runs from 0 (all points at home) to 1 (all points arrived).
 *
 * Each point is timed by its own position unless `timing` gives another
 * point (same index) to time it by.
 */
export function stretchPoints(
  points: Point[],
  progress: number,
  options: StretchOptions,
  timing: Point[] = points,
): Point[] {
  const radians = (options.angle * Math.PI) / 180;
  const dx = Math.cos(radians) * options.distance;
  const dy = Math.sin(radians) * options.distance;
  const ts = staggeredProgress(timing, progress, options);
  return points.map(([x, y], i) => [x + dx * ts[i], y + dy * ts[i]]);
}

/**
 * Stretch every point in `shape`, control points included, on one shared
 * timeline so the sweep runs across all of its subpaths.
 *
 * With `controlsFollowAnchors`, each control point moves in step with the
 * anchor it belongs to rather than by its own position, which keeps curves
 * from bulging out as they stretch.
 */
export function stretchShape(
  shape: Shape,
  progress: number,
  options: StretchOptions & { controlsFollowAnchors?: boolean },
): Shape {
  const timing = options.controlsFollowAnchors
    ? anchorTiming(shape)
    : undefined;
  return mapPoints(shape, (points) =>
    stretchPoints(points, progress, options, timing),
  );
}

/**
 * The anchor that owns each point in `shape`, in the same order as
 * `shapePoints`. A curve's first control point belongs to the anchor it
 * leaves and its second to the anchor it arrives at.
 */
function anchorTiming(shape: Shape): Point[] {
  const timing: Point[] = [];
  let current: Point = [0, 0];
  for (const segment of shape) {
    if (segment[0] === "M" || segment[0] === "L") {
      current = segment[1];
      timing.push(current);
    } else if (segment[0] === "C") {
      const to = segment[3];
      timing.push(current, to, to);
      current = to;
    }
  }
  return timing;
}

/** Every point in `shape`, in command order. */
export function shapePoints(shape: Shape): Point[] {
  return shape.flatMap(([, ...points]) => points);
}

/** `shape` moved by `dx`, `dy`. */
export function translate(shape: Shape, dx: number, dy: number): Shape {
  return mapPoints(shape, (points) =>
    points.map(([x, y]): Point => [x + dx, y + dy]),
  );
}

/** SVG path data for `shape`. */
export function toPathData(shape: Shape): string {
  return shape
    .map(
      ([command, ...points]) =>
        command + points.map(([x, y]) => `${round(x)} ${round(y)}`).join(" "),
    )
    .join(" ");
}

/** Replace every point in `shape` with the result of `fn`, in order. */
function mapPoints(shape: Shape, fn: (points: Point[]) => Point[]): Shape {
  const mapped = fn(shapePoints(shape));
  let i = 0;
  return shape.map(
    ([command, ...points]) =>
      [command, ...points.map(() => mapped[i++])] as Segment,
  );
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
