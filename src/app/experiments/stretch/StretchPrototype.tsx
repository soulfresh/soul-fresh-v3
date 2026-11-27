"use client";

import React from "react";

import {
  archivoBlack400,
  layoutText,
  playfairDisplay700Italic,
  type FontData,
} from "@/fonts";

import {
  easings,
  shapePoints,
  stretchShape,
  toPathData,
  translate,
  type EasingName,
  type Point,
  type Shape,
} from "./stretch";
import styles from "./stretch.module.scss";

// Capital height of both words in viewBox units (the old hand-made L was
// 200 tall).
const CAP_HEIGHT = 200;
// Space between "Soul" and "Fresh", as a fraction of the capital height.
const WORD_GAP = 0.35;

/** Lay out `text` with its capitals CAP_HEIGHT tall. */
function word(font: FontData, text: string) {
  return layoutText(font, text, {
    size: (CAP_HEIGHT * font.unitsPerEm) / font.capHeight,
  });
}

// Every letter in one shape so the sweep runs across both words. Centered
// on the origin: horizontally by width, vertically by capital height.
const LETTERS: Shape = (() => {
  const soul = word(archivoBlack400, "Soul");
  const fresh = word(playfairDisplay700Italic, "Fresh");
  const gap = CAP_HEIGHT * WORD_GAP;
  const left = -(soul.width + gap + fresh.width) / 2;
  const top = CAP_HEIGHT / 2;
  return [
    ...soul.glyphs.flatMap((glyph) => translate(glyph.shape, left, top)),
    ...fresh.glyphs.flatMap((glyph) =>
      translate(glyph.shape, left + soul.width + gap, top),
    ),
  ];
})();

// How the letters blend with the background behind them. "normal" draws
// them dark; the others draw them white so they invert what's behind.
const BLEND_MODES = ["normal", "difference", "exclusion"] as const;
type BlendMode = (typeof BLEND_MODES)[number];

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
  const [controlsFollowAnchors, setControlsFollowAnchors] =
    React.useState(false);
  const [blendMode, setBlendMode] = React.useState<BlendMode>("normal");
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
    controlsFollowAnchors,
  });

  return (
    <>
      {/* The stage is fixed, which makes it a stacking context, so the blend
          mode goes on it rather than the SVG or it would only blend with the
          stage's own transparent backdrop. */}
      <div className={styles.stage} style={{ mixBlendMode: blendMode }}>
        <svg
          className={styles.stretchSvg}
          viewBox={VIEW_BOX}
          data-inverted={blendMode !== "normal" || undefined}
        >
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
        <label>
          Blend mode
          <select
            value={blendMode}
            onChange={(e) => setBlendMode(e.target.value as BlendMode)}
          >
            {BLEND_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={controlsFollowAnchors}
            onChange={(e) => setControlsFollowAnchors(e.target.checked)}
          />
          Control points follow anchors
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
