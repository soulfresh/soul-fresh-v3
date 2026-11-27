"use client";

import { useJsonFile } from "./useJsonFile";

/** Stage font size in pixels when nothing else is chosen (8rem). */
export const DEFAULT_SIZE = 128;
/**
 * Gap for combos saved before the gap existed: the stage then used a fixed
 * 0.35em, about 40px at the default size.
 */
export const LEGACY_GAP = 40;

export interface SavedCombo {
  id: string;
  /** Family name for "Soul". */
  soul: string;
  /** Family name for "Fresh". */
  fresh: string;
  // Sizes and gap are in pixels. Combos saved before these existed lack
  // them; `withDefaults` fills them in.
  soulSize?: number;
  freshSize?: number;
  gap?: number;
  /** How far "Fresh" sits below its baseline position (negative is up). */
  offset?: number;
}

/** A combo with every optional layout field filled in. */
export function withDefaults(combo: SavedCombo): Required<SavedCombo> {
  return {
    ...combo,
    soulSize: combo.soulSize ?? DEFAULT_SIZE,
    freshSize: combo.freshSize ?? DEFAULT_SIZE,
    gap: combo.gap ?? LEGACY_GAP,
    offset: combo.offset ?? 0,
  };
}

function sameCombo(a: SavedCombo, b: SavedCombo) {
  const x = withDefaults(a);
  const y = withDefaults(b);
  return (
    x.soul === y.soul &&
    x.fresh === y.fresh &&
    x.soulSize === y.soulSize &&
    x.freshSize === y.freshSize &&
    x.gap === y.gap &&
    x.offset === y.offset
  );
}

/** Saved font combinations, persisted to saved.json. */
export function useSavedCombos() {
  const { value: combos, loaded, set } = useJsonFile<SavedCombo[]>(
    "/experiments/logo/saved",
    [],
  );

  const add = (combo: Omit<SavedCombo, "id">) => {
    const candidate = { id: crypto.randomUUID(), ...combo };
    if (combos.some((c) => sameCombo(c, candidate))) return;
    set([...combos, candidate]);
  };

  const remove = (id: string) => set(combos.filter((c) => c.id !== id));

  return { combos, loaded, add, remove };
}
