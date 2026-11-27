"use client";

import React from "react";

import styles from "./logo.module.scss";

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  /** What ⌘-click resets to. */
  defaultValue: number;
  onChange: (value: number) => void;
}

/** A labelled pixel range input with a readout. ⌘-click resets it. */
export function Slider({
  label,
  min,
  max,
  value,
  defaultValue,
  onChange,
}: SliderProps) {
  const onMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!e.metaKey) return;
    // Stop the thumb jumping to the click point before the reset.
    e.preventDefault();
    onChange(defaultValue);
  };

  return (
    <label className={styles.slider} title="⌘-click to reset">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseDown={onMouseDown}
      />
      <output>{value}px</output>
    </label>
  );
}
