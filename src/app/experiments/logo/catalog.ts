import data from "./generated/catalog.json";

export interface CatalogFont {
  family: string;
  feelings: string[];
}

export interface Catalog {
  feelings: string[];
  fonts: CatalogFont[];
}

/** Every Google Fonts family with its feelings. Built by `yarn cli fonts`. */
export const catalog: Catalog = data;

/** Feeling-select value that filters to the favorited fonts instead. */
export const FAVORITES = "favorites";

/**
 * Family names with the given feeling, the favorited ones for `FAVORITES`,
 * or all of them for `null` (Any). Always in catalog order.
 */
export function fontsForFeeling(
  feeling: string | null,
  favorites: string[],
): string[] {
  const fonts =
    feeling === FAVORITES
      ? catalog.fonts.filter((font) => favorites.includes(font.family))
      : feeling
        ? catalog.fonts.filter((font) => font.feelings.includes(feeling))
        : catalog.fonts;
  return fonts.map((font) => font.family);
}

/** Google Fonts stylesheet URL loading each family at its default weight. */
export function googleFontsUrl(families: Iterable<string>): string {
  // Sorted and deduplicated so the same set always gives the same URL.
  const unique = [...new Set(families)].sort();
  return (
    "https://fonts.googleapis.com/css2?" +
    unique.map((family) => `family=${family.replace(/ /g, "+")}`).join("&") +
    "&display=swap"
  );
}
