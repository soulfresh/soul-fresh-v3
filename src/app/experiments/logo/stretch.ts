export type Point = [number, number];
export type Easing = (t: number) => number;

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
 */
export function stretchPoints(
  points: Point[],
  progress: number,
  { angle, distance, pointDuration, easing }: StretchOptions,
): Point[] {
  const radians = (angle * Math.PI) / 180;
  const ux = Math.cos(radians);
  const uy = Math.sin(radians);

  // How far along the direction of travel each point sits.
  const leads = points.map(([x, y]) => x * ux + y * uy);
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

/** A closed polygon path through `points`. */
export function toPathData(points: Point[]): string {
  return (
    points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${round(x)} ${round(y)}`)
      .join(" ") + " Z"
  );
}

function clamp(n: number) {
  return Math.min(1, Math.max(0, n));
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
