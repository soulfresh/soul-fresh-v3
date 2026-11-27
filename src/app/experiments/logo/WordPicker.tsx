"use client";

import React from "react";

import { catalog, fontsForFeeling } from "./catalog";
import styles from "./logo.module.scss";

export interface WordPickerProps {
  /** Label, e.g. "Soul". */
  word: string;
  /** `null` is "Any". */
  feeling: string | null;
  font: string;
  onFeelingChange: (feeling: string | null) => void;
  onFontChange: (font: string) => void;
}

/** Feeling and font selects for one word of the logo. */
export function WordPicker({
  word,
  feeling,
  font,
  onFeelingChange,
  onFontChange,
}: WordPickerProps) {
  const fonts = fontsForFeeling(feeling);

  // Keep the font valid for the new feeling.
  const changeFeeling = (next: string | null) => {
    onFeelingChange(next);
    const nextFonts = fontsForFeeling(next);
    if (!nextFonts.includes(font)) onFontChange(nextFonts[0]);
  };

  // Up and down step straight to the previous or next font, wrapping
  // around, instead of opening the native picker (as macOS does).
  const onKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!step || e.altKey || e.metaKey) return;
    e.preventDefault();
    const index = fonts.indexOf(font);
    onFontChange(fonts[(index + step + fonts.length) % fonts.length]);
  };

  return (
    <fieldset className={styles.picker}>
      <legend>{word}</legend>
      <label>
        Feeling
        <select
          value={feeling ?? ""}
          onChange={(e) => changeFeeling(e.target.value || null)}
        >
          <option value="">Any</option>
          {catalog.feelings.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label>
        Font
        <select
          value={font}
          onChange={(e) => onFontChange(e.target.value)}
          onKeyDown={onKeyDown}
        >
          {fonts.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
