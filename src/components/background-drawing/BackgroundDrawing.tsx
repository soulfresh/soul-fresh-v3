"use client";

import React from "react";

import { drawings, type DrawingName } from "./drawings";
import styles from "./background-drawing.module.scss";

export interface BackgroundDrawingProps {
  drawing: DrawingName;
  /** 0–1 progress value driving the drawing. */
  percent: number;
  className?: string;
  /**
   * Inline styles for the canvas. Set `opacity` or `--drawing-opacity`
   * here to override the drawing's default opacity.
   */
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLCanvasElement>;
}

/**
 * Renders a single drawing on a canvas that fills its parent. Give the
 * parent a size; the canvas buffer follows it (scaled for high-DPI screens).
 */
export function BackgroundDrawing({
  drawing,
  percent,
  className,
  style,
  onClick,
}: BackgroundDrawingProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Hidden (e.g. display: none) or not measured yet.
    if (!canvas || !ctx || size.width === 0 || size.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const bufferW = Math.round(size.width * dpr);
    const bufferH = Math.round(size.height * dpr);
    if (canvas.width !== bufferW || canvas.height !== bufferH) {
      canvas.width = bufferW;
      canvas.height = bufferH;
    }
    // Drawings work in CSS pixels.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawings[drawing].draw(ctx, size.width, size.height, percent);
  }, [drawing, percent, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className ? `${styles.canvas} ${className}` : styles.canvas}
      style={
        {
          "--drawing-opacity": drawings[drawing].opacity,
          ...style,
        } as React.CSSProperties
      }
      onClick={onClick}
    />
  );
}
