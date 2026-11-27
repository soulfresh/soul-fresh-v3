"use client";

import React from "react";

import {
  easings,
  stretchPoints,
  toPathData,
  type EasingName,
  type Point,
} from "./stretch";
import styles from "./logo.module.scss";

// A blocky uppercase L, centered on the origin.
const L_SHAPE: Point[] = [
  [-60, -100],
  [-20, -100],
  [-20, 60],
  [60, 60],
  [60, 100],
  [-60, 100],
];

const MAX_DISTANCE = 400;
// Room for the L plus its furthest possible destination in any direction.
const VIEW_BOX = `${-60 - MAX_DISTANCE} ${-100 - MAX_DISTANCE} ${
  2 * (60 + MAX_DISTANCE)
} ${2 * (100 + MAX_DISTANCE)}`;

/** Prototype of the stretch animation with controls for each setting. */
export function StretchPrototype() {
  const [progress, setProgress] = React.useState(0);
  const [angle, setAngle] = React.useState(180);
  const [distance, setDistance] = React.useState(300);
  const [pointDuration, setPointDuration] = React.useState(0.3);
  const [easing, setEasing] = React.useState<EasingName>("easeInOutCubic");
  const [seconds, setSeconds] = React.useState(2);
  const [playing, setPlaying] = React.useState(false);
  // Bumped on every Play click so a click mid-play restarts the animation.
  const [playKey, setPlayKey] = React.useState(0);

  // Animate progress from 0 to 1 over `seconds`.
  React.useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startTime) / (seconds * 1000));
      setProgress(p);
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, playKey, seconds]);

  const points = stretchPoints(L_SHAPE, progress, {
    angle,
    distance,
    pointDuration,
    easing: easings[easing],
  });

  return (
    <>
      <div className={styles.stage}>
        <svg className={styles.stretchSvg} viewBox={VIEW_BOX}>
          <path d={toPathData(points)} />
        </svg>
      </div>

      <form className={styles.controls} onSubmit={(e) => e.preventDefault()}>
        <Range
          label="Progress"
          value={progress}
          min={0}
          max={1}
          step={0.001}
          onChange={(v) => {
            setPlaying(false);
            setProgress(v);
          }}
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
          label="Distance"
          value={distance}
          min={0}
          max={MAX_DISTANCE}
          step={1}
          onChange={setDistance}
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
        <button
          type="button"
          onClick={() => {
            setProgress(0);
            setPlaying(true);
            setPlayKey((k) => k + 1);
          }}
        >
          Play
        </button>
      </form>
    </>
  );
}

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function Range({ label, value, min, max, step, onChange }: RangeProps) {
  return (
    <label>
      <span>
        {label} <output>{Number(value.toFixed(3))}</output>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
