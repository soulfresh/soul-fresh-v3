"use client";

import styles from "./logo.module.scss";
import type { SavedCombo } from "./useSavedCombos";

/** Grid of saved combinations. Click a card to load it, × to remove it. */
export function SavedCombos({
  combos,
  onLoad,
  onRemove,
}: {
  combos: SavedCombo[];
  onLoad: (combo: SavedCombo) => void;
  onRemove: (id: string) => void;
}) {
  if (combos.length === 0) return null;

  return (
    <section className={styles.saved}>
      <h2>Saved</h2>
      <ul>
        {combos.map((combo) => (
          <li key={combo.id} className={styles.card}>
            <button
              type="button"
              className={styles.load}
              onClick={() => onLoad(combo)}
            >
              <span className={styles.wordmark}>
                <span style={{ fontFamily: `"${combo.soul}"` }}>Soul</span>
                <span style={{ fontFamily: `"${combo.fresh}"` }}>Fresh</span>
              </span>
              <span className={styles.names}>
                {combo.soul} + {combo.fresh}
              </span>
            </button>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${combo.soul} + ${combo.fresh}`}
              onClick={() => onRemove(combo.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
