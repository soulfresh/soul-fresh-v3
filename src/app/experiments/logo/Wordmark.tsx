"use client";

import React from "react";

import { fontsForFeeling, googleFontsUrl } from "./catalog";
import styles from "./logo.module.scss";
import { SavedCombos } from "./SavedCombos";
import { type SavedCombo, useSavedCombos } from "./useSavedCombos";
import { WordPicker } from "./WordPicker";

interface WordState {
  feeling: string | null;
  font: string;
}

const initialWord: WordState = { feeling: null, font: fontsForFeeling(null)[0] };

/**
 * "Soul" and "Fresh" with a feeling and font picker for each word, plus the
 * combinations saved so far.
 */
export function Wordmark() {
  const [soul, setSoul] = React.useState(initialWord);
  const [fresh, setFresh] = React.useState(initialWord);
  const saved = useSavedCombos();

  // The saved cards render in their own fonts, so load those too.
  const families = [
    soul.font,
    fresh.font,
    ...saved.combos.flatMap((c) => [c.soul, c.fresh]),
  ];

  // "Any" feeling, so each font is guaranteed to be in its list.
  const load = (combo: SavedCombo) => {
    setSoul({ feeling: null, font: combo.soul });
    setFresh({ feeling: null, font: combo.fresh });
  };

  // Swap feelings along with fonts so each font stays in its word's list.
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
          <span style={{ fontFamily: `"${soul.font}"` }}>Soul</span>
          <span style={{ fontFamily: `"${fresh.font}"` }}>Fresh</span>
        </h1>
      </section>
      <div className={styles.controls}>
        <WordPicker
          word="Soul"
          feeling={soul.feeling}
          font={soul.font}
          onFeelingChange={(feeling) => setSoul((s) => ({ ...s, feeling }))}
          onFontChange={(font) => setSoul((s) => ({ ...s, font }))}
        />
        <WordPicker
          word="Fresh"
          feeling={fresh.feeling}
          font={fresh.font}
          onFeelingChange={(feeling) => setFresh((s) => ({ ...s, feeling }))}
          onFontChange={(font) => setFresh((s) => ({ ...s, font }))}
        />
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
