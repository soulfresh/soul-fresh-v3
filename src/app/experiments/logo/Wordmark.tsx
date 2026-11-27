"use client";

import React from "react";

import {
  filterFonts,
  type FontFilter,
  googleFontsUrl,
  NO_FILTER,
} from "./catalog";
import styles from "./logo.module.scss";
import { SavedCombos } from "./SavedCombos";
import { useFavorites } from "./useFavorites";
import { type SavedCombo, useSavedCombos } from "./useSavedCombos";
import { WordPicker } from "./WordPicker";

interface WordState {
  filter: FontFilter;
  font: string;
}

const initialWord: WordState = {
  filter: NO_FILTER,
  font: filterFonts(NO_FILTER, [])[0],
};

/**
 * "Soul" and "Fresh" with a feeling and font picker for each word, plus the
 * combinations saved so far.
 */
export function Wordmark() {
  const [soul, setSoul] = React.useState(initialWord);
  const [fresh, setFresh] = React.useState(initialWord);
  // Space between the words on the stage, in pixels.
  const [gap, setGap] = React.useState(40);
  const saved = useSavedCombos();
  const { favorites, toggle: toggleFavorite } = useFavorites();

  // The saved cards render in their own fonts, so load those too.
  const families = [
    soul.font,
    fresh.font,
    ...saved.combos.flatMap((c) => [c.soul, c.fresh]),
  ];

  // No filter, so each font is guaranteed to be in its list.
  const load = (combo: SavedCombo) => {
    setSoul({ filter: NO_FILTER, font: combo.soul });
    setFresh({ filter: NO_FILTER, font: combo.fresh });
  };

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
        <h1 className={styles.wordmark} style={{ gap }}>
          <span style={{ fontFamily: `"${soul.font}"` }}>Soul</span>
          <span style={{ fontFamily: `"${fresh.font}"` }}>Fresh</span>
        </h1>
      </section>
      <div className={styles.controls}>
        <div className={styles.pickers}>
          <WordPicker
            word="Soul"
            filter={soul.filter}
            font={soul.font}
            favorites={favorites}
            onFilterChange={(filter) => setSoul((s) => ({ ...s, filter }))}
            onFontChange={(font) => setSoul((s) => ({ ...s, font }))}
            onToggleFavorite={toggleFavorite}
          />
          <WordPicker
            word="Fresh"
            filter={fresh.filter}
            font={fresh.font}
            favorites={favorites}
            onFilterChange={(filter) => setFresh((s) => ({ ...s, filter }))}
            onFontChange={(font) => setFresh((s) => ({ ...s, font }))}
            onToggleFavorite={toggleFavorite}
          />
        </div>
        <label className={styles.slider}>
          <span>Gap</span>
          <input
            type="range"
            min={-40}
            max={200}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
          />
          <output>{gap}px</output>
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={swap}>
            &#8645; Swap
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!saved.loaded}
            onClick={() => saved.add(soul.font, fresh.font)}
          >
            + Save
          </button>
        </div>
      </div>
      <SavedCombos
        combos={saved.combos}
        onLoad={load}
        onRemove={saved.remove}
      />
    </>
  );
}
