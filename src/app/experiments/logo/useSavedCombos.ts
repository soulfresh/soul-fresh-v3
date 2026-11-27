"use client";

import React from "react";

export interface SavedCombo {
  id: string;
  /** Family name for "Soul". */
  soul: string;
  /** Family name for "Fresh". */
  fresh: string;
}

const ENDPOINT = "/experiments/logo/saved";

/**
 * Saved font combinations, persisted to saved.json through the dev-only
 * route handler. Changes apply locally at once and are written after; a
 * failed write is logged and the local state stands.
 */
export function useSavedCombos() {
  const [combos, setCombos] = React.useState<SavedCombo[]>([]);

  React.useEffect(() => {
    fetch(ENDPOINT)
      .then((response) => {
        if (!response.ok) throw new Error(`GET ${ENDPOINT}: ${response.status}`);
        return response.json() as Promise<SavedCombo[]>;
      })
      .then(setCombos)
      .catch(console.error);
  }, []);

  const update = (next: SavedCombo[]) => {
    setCombos(next);
    fetch(ENDPOINT, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`PUT ${ENDPOINT}: ${response.status}`);
      })
      .catch(console.error);
  };

  const add = (soul: string, fresh: string) => {
    if (combos.some((c) => c.soul === soul && c.fresh === fresh)) return;
    update([...combos, { id: crypto.randomUUID(), soul, fresh }]);
  };

  const remove = (id: string) => update(combos.filter((c) => c.id !== id));

  return { combos, add, remove };
}
