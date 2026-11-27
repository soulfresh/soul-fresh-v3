"use client";

import React from "react";

import type { MorphSettings } from "../MorphControls";
import { useMorphShape } from "../MorphingRect";
import { toClipPolygon } from "../morph/morph";
import { PointsOverlay } from "../PointsOverlay";

import type { VideoSource } from "./videoSources";
import styles from "./reveal.module.scss";

/** The video's opacity at its shrunk ("out") size. */
const OUT_OPACITY = 0.5;

/** Corner radius of the video on screen, in px, whatever its scale. */
const CORNER_RADIUS = 5;

interface Props {
  /** The video's natural size, in px. */
  width: number;
  height: number;
  sources: VideoSource[];
  poster?: string;
  title: string;
  /** 0 is fully revealed, 1 is clipped to the shrunk rectangle. */
  progress: number;
  settings: MorphSettings;
  seedOffset: number;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * A project video, clipped to the morphing rectangle and scaled so the
 * morph is always uncovering video: half size while the mask is shrunk,
 * growing to its natural size in step with the point that has moved
 * furthest. Its opacity follows the same timing, from `OUT_OPACITY` when
 * shrunk to fully opaque. It plays, muted, only while some of it is on
 * screen.
 *
 * The clip goes on a wrapper rather than the video, since a clip path
 * scales along with the element it clips. The point overlay sits outside
 * the clipped wrapper so its markers aren't cut off.
 */
export function RevealVideo({
  width,
  height,
  sources,
  poster,
  title,
  progress,
  settings,
  seedOffset,
  ref,
}: Props) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { shape, coverScale, furthest } = useMorphShape(
    width,
    height,
    progress,
    settings,
    seedOffset,
  );

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Browsers only autoplay muted video. React sets `muted` as a property
    // rather than an attribute, so make sure before playing.
    video.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Rejects if playback is interrupted, e.g. by scrolling away.
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.placeholder} style={{ width, height }}>
      <div
        className={styles.clip}
        style={{ clipPath: toClipPolygon(shape, width, height) }}
      >
        <video
          ref={videoRef}
          width={width}
          height={height}
          poster={poster}
          title={title}
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            transform: `scale(${coverScale})`,
            opacity: 1 - (1 - OUT_OPACITY) * furthest,
            // The transform scales the radius too, so undo it.
            borderRadius: CORNER_RADIUS / coverScale,
          }}
        >
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      </div>
      {settings.showPoints && (
        <svg
          className={styles.points}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden
        >
          <PointsOverlay shape={shape} />
        </svg>
      )}
    </div>
  );
}
