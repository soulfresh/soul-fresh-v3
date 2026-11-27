"use client";

import React from "react";

import {
  defaultMorphSettings,
  MorphControls,
  randomAngle,
  randomPointLayout,
  type MorphSettings,
  type PointLayout,
} from "../MorphControls";
import { RevealVideo } from "./RevealVideo";
import type { VideoSource } from "./videoSources";
import type { Size } from "./videoSize";
import styles from "./reveal.module.scss";

/** What a placeholder picks for itself each time it is fully visible. */
type Variant = PointLayout & Pick<MorphSettings, "angle">;

export interface RevealItem extends Size {
  id: string;
  name: string;
  sources: VideoSource[];
  poster?: string;
}

/** Fraction of the element's height currently inside the viewport, 0..1. */
function visibleFraction(el: Element): number {
  const { top, bottom, height } = el.getBoundingClientRect();
  if (height === 0) return 0;
  const visible = Math.min(bottom, window.innerHeight) - Math.max(top, 0);
  return Math.min(1, Math.max(0, visible / height));
}

/**
 * Maps visibility to morph progress: shrunk (1) while at most half is on
 * screen, full size (0) once all of it is.
 */
function morphProgress(visible: number): number {
  return 1 - Math.min(1, Math.max(0, (visible - 0.5) / 0.5));
}

/**
 * The project videos at their natural sizes, each clipped to a rectangle
 * that morphs from half size to the full video as it scrolls fully into
 * view, with the morph experiment's settings panel.
 *
 * Each time a placeholder becomes fully visible it picks its own random
 * point count, layout and direction, so its next transition moves
 * differently. At full size every point sits on the rectangle's edges, so
 * the swap is invisible.
 *
 * The panel holds the settings every placeholder shares. Progress follows
 * scrolling and the rest are picked per placeholder, so it leaves out the
 * progress, points and direction sliders and the Randomize button.
 */
export function RevealPrototype({ items }: { items: RevealItem[] }) {
  const [settings, setSettings] = React.useState(defaultMorphSettings);
  // Each placeholder's progress; shrunk until measured after mounting.
  const [progress, setProgress] = React.useState(() => items.map(() => 1));
  // Each placeholder's own points and direction, once it has picked them.
  const [variants, setVariants] = React.useState<(Variant | undefined)[]>(
    [],
  );
  const refs = React.useRef<(HTMLDivElement | null)[]>([]);
  // Progress as of the last measurement, to spot arrivals at full size.
  const lastProgress = React.useRef(progress);

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const els = refs.current.slice(0, items.length);
      const next = els.map((el) =>
        el ? morphProgress(visibleFraction(el)) : 1,
      );
      // Keep the old array when nothing moved, so React can skip the render.
      setProgress((prev) =>
        next.every((p, i) => p === prev[i]) ? prev : next,
      );

      // Placeholders that have just become fully visible pick new points and
      // a new direction.
      const before = lastProgress.current;
      lastProgress.current = next;
      const arrived = next.flatMap((p, i) =>
        p === 0 && before[i] !== 0 ? [i] : [],
      );
      if (arrived.length > 0) {
        const fresh = arrived.map(
          (): Variant => ({ ...randomPointLayout(), angle: randomAngle() }),
        );
        setVariants((prev) => {
          const updated = [...prev];
          arrived.forEach((i, j) => (updated[i] = fresh[j]));
          return updated;
        });
      }
    };
    // Coalesce scroll and resize events into one measurement per frame.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items.length]);

  // A placeholder's settings, with its own picks once it has them. Until
  // then, the seed is offset per placeholder so each gets its own points.
  const settingsFor = (i: number): [MorphSettings, number] => {
    const variant = variants[i];
    return variant ? [{ ...settings, ...variant }, 0] : [settings, i];
  };

  return (
    <>
      <section className={styles.projects}>
        {items.map((item, i) => {
          const [itemSettings, seedOffset] = settingsFor(i);
          return (
            <RevealVideo
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              width={item.width}
              height={item.height}
              sources={item.sources}
              poster={item.poster}
              title={item.name}
              progress={progress[i] ?? 1}
              settings={itemSettings}
              seedOffset={seedOffset}
            />
          );
        })}
      </section>
      <MorphControls
        settings={settings}
        onChange={setSettings}
        hidePoints
        hideDirection
      />
    </>
  );
}
