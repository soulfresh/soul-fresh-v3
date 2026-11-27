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
  const [small, setSmall] = React.useState(false);
  const [seconds, setSeconds] = React.useState(2);
  const [settings, setSettings] = React.useState(defaultMorphSettings);
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

  return (
    <>
      <MorphingRect
        className={styles.shape}
        width={WIDTH}
        height={HEIGHT}
        progress={progress}
        settings={settings}
        onClick={() => setSmall((s) => !s)}
      />
      <MorphControls
        settings={settings}
        onChange={setSettings}
        progress={progress}
        onProgressChange={updateProgress}
        seconds={seconds}
        onSecondsChange={setSeconds}
        // New points and direction, then a run to the other size. At rest
        // the points all sit on the rectangle's edges, so moving them
        // doesn't change the outline before the run starts.
        onRandomize={() => {
          setSettings(randomizeSettings);
          setSmall((s) => !s);
        }}
      />
    </>
  );
}
