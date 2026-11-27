"use client";

import React from "react";

import { PointsOverlay } from "../PointsOverlay";
import { Range } from "../Range";

import {
  easings,
  morphShape,
  rectangle,
  scale,
  spacedPosition,
  toPathData,
  type EasingName,
} from "./morph";
import styles from "./morph.module.scss";

/** Standard landscape video, 16:9, in SVG user units. */
const WIDTH = 1600;
const HEIGHT = 900;

/** A rectangle's corners; the points slider adds anchors beyond these. */
const MIN_POINTS = 4;
const MAX_POINTS = 20;

/**
 * `count` new positions around the rectangle's outline, each at least
 * `spacing` (a fraction of the perimeter) from the corners, from `taken` and
 * from each other.
 */
function placePoints(count: number, spacing: number, taken: number[] = []) {
  const placed = [...taken];
  for (let i = 0; i < count; i++) {
    placed.push(spacedPosition(placed, spacing, WIDTH, HEIGHT));
  }
  return placed.slice(taken.length);
}

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
  // Anchors added along the edges beyond the four corners, oldest first, as
  // positions around the outline.
  const [extras, setExtras] = React.useState<number[]>([]);
  // Smallest gap between any two points, as a percentage of the perimeter.
  const [spacing, setSpacing] = React.useState(8);
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

  // Raising the count adds new random points and lowering it drops the most
  // recently added, so the others stay put.
  const setPointCount = (count: number) => {
    const wanted = count - MIN_POINTS;
    setExtras(
      wanted > extras.length
        ? [
            ...extras,
            ...placePoints(wanted - extras.length, spacing / 100, extras),
          ]
        : extras.slice(0, wanted),
    );
  };

  // A new spacing re-places every extra point so they all honour it.
  const changeSpacing = (value: number) => {
    setSpacing(value);
    setExtras(placePoints(extras.length, value / 100));
  };

  // A new point count, point positions and direction, then a run to the
  // other size. At
  // rest the points all sit on the rectangle's edges, so moving them doesn't
  // change the outline before the run starts.
  const randomize = () => {
    const count =
      MIN_POINTS +
      Math.floor(Math.random() * (MAX_POINTS - MIN_POINTS + 1));
    setExtras(placePoints(count - MIN_POINTS, spacing / 100));
    setAngle(Math.floor(Math.random() * 360));
    setSmall((s) => !s);
  };

  // The full-size rectangle and the half-size one it shrinks to.
  const large = rectangle(WIDTH, HEIGHT, extras);
  const smallShape = scale(large, 0.5, [WIDTH / 2, HEIGHT / 2]);
  const shape = morphShape(large, smallShape, progress, {
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
          label="Points"
          value={MIN_POINTS + extras.length}
          min={MIN_POINTS}
          max={MAX_POINTS}
          step={1}
          onChange={setPointCount}
        />
        <Range
          label="Min spacing (% of perimeter)"
          value={spacing}
          min={0}
          max={15}
          step={0.5}
          onChange={changeSpacing}
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
        <button type="button" onClick={randomize}>
          Randomize
        </button>
      </form>
    </>
  );
}
