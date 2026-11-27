"use client";

import React from "react";

import { catalog, FAVORITES, fontsForFeeling } from "./catalog";
import styles from "./logo.module.scss";

export interface WordPickerProps {
  /** Label, e.g. "Soul". */
  word: string;
  /** `null` is "Any"; `FAVORITES` filters to the favorited fonts. */
  feeling: string | null;
  font: string;
  favorites: string[];
  onFeelingChange: (feeling: string | null) => void;
  onFontChange: (font: string) => void;
  onToggleFavorite: (font: string) => void;
}

/** Feeling and font selects for one word of the logo. */
export function WordPicker({
  word,
  feeling,
  font,
  favorites,
  onFeelingChange,
  onFontChange,
  onToggleFavorite,
}: WordPickerProps) {
  const fonts = fontsForFeeling(feeling, favorites);
  // The list can stop containing the font (un-hearting the last favorite,
  // say); keep it selectable rather than yanking the word to another font.
  const options = fonts.includes(font) ? fonts : [font, ...fonts];
  const favorited = favorites.includes(font);
  const fontId = React.useId();
  const selectRef = React.useRef<HTMLSelectElement>(null);

  // Hand focus back to the select so arrowing through fonts can continue.
  const toggleFavorite = () => {
    onToggleFavorite(font);
    selectRef.current?.focus();
  };

  // Keep the font valid for the new feeling.
  const changeFeeling = (next: string | null) => {
    onFeelingChange(next);
    const nextFonts = fontsForFeeling(next, favorites);
    if (nextFonts.length > 0 && !nextFonts.includes(font)) {
      onFontChange(nextFonts[0]);
    }
  };

  // Up and down step straight to the previous or next font, wrapping
  // around, instead of opening the native picker (as macOS does).
  const onKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!step || e.altKey || e.metaKey) return;
    e.preventDefault();
    if (fonts.length === 0) return;
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
          <option value={FAVORITES}>Favorites</option>
          {catalog.feelings.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.field}>
        <label htmlFor={fontId}>Font</label>
        <div className={styles.fontRow}>
          <select
            id={fontId}
            ref={selectRef}
            value={font}
            onChange={(e) => onFontChange(e.target.value)}
            onKeyDown={onKeyDown}
          >
            {options.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.heart}
            aria-pressed={favorited}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            onClick={toggleFavorite}
          >
            {favorited ? "\u2665" : "\u2661"}
          </button>
        </div>
      </div>
    </fieldset>
  );
}
