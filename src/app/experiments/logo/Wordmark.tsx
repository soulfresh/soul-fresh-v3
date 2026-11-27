"use client";

import React from "react";

import { fontsForFeeling, googleFontsUrl } from "./catalog";
import styles from "./logo.module.scss";
import { WordPicker } from "./WordPicker";

interface WordState {
  feeling: string | null;
  font: string;
}

const initialWord: WordState = { feeling: null, font: fontsForFeeling(null)[0] };

/** "Soul" and "Fresh" with a feeling and font picker for each word. */
export function Wordmark() {
  const [soul, setSoul] = React.useState(initialWord);
  const [fresh, setFresh] = React.useState(initialWord);

  return (
    <>
      <link
        rel="stylesheet"
        href={googleFontsUrl([soul.font, fresh.font])}
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
      </div>
    </>
  );
}
