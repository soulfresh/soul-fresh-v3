"use client";

import React from "react";

import {
  filterFonts,
  type FontFilter,
  googleFontsUrl,
  NO_FILTER,
} from "./catalog";
import { ControlsPanel } from "./ControlsPanel";
import styles from "./logo.module.scss";
import { SavedCombos } from "./SavedCombos";
import { Slider } from "./Slider";
import { useFavorites } from "./useFavorites";
import {
  DEFAULT_SIZE,
  type SavedCombo,
  useSavedCombos,
  withDefaults,
} from "./useSavedCombos";
import { WordPicker } from "./WordPicker";

interface WordState {
  filter: FontFilter;
  font: string;
  /** Font size on the stage, in pixels. */
  size: number;
}

const initialWord: WordState = {
  filter: NO_FILTER,
  font: filterFonts(NO_FILTER, [])[0],
  size: DEFAULT_SIZE,
};

/**
 * "Soul" and "Fresh" with a feeling and font picker for each word, plus the
 * combinations saved so far.
 */
export function Wordmark() {
  const [soul, setSoul] = React.useState(initialWord);
  const [fresh, setFresh] = React.useState(initialWord);
  // Space between the words on the stage, in pixels.
  const [gap, setGap] = React.useState(0);
  // Vertical shift of "Fresh" from its baseline position, in pixels.
  const [offset, setOffset] = React.useState(0);
  const saved = useSavedCombos();
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const savedRef = React.useRef<HTMLElement>(null);

  // The saved cards render in their own fonts, so load those too.
  const families = [
    soul.font,
    fresh.font,
    ...saved.combos.flatMap((c) => [c.soul, c.fresh]),
  ];

  // No filter, so each font is guaranteed to be in its list.
  const load = (item: SavedCombo) => {
    const combo = withDefaults(item);
    setSoul({ filter: NO_FILTER, font: combo.soul, size: combo.soulSize });
    setFresh({ filter: NO_FILTER, font: combo.fresh, size: combo.freshSize });
    setGap(combo.gap);
    setOffset(combo.offset);
  };

  const save = () =>
    saved.add({
      soul: soul.font,
      fresh: fresh.font,
      soulSize: soul.size,
      freshSize: fresh.size,
      gap,
      offset,
    });

  // Swap filters along with fonts so each font stays in its word's list.
  const swap = () => {
    setSoul(fresh);
    setFresh(soul);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href={googleFontsUrl(families)}
        precedence="default"
      />
      <section className={styles.stage}>
        <h1 className={styles.wordmark}>
          <span style={{ fontFamily: `"${soul.font}"`, fontSize: soul.size }}>
            Soul
          </span>
          {/* A margin rather than `gap` so the words can overlap. */}
          <span
            style={{
              fontFamily: `"${fresh.font}"`,
              fontSize: fresh.size,
              marginLeft: gap,
              position: "relative",
              top: offset,
            }}
          >
            Fresh
          </span>
        </h1>
      </section>
      <ControlsPanel avoid={savedRef}>
        <div className={styles.pickers}>
          <WordPicker
            word="Soul"
            filter={soul.filter}
            font={soul.font}
            size={soul.size}
            favorites={favorites}
            onFilterChange={(filter) => setSoul((s) => ({ ...s, filter }))}
            onFontChange={(font) => setSoul((s) => ({ ...s, font }))}
            onSizeChange={(size) => setSoul((s) => ({ ...s, size }))}
            onToggleFavorite={toggleFavorite}
          />
          <WordPicker
            word="Fresh"
            filter={fresh.filter}
            font={fresh.font}
            size={fresh.size}
            favorites={favorites}
            onFilterChange={(filter) => setFresh((s) => ({ ...s, filter }))}
            onFontChange={(font) => setFresh((s) => ({ ...s, font }))}
            onSizeChange={(size) => setFresh((s) => ({ ...s, size }))}
            onToggleFavorite={toggleFavorite}
          />
        </div>
        <Slider
          label="Gap"
          min={-100}
          max={200}
          value={gap}
          defaultValue={0}
          onChange={setGap}
        />
        <Slider
          label="Y offset"
          min={-100}
          max={100}
          value={offset}
          defaultValue={0}
          onChange={setOffset}
        />
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={swap}>
            &#8645; Swap
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!saved.loaded}
            onClick={save}
          >
            + Save
          </button>
        </div>
      </ControlsPanel>
      <SavedCombos
        ref={savedRef}
        combos={saved.combos}
        onLoad={load}
        onRemove={saved.remove}
      />
    </>
  );
}
