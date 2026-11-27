"use client";

import React from "react";

import { freshFonts, soulFonts } from "./fonts";
import styles from "./logo.module.scss";

/** "Soul" and "Fresh" with a font picker for each word. */
export function Wordmark() {
  const [soulFont, setSoulFont] = React.useState(soulFonts[0]);
  const [freshFont, setFreshFont] = React.useState(freshFonts[0]);

  return (
    <>
      <div className={styles.stage}>
        <h1 className={styles.wordmark}>
          <span style={{ fontFamily: `"${soulFont}"` }}>Soul</span>
          <span style={{ fontFamily: `"${freshFont}"` }}>Fresh</span>
        </h1>
      </div>
      <div className={styles.controls}>
        <FontSelect
          label="Soul"
          fonts={soulFonts}
          value={soulFont}
          onChange={setSoulFont}
        />
        <FontSelect
          label="Fresh"
          fonts={freshFonts}
          value={freshFont}
          onChange={setFreshFont}
        />
      </div>
    </>
  );
}

function FontSelect({
  label,
  fonts,
  value,
  onChange,
}: {
  label: string;
  fonts: string[];
  value: string;
  onChange: (font: string) => void;
}) {
  // Up and down step straight to the previous or next font, wrapping
  // around, instead of opening the native picker (as macOS does).
  const onKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!step || e.altKey || e.metaKey) return;
    e.preventDefault();
    const index = fonts.indexOf(value);
    onChange(fonts[(index + step + fonts.length) % fonts.length]);
  };

  return (
    <label>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      >
        {fonts.map((f) => (
          <option key={f} value={f} style={{ fontFamily: `"${f}"` }}>
            {f}
          </option>
        ))}
      </select>
    </label>
  );
}
