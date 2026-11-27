export type Point = [number, number];
export type Easing = (t: number) => number;

/**
 * One path command with absolute coordinates. Cubic curves carry their two
 * control points before the end point, matching SVG's `C c1 c2 to`.
 */
export type Segment =
  | ["M", Point]
  | ["L", Point]
  | ["C", Point, Point, Point]
  | ["Z"];

/** A path made of one or more closed subpaths. */
export type Shape = Segment[];

export const easings = {
  linear: (t: number) => t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
} satisfies Record<string, Easing>;

export type EasingName = keyof typeof easings;

export interface StretchOptions {
  /** Direction of travel in degrees. 0 is right, 90 is down, 180 is left. */
  angle: number;
  /** How far every point travels, in path units. */
  distance: number;
  /**
   * How much of the timeline (0–1] each point spends moving. Small values
   * stretch the shape a lot; 1 moves every point together with no stretch.
   */
  pointDuration: number;
  easing: Easing;
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
  { angle, distance, pointDuration, easing }: StretchOptions,
  timing: Point[] = points,
): Point[] {
  const radians = (angle * Math.PI) / 180;
  const ux = Math.cos(radians);
  const uy = Math.sin(radians);

  // How far along the direction of travel each point sits.
  const leads = timing.map(([x, y]) => x * ux + y * uy);
  const max = Math.max(...leads);
  const min = Math.min(...leads);
  const span = max - min || 1;

  // The leading point starts at 0 and the trailing point starts just in time
  // to finish at 1.
  const startWindow = 1 - pointDuration;

  return points.map(([x, y], i) => {
    const start = (startWindow * (max - leads[i])) / span;
    const t = easing(clamp((progress - start) / pointDuration));
    return [x + ux * distance * t, y + uy * distance * t];
  });
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

/** A closed polygon through `points`. */
export function polygon(points: Point[]): Shape {
  return [
    ["M", points[0]],
    ...points.slice(1).map((p): Segment => ["L", p]),
    ["Z"],
  ];
}

/**
 * An ellipse drawn as four cubic curves, starting at the top. Clockwise and
 * counterclockwise ellipses can be combined to cut holes (nonzero fill).
 */
export function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  clockwise = true,
): Shape {
  // Control point offset that best approximates a quarter circle.
  const k = 0.5522847498;
  // Mirroring horizontally reverses the winding.
  const sx = clockwise ? rx : -rx;
  return [
    ["M", [cx, cy - ry]],
    ["C", [cx + k * sx, cy - ry], [cx + sx, cy - k * ry], [cx + sx, cy]],
    ["C", [cx + sx, cy + k * ry], [cx + k * sx, cy + ry], [cx, cy + ry]],
    ["C", [cx - k * sx, cy + ry], [cx - sx, cy + k * ry], [cx - sx, cy]],
    ["C", [cx - sx, cy - k * ry], [cx - k * sx, cy - ry], [cx, cy - ry]],
    ["Z"],
  ];
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

function clamp(n: number) {
  return Math.min(1, Math.max(0, n));
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
