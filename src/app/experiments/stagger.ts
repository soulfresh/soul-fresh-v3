import type { Point } from "@/fonts/types";

export type Easing = (t: number) => number;

export const easings = {
  linear: (t: number) => t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
} satisfies Record<string, Easing>;

export type EasingName = keyof typeof easings;

export interface StaggerOptions {
  /** Direction of the sweep in degrees. 0 is right, 90 is down, 180 is left. */
  angle: number;
  /**
   * How much of the timeline (0–1] each point spends moving. Small values
   * spread the points' starts out a lot; 1 moves every point together.
   */
  pointDuration: number;
  easing: Easing;
}

/**
 * Each point's own eased progress (0–1) at overall `progress` (0–1), for a
 * sweep along `angle`: the points that lead in that direction move first and
 * the trailing ones last, each spending `pointDuration` of the timeline on
 * its move. Points are ordered by their position in `timing`.
 */
export function staggeredProgress(
  timing: Point[],
  progress: number,
  { angle, pointDuration, easing }: StaggerOptions,
): number[] {
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

  return leads.map((lead) => {
    const start = (startWindow * (max - lead)) / span;
    return easing(clamp((progress - start) / pointDuration));
  });
}

function clamp(n: number) {
  return Math.min(1, Math.max(0, n));
}
