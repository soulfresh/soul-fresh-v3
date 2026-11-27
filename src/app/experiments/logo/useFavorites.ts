"use client";

import { useJsonFile } from "./useJsonFile";

/** Favorited font families (for either word), persisted to favorites.json. */
export function useFavorites() {
  const { value: favorites, set } = useJsonFile<string[]>(
    "/experiments/logo/favorites",
    [],
  );

  const toggle = (font: string) =>
    set(
      favorites.includes(font)
        ? favorites.filter((f) => f !== font)
        : [...favorites, font],
    );

  return { favorites, toggle };
}
