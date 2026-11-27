"use client";

import React from "react";

import {
  APPEARANCE_GROUPS,
  catalog,
  FAVORITES,
  filterFonts,
  type FontFilter,
} from "./catalog";
import styles from "./logo.module.scss";
import { Slider } from "./Slider";
import { DEFAULT_SIZE } from "./useSavedCombos";

export interface WordPickerProps {
  /** Label, e.g. "Soul". */
  word: string;
  filter: FontFilter;
  font: string;
  /** Font size on the stage, in pixels. */
  size: number;
  favorites: string[];
  onFilterChange: (filter: FontFilter) => void;
  onFontChange: (font: string) => void;
  onSizeChange: (size: number) => void;
  onToggleFavorite: (font: string) => void;
}

/** Filter and font selects for one word of the logo. */
export function WordPicker({
  word,
  filter,
  font,
  size,
  favorites,
  onFilterChange,
  onFontChange,
  onSizeChange,
  onToggleFavorite,
}: WordPickerProps) {
  const fonts = filterFonts(filter, favorites);
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

  // Keep the font valid for the new filter.
  const changeFilter = (next: FontFilter) => {
    onFilterChange(next);
    const nextFonts = filterFonts(next, favorites);
    if (nextFonts.length > 0 && !nextFonts.includes(font)) {
      onFontChange(nextFonts[0]);
    }
  };

  // Up and down step straight to the previous or next option, wrapping
  // around, instead of opening the native picker (as macOS does).
  const onKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!step || e.altKey || e.metaKey) return;
    e.preventDefault();
    const index = options.indexOf(font);
    onFontChange(options[(index + step + options.length) % options.length]);
  };

  return (
    <fieldset className={styles.picker}>
      <legend>{word}</legend>
      {/* One appearance select per group. They share a single filter
          value, so choosing in one resets the others to All. */}
      {APPEARANCE_GROUPS.map((group) => (
        <label key={group}>
          {group}
          <select
            value={
              filter.appearance?.split("/")[0] === group
                ? filter.appearance
                : ""
            }
            onChange={(e) =>
              changeFilter({ ...filter, appearance: e.target.value || null })
            }
          >
            <option value="">All</option>
            <option value={group}>Any {group.toLowerCase()}</option>
            {catalog.appearances[group]?.map((style) => (
              <option key={style} value={`${group}/${style}`}>
                {style}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label>
        Feeling
        <select
          value={filter.feeling ?? ""}
          onChange={(e) =>
            changeFilter({ ...filter, feeling: e.target.value || null })
          }
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
            {favorited ? "♥" : "♡"}
          </button>
        </div>
      </div>
      <Slider
        label="Size"
        min={24}
        max={320}
        value={size}
        defaultValue={DEFAULT_SIZE}
        onChange={onSizeChange}
      />
    </fieldset>
  );
}
