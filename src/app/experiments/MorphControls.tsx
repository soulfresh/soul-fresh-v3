"use client";

import { easings, type EasingName } from "./morph/morph";
import { Range } from "./Range";
import styles from "./morph-controls.module.scss";

/** A rectangle's corners; the points slider adds anchors beyond these. */
export const MIN_POINTS = 4;
export const MAX_POINTS = 20;

/** Everything the settings panel controls about a morphing rectangle. */
export interface MorphSettings {
  /** Anchors in the outline, corners included. */
  pointCount: number;
  /** Smallest gap between any two points, as a percentage of the perimeter. */
  spacing: number;
  /** Direction of the sweep in degrees. 0 is right, 90 is down. */
  angle: number;
  /** How much of the timeline (0–1] each point spends moving. */
  pointDuration: number;
  easing: EasingName;
  showPoints: boolean;
  /** Seeds the random placement of the extra points. */
  seed: number;
}

export const defaultMorphSettings: MorphSettings = {
  pointCount: MIN_POINTS,
  spacing: 8,
  angle: 180,
  pointDuration: 0.3,
  easing: "easeInOutCubic",
  showPoints: false,
  seed: 1,
};

/** The settings that decide how many points there are and where. */
export type PointLayout = Pick<MorphSettings, "pointCount" | "seed">;

/** A random point count and a fresh seed for placing the points. */
export function randomPointLayout(): PointLayout {
  const span = MAX_POINTS - MIN_POINTS + 1;
  return {
    pointCount: MIN_POINTS + Math.floor(Math.random() * span),
    seed: Math.floor(Math.random() * 2 ** 32),
  };
}

/** A random whole-degree sweep direction. */
export function randomAngle(): number {
  return Math.floor(Math.random() * 360);
}

/** `settings` with a new point count, point positions and direction. */
export function randomizeSettings(settings: MorphSettings): MorphSettings {
  return { ...settings, ...randomPointLayout(), angle: randomAngle() };
}

interface Props {
  settings: MorphSettings;
  onChange: (settings: MorphSettings) => void;
  /** 0 is full size, 1 is shrunk. The slider shows only with both. */
  progress?: number;
  onProgressChange?: (progress: number) => void;
  /** Length of a timed run. The slider shows only with both. */
  seconds?: number;
  onSecondsChange?: (seconds: number) => void;
  /** Hides the points and direction sliders. */
  hidePoints?: boolean;
  hideDirection?: boolean;
  /** The Randomize button shows only with this. */
  onRandomize?: () => void;
}

/** Settings panel for a morphing rectangle, pinned to the top right. */
export function MorphControls({
  settings,
  onChange,
  progress,
  onProgressChange,
  seconds,
  onSecondsChange,
  hidePoints,
  hideDirection,
  onRandomize,
}: Props) {
  const set = <K extends keyof MorphSettings>(
    key: K,
    value: MorphSettings[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <form className={styles.controls} onSubmit={(e) => e.preventDefault()}>
      {progress !== undefined && onProgressChange && (
        <Range
          label="Progress"
          value={progress}
          min={0}
          max={1}
          step={0.001}
          onChange={onProgressChange}
        />
      )}
      {!hidePoints && (
        <Range
          label="Points"
          value={settings.pointCount}
          min={MIN_POINTS}
          max={MAX_POINTS}
          step={1}
          onChange={(v) => set("pointCount", v)}
        />
      )}
      <Range
        label="Min spacing (% of perimeter)"
        value={settings.spacing}
        min={0}
        max={15}
        step={0.5}
        onChange={(v) => set("spacing", v)}
      />
      {!hideDirection && (
        <Range
          label="Direction (°)"
          value={settings.angle}
          min={0}
          max={359}
          step={1}
          onChange={(v) => set("angle", v)}
        />
      )}
      <Range
        label="Point duration"
        value={settings.pointDuration}
        min={0.05}
        max={1}
        step={0.01}
        onChange={(v) => set("pointDuration", v)}
      />
      {seconds !== undefined && onSecondsChange && (
        <Range
          label="Play length (s)"
          value={seconds}
          min={0.25}
          max={10}
          step={0.25}
          onChange={onSecondsChange}
        />
      )}
      <label>
        Easing
        <select
          value={settings.easing}
          onChange={(e) => set("easing", e.target.value as EasingName)}
        >
          {Object.keys(easings).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={settings.showPoints}
          onChange={(e) => set("showPoints", e.target.checked)}
        />
        Show points
      </label>
      {onRandomize && (
        <button type="button" onClick={onRandomize}>
          Randomize
        </button>
      )}
    </form>
  );
}
