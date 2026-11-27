"use client";

import React from "react";

import { PointsOverlay } from "../PointsOverlay";
import { Range } from "../Range";

import {
  easings,
  morphShape,
  rectangle,
  scale,
  toPathData,
  type EasingName,
} from "./morph";
import styles from "./morph.module.scss";

/** Standard landscape video, 16:9, in SVG user units. */
const WIDTH = 1600;
const HEIGHT = 900;

/** The full-size rectangle and the half-size one it shrinks to. */
const LARGE = rectangle(WIDTH, HEIGHT);
const SMALL = scale(LARGE, 0.5, [WIDTH / 2, HEIGHT / 2]);

/**
 * Prototype of the morph with controls for each setting. Clicking the shape
 * shrinks it to half size, and clicking again grows it back.
 */
export function MorphPrototype() {
  // 0 is full size, 1 is half size.
  const [progress, setProgress] = React.useState(0);
  const [small, setSmall] = React.useState(false);
  const [angle, setAngle] = React.useState(180);
  const [pointDuration, setPointDuration] = React.useState(0.3);
  const [easing, setEasing] = React.useState<EasingName>("easeInOutCubic");
  const [seconds, setSeconds] = React.useState(2);
  const [showPoints, setShowPoints] = React.useState(false);
  // Where the animation picks up from, without re-running it every frame.
  const progressRef = React.useRef(progress);

  const updateProgress = (p: number) => {
    progressRef.current = p;
    setProgress(p);
  };

  // Animate from wherever progress is now towards the clicked size, taking
  // `seconds` for a full run and proportionally less for a partial one.
  React.useEffect(() => {
    const from = progressRef.current;
    const goal = small ? 1 : 0;
    if (from === goal) return;
    const duration = seconds * 1000 * Math.abs(goal - from);
    const startTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const f = Math.min(1, (now - startTime) / duration);
      updateProgress(from + (goal - from) * f);
      if (f < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [small, seconds]);

  const shape = morphShape(LARGE, SMALL, progress, {
    angle,
    pointDuration,
    easing: easings[easing],
  });

  return (
    <>
      <svg
        className={styles.shape}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-hidden
      >
        <path d={toPathData(shape)} onClick={() => setSmall((s) => !s)} />
        {showPoints && <PointsOverlay shape={shape} />}
      </svg>

      <form className={styles.controls} onSubmit={(e) => e.preventDefault()}>
        <Range
          label="Progress"
          value={progress}
          min={0}
          max={1}
          step={0.001}
          onChange={updateProgress}
        />
        <Range
          label="Direction (°)"
          value={angle}
          min={0}
          max={359}
          step={1}
          onChange={setAngle}
        />
        <Range
          label="Point duration"
          value={pointDuration}
          min={0.05}
          max={1}
          step={0.01}
          onChange={setPointDuration}
        />
        <Range
          label="Play length (s)"
          value={seconds}
          min={0.25}
          max={10}
          step={0.25}
          onChange={setSeconds}
        />
        <label>
          Easing
          <select
            value={easing}
            onChange={(e) => setEasing(e.target.value as EasingName)}
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
            checked={showPoints}
            onChange={(e) => setShowPoints(e.target.checked)}
          />
          Show points
        </label>
      </form>
    </>
  );
}
