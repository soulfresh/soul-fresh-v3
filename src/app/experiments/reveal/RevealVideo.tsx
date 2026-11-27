"use client";

import React from "react";

import type { MorphSettings } from "../MorphControls";
import { useMorphShape } from "../MorphingRect";
import { toClipPolygon } from "../morph/morph";
import { PointsOverlay } from "../PointsOverlay";

import type { VideoSource } from "./videoSources";
import styles from "./reveal.module.scss";

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
 * A project video at its natural size, clipped to the morphing rectangle.
 * It plays, muted, only while some of it is on screen.
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
  const shape = useMorphShape(width, height, progress, settings, seedOffset);

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
        style={{ clipPath: toClipPolygon(shape, width, height) }}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
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
