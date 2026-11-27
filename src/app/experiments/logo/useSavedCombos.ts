"use client";

import { useJsonFile } from "./useJsonFile";

export interface SavedCombo {
  id: string;
  /** Family name for "Soul". */
  soul: string;
  /** Family name for "Fresh". */
  fresh: string;
}

/** Saved font combinations, persisted to saved.json. */
export function useSavedCombos() {
  const { value: combos, loaded, set } = useJsonFile<SavedCombo[]>(
    "/experiments/logo/saved",
    [],
  );

  const add = (soul: string, fresh: string) => {
    if (combos.some((c) => c.soul === soul && c.fresh === fresh)) return;
    set([...combos, { id: crypto.randomUUID(), soul, fresh }]);
  };

  const remove = (id: string) => set(combos.filter((c) => c.id !== id));

  return { combos, loaded, add, remove };
}
