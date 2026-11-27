"use client";

import React from "react";

import {
  easings,
  ellipse,
  polygon,
  shapePoints,
  stretchShape,
  toPathData,
  translate,
  type EasingName,
  type Point,
  type Shape,
} from "./stretch";
import styles from "./logo.module.scss";

// A blocky uppercase L with 40 unit strokes, 120 wide and 200 tall.
const L_SHAPE = translate(
  polygon([
    [-60, -100],
    [-20, -100],
    [-20, 60],
    [60, 60],
    [60, 100],
    [-60, 100],
  ]),
  -95,
  0,
);

// An O with the same 40 unit side strokes and height as the L. The counter
// winds the other way so it cuts a hole.
const O_SHAPE: Shape = [
  ...ellipse(80, 0, 75, 100),
  ...ellipse(80, 0, 35, 60, false),
];

// Both letters share one shape so the sweep runs across them together.
const LETTERS: Shape = [...L_SHAPE, ...O_SHAPE];

const MAX_DISTANCE = 400;
// Room for the letters plus their furthest destination in any direction.
const VIEW_BOX = (() => {
  const points = shapePoints(LETTERS);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs) - MAX_DISTANCE;
  const y = Math.min(...ys) - MAX_DISTANCE;
  const width = Math.max(...xs) + MAX_DISTANCE - x;
  const height = Math.max(...ys) + MAX_DISTANCE - y;
  return `${x} ${y} ${width} ${height}`;
})();

/** Prototype of the stretch animation with controls for each setting. */
export function StretchPrototype() {
  const [progress, setProgress] = React.useState(0);
  const [angle, setAngle] = React.useState(180);
  const [distance, setDistance] = React.useState(300);
  const [pointDuration, setPointDuration] = React.useState(0.3);
  const [easing, setEasing] = React.useState<EasingName>("easeInOutCubic");
  const [seconds, setSeconds] = React.useState(2);
  const [playing, setPlaying] = React.useState(false);
  const [showPoints, setShowPoints] = React.useState(false);
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

  const shape = stretchShape(LETTERS, progress, {
    angle,
    distance,
    pointDuration,
    easing: easings[easing],
  });

  return (
    <>
      <div className={styles.stage}>
        <svg className={styles.stretchSvg} viewBox={VIEW_BOX}>
          <path d={toPathData(shape)} />
          {showPoints && <PointsOverlay shape={shape} />}
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
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={showPoints}
            onChange={(e) => setShowPoints(e.target.checked)}
          />
          Show points
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

/**
 * Anchors as squares and control points as circles, with handles joining
 * each control point to the anchor it belongs to.
 */
function PointsOverlay({ shape }: { shape: Shape }) {
  const anchors: Point[] = [];
  const controls: Point[] = [];
  const handles: [Point, Point][] = [];
  let current: Point = [0, 0];
  for (const segment of shape) {
    if (segment[0] === "M" || segment[0] === "L") {
      current = segment[1];
      anchors.push(current);
    } else if (segment[0] === "C") {
      const [, c1, c2, to] = segment;
      handles.push([current, c1], [c2, to]);
      controls.push(c1, c2);
      anchors.push(to);
      current = to;
    }
  }

  return (
    <g className={styles.points}>
      {handles.map(([[x1, y1], [x2, y2]], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
      {anchors.map(([x, y], i) => (
        <rect key={i} x={x - 4} y={y - 4} width={8} height={8} />
      ))}
      {controls.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} />
      ))}
    </g>
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
