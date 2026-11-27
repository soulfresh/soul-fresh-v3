import type { Point, Segment, Shape } from "@/fonts/types";

import { staggeredProgress, type StaggerOptions } from "../stagger";

export type { Point, Segment, Shape };
export { easings, type EasingName } from "../stagger";

/** A closed `width` x `height` rectangle, clockwise from the top left. */
export function rectangle(width: number, height: number): Shape {
  return [
    ["M", [0, 0]],
    ["L", [width, 0]],
    ["L", [width, height]],
    ["L", [0, height]],
    ["Z"],
  ];
}

/** `shape` scaled by `factor` about `centre`. */
export function scale(shape: Shape, factor: number, [cx, cy]: Point): Shape {
  return mapPoints(shape, (points) =>
    points.map(([x, y]): Point => [
      cx + (x - cx) * factor,
      cy + (y - cy) * factor,
    ]),
  );
}

/**
 * Every point of `from` moved towards the same point of `to` (the shapes
 * must have the same commands), on the stretch experiment's timeline: the
 * points that lead along `angle` move first, each over `pointDuration` of
 * the timeline. `progress` runs from 0 (`from`) to 1 (`to`).
 */
export function morphShape(
  from: Shape,
  to: Shape,
  progress: number,
  options: StaggerOptions,
): Shape {
  const targets = shapePoints(to);
  return mapPoints(from, (points) => {
    const ts = staggeredProgress(points, progress, options);
    return points.map(([x, y], i): Point => {
      const [tx, ty] = targets[i];
      return [x + (tx - x) * ts[i], y + (ty - y) * ts[i]];
    });
  });
}

/** Every point in `shape`, in command order. */
function shapePoints(shape: Shape): Point[] {
  return shape.flatMap(([, ...points]) => points);
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

/** SVG path data for `shape`. */
export function toPathData(shape: Shape): string {
  return shape
    .map(
      ([command, ...points]) =>
        command + points.map(([x, y]) => `${round(x)} ${round(y)}`).join(" "),
    )
    .join(" ");
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
