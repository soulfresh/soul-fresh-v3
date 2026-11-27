import type { Point, Segment, Shape } from "@/fonts/types";

import { staggeredProgress, type StaggerOptions } from "../stagger";

export type { Point, Segment, Shape };
export { easings, type EasingName } from "../stagger";

/**
 * A repeatable random number generator (mulberry32): the same `seed` always
 * gives the same sequence in [0, 1), so server and client renders agree.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
 * Positions around a rectangle's outline are fractions of its perimeter,
 * 0 to 1, measured clockwise from the top-left corner.
 */

/** Where each corner sits around a `width` x `height` rectangle's outline. */
function cornerPositions(width: number, height: number): number[] {
  const perimeter = 2 * (width + height);
  return [0, width, width + height, 2 * width + height].map(
    (d) => d / perimeter,
  );
}

/** The point at `position` around a `width` x `height` rectangle's outline. */
function pointAround(position: number, width: number, height: number): Point {
  const d = position * 2 * (width + height);
  if (d < width) return [d, 0];
  if (d < width + height) return [width, d - width];
  if (d < 2 * width + height) return [2 * width + height - d, height];
  return [0, 2 * (width + height) - d];
}

/**
 * A random position around a `width` x `height` rectangle's outline at least
 * `spacing` (a fraction of the perimeter) from every corner and every
 * position in `taken`, measured along the outline.
 *
 * When no such position is left, it takes the middle of the largest gap,
 * which is as far from its neighbours as any new point can be.
 */
export function spacedPosition(
  taken: number[],
  spacing: number,
  width: number,
  height: number,
  random: () => number = Math.random,
): number {
  const fixed = [...cornerPositions(width, height), ...taken].sort(
    (a, b) => a - b,
  );
  // Each gap between neighbours around the outline, the last wrapping back
  // to the first.
  const gaps = fixed.map((a, i): [number, number] => [
    a,
    i + 1 < fixed.length ? fixed[i + 1] : fixed[0] + 1,
  ]);
  const free = gaps
    .map(([a, b]): [number, number] => [a + spacing, b - spacing])
    .filter(([a, b]) => b > a);

  if (free.length === 0) {
    const [a, b] = gaps.reduce((widest, gap) =>
      gap[1] - gap[0] > widest[1] - widest[0] ? gap : widest,
    );
    return ((a + b) / 2) % 1;
  }

  // Pick uniformly across all the free stretches together.
  const total = free.reduce((sum, [a, b]) => sum + (b - a), 0);
  let r = random() * total;
  for (const [a, b] of free) {
    if (r < b - a) return (a + r) % 1;
    r -= b - a;
  }
  return free[free.length - 1][1] % 1;
}

/**
 * `count` positions around a `width` x `height` rectangle's outline, placed
 * one at a time with `spacedPosition`. Each point only depends on the ones
 * before it, so with a seeded `random`, raising `count` keeps the existing
 * points and lowering it drops the newest.
 */
export function placePoints(
  count: number,
  spacing: number,
  width: number,
  height: number,
  random: () => number = Math.random,
): number[] {
  const placed: number[] = [];
  for (let i = 0; i < count; i++) {
    placed.push(spacedPosition(placed, spacing, width, height, random));
  }
  return placed;
}

/**
 * A closed `width` x `height` rectangle, clockwise from the top left, with
 * an extra anchor at each of `extras` (positions around the outline). The
 * extras sit on the edges, so the outline is still the plain rectangle, but
 * they give the morph more points to move.
 */
export function rectangle(
  width: number,
  height: number,
  extras: number[] = [],
): Shape {
  const [first, ...rest] = [...cornerPositions(width, height), ...extras]
    .sort((a, b) => a - b)
    .map((position) => pointAround(position, width, height));
  return [
    ["M", first],
    ...rest.map((point): Segment => ["L", point]),
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

/**
 * A CSS `polygon()` clip path for `shape`, drawn in a `width` x `height`
 * box, with coordinates as percentages of the box so it scales with the
 * element it clips. Polygons only have straight edges, so curves are
 * reduced to their end points; it suits shapes made of lines.
 */
export function toClipPolygon(
  shape: Shape,
  width: number,
  height: number,
): string {
  const points = shape.flatMap((segment) =>
    segment[0] === "Z" ? [] : [segment[segment.length - 1] as Point],
  );
  const percent = (n: number, size: number) =>
    `${Math.round((n / size) * 1e5) / 1e3}%`;
  return `polygon(${points
    .map(([x, y]) => `${percent(x, width)} ${percent(y, height)}`)
    .join(", ")})`;
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
