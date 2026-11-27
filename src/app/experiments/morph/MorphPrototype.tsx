"use client";

import React from "react";

import {
  defaultMorphSettings,
  MorphControls,
  randomizeSettings,
} from "../MorphControls";
import { MorphingRect } from "../MorphingRect";

import styles from "./morph.module.scss";

/** Standard landscape video, 16:9, in SVG user units. */
const WIDTH = 1600;
const HEIGHT = 900;

/**
 * Prototype of the morph with controls for each setting. Clicking the shape
 * shrinks it to half size, and clicking again grows it back.
 */
export function MorphPrototype() {
  // 0 is full size, 1 is half size.
  const [progress, setProgress] = React.useState(0);
  const [seconds, setSeconds] = React.useState(2);
  const [settings, setSettings] = React.useState(defaultMorphSettings);
  // Where a run picks up from, without re-rendering for it.
  const progressRef = React.useRef(progress);
  // The size the last run headed for, or the nearest one after scrubbing,
  // so the next click heads for the other.
  const goalRef = React.useRef(0);
  // The frame of the run in progress, if any.
  const frameRef = React.useRef(0);

  const updateProgress = (p: number) => {
    progressRef.current = p;
    setProgress(p);
  };

  const cancelRun = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  };

  // Stop any run when the page goes away.
  React.useEffect(() => cancelRun, []);

  // Animate from wherever progress is now to `goal`, taking `seconds` for a
  // full run and proportionally less for a partial one. Replaces any run
  // already going.
  const runTo = (goal: number) => {
    cancelRun();
    goalRef.current = goal;
    const from = progressRef.current;
    if (from === goal) return;
    const duration = seconds * 1000 * Math.abs(goal - from);
    const startTime = performance.now();
    const tick = (now: number) => {
      const f = Math.min(1, (now - startTime) / duration);
      updateProgress(from + (goal - from) * f);
      frameRef.current = f < 1 ? requestAnimationFrame(tick) : 0;
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const toggle = () => runTo(goalRef.current === 1 ? 0 : 1);

  // Dragging the slider stops any run, and the next click heads away from
  // whichever end the slider is nearer.
  const scrub = (p: number) => {
    cancelRun();
    goalRef.current = p < 0.5 ? 0 : 1;
    updateProgress(p);
  };

  return (
    <>
      <MorphingRect
        className={styles.shape}
        width={WIDTH}
        height={HEIGHT}
        progress={progress}
        settings={settings}
        title="Toggle size"
        onClick={toggle}
      />
      <MorphControls
        settings={settings}
        onChange={setSettings}
        progress={progress}
        onProgressChange={scrub}
        seconds={seconds}
        onSecondsChange={setSeconds}
        // New points and direction, then a run to the other size. At rest
        // the points all sit on the rectangle's edges, so moving them
        // doesn't change the outline before the run starts.
        onRandomize={() => {
          setSettings(randomizeSettings);
          toggle();
        }}
      />
    </>
  );
}
