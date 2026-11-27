"use client";

import type React from "react";

import styles from "./logo.module.scss";
import { type SavedCombo, withDefaults } from "./useSavedCombos";

/** Cards show the combo at this fraction of its stage size. */
const CARD_SCALE = 1 / 3;

/** Grid of saved combinations. Click a card to load it, × to remove it. */
export function SavedCombos({
  ref,
  combos,
  onLoad,
  onRemove,
}: {
  ref: React.Ref<HTMLElement>;
  combos: SavedCombo[];
  onLoad: (combo: SavedCombo) => void;
  onRemove: (id: string) => void;
}) {
  if (combos.length === 0) return null;

  return (
    <section ref={ref} className={styles.saved}>
      <h2>Saved</h2>
      <ul>
        {combos.map((saved) => {
          const combo = withDefaults(saved);
          return (
            <li key={combo.id} className={styles.card}>
              <button
                type="button"
                className={styles.load}
                onClick={() => onLoad(saved)}
              >
                <span className={styles.wordmark}>
                  <span
                    style={{
                      fontFamily: `"${combo.soul}"`,
                      fontSize: combo.soulSize * CARD_SCALE,
                    }}
                  >
                    Soul
                  </span>
                  <span
                    style={{
                      fontFamily: `"${combo.fresh}"`,
                      fontSize: combo.freshSize * CARD_SCALE,
                      marginLeft: combo.gap * CARD_SCALE,
                      position: "relative",
                      top: combo.offset * CARD_SCALE,
                    }}
                  >
                    Fresh
                  </span>
                </span>
                <span className={styles.names}>
                  {combo.soul} {combo.soulSize}px + {combo.fresh}{" "}
                  {combo.freshSize}px · gap {combo.gap}px · y {combo.offset}px
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
          );
        })}
      </ul>
    </section>
  );
}
