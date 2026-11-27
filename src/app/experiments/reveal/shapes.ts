/** A point relative to the placeholder's centre, in px, y down. */
type Point = [number, number];

export const shapeNames = ["circle", "diamond", "triangle", "hexagon"] as const;
export type ShapeName = (typeof shapeNames)[number];

const pick = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

/** Two different random shapes: one to reveal from, one to leave as. */
export function randomShapePair(): [ShapeName, ShapeName] {
  const first = pick(shapeNames);
  return [first, pick(shapeNames.filter((name) => name !== first))];
}

const MIN_ROTATION = (10 * Math.PI) / 180;
const MAX_ROTATION = (75 * Math.PI) / 180;

/** A random clockwise rotation between 10 and 75 degrees, in radians. */
export function randomRotation(): number {
  return MIN_ROTATION + Math.random() * (MAX_ROTATION - MIN_ROTATION);
}

/** Evenly spaced rays; enough that the circle reads as smooth at ~180px. */
const RAY_COUNT = 72;

/** Angle pointing straight up (y is down). */
const UP = -Math.PI / 2;

/** Vertices of a regular polygon inscribed in a circle of `radius`. */
function regularPolygon(sides: number, radius: number, rotation: number): Point[] {
  return Array.from({ length: sides }, (_, i) => {
    const a = rotation + (i * 2 * Math.PI) / sides;
    return [radius * Math.cos(a), radius * Math.sin(a)];
  });
}

/**
 * Outline of a shape turned clockwise by `rotation` radians, as polygon
 * vertices, or `null` for the circle.
 */
function shapeVertices(
  shape: ShapeName,
  radius: number,
  rotation: number,
): Point[] | null {
  switch (shape) {
    case "circle":
      return null;
    case "diamond":
      return regularPolygon(4, radius, UP + rotation);
    case "triangle":
      return regularPolygon(3, radius, UP + rotation);
    case "hexagon":
      return regularPolygon(6, radius, rotation);
  }
}

const cross = (u: Point, v: Point) => u[0] * v[1] - u[1] * v[0];

/**
 * Where a ray from the centre at `angle` leaves a convex polygon that
 * contains the centre.
 */
function rayHit(vertices: Point[], angle: number): Point {
  const d: Point = [Math.cos(angle), Math.sin(angle)];
  let best = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const e: Point = [b[0] - a[0], b[1] - a[1]];
    const denom = cross(d, e);
    if (Math.abs(denom) < 1e-9) continue;
    const t = cross(a, e) / denom;
    const s = cross(a, d) / denom;
    if (t > 0 && s >= -1e-9 && s <= 1 + 1e-9) best = Math.min(best, t);
  }
  return [d[0] * best, d[1] * best];
}

const angleOf = ([x, y]: Point) => Math.atan2(y, x);

/**
 * A CSS `polygon()` that morphs from `shape`, turned clockwise by `rotation`
 * radians (progress 0), to the full `width` x `height` box (progress 1). The
 * rotation unwinds to zero over the morph, so the shape twists as it grows.
 *
 * Both outlines are sampled along the same rays from the centre, so each
 * vertex slides outwards along its ray and the outline never folds over
 * itself. The rays include every shape vertex and every box corner, so both
 * ends of the morph are exact rather than approximated.
 */
export function morphClipPath(
  shape: ShapeName,
  rotation: number,
  radius: number,
  width: number,
  height: number,
  progress: number,
): string {
  const hw = width / 2;
  const hh = height / 2;
  const box: Point[] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  const vertices = shapeVertices(shape, radius, rotation * (1 - progress));

  const angles = Array.from(
    { length: RAY_COUNT },
    (_, i) => UP + (i * 2 * Math.PI) / RAY_COUNT,
  );
  for (const p of [...box, ...(vertices ?? [])]) angles.push(angleOf(p));
  // Normalise into one turn so the sort gives a single clockwise sweep.
  const sorted = angles
    .map((a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))
    .sort((a, b) => a - b);

  const points: string[] = [];
  let previous = -Infinity;
  for (const angle of sorted) {
    if (angle - previous < 1e-6) continue;
    previous = angle;
    const from: Point = vertices
      ? rayHit(vertices, angle)
      : [radius * Math.cos(angle), radius * Math.sin(angle)];
    const to = rayHit(box, angle);
    const x = hw + from[0] + (to[0] - from[0]) * progress;
    const y = hh + from[1] + (to[1] - from[1]) * progress;
    points.push(`${x.toFixed(2)}px ${y.toFixed(2)}px`);
  }
  return `polygon(${points.join(", ")})`;
}
