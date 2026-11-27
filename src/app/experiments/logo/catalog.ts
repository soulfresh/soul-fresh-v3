import data from "./generated/catalog.json";

export interface CatalogFont {
  family: string;
  feelings: string[];
  /** "Group/Style" tags, e.g. "Serif/Slab Clarendon". */
  appearances: string[];
}

export interface Catalog {
  feelings: string[];
  /** Appearance group → its styles, e.g. Sans → ["Geometric", …]. */
  appearances: Record<string, string[]>;
  fonts: CatalogFont[];
}

/** Every Google Fonts family with its tags. Built by `yarn cli fonts`. */
export const catalog: Catalog = data;

/** Appearance groups in the order the pickers show them. */
export const APPEARANCE_GROUPS = ["Sans", "Serif", "Script"];

/** Feeling-select value that filters to the favorited fonts instead. */
export const FAVORITES = "favorites";

export interface FontFilter {
  /** A feeling, `FAVORITES`, or `null` for Any. */
  feeling: string | null;
  /** A group ("Sans"), a "Group/Style" tag, or `null` for All. */
  appearance: string | null;
}

export const NO_FILTER: FontFilter = { feeling: null, appearance: null };

function hasAppearance(font: CatalogFont, appearance: string): boolean {
  return appearance.includes("/")
    ? font.appearances.includes(appearance)
    : font.appearances.some((a) => a.startsWith(`${appearance}/`));
}

/** Family names matching every part of the filter, in catalog order. */
export function filterFonts(
  { feeling, appearance }: FontFilter,
  favorites: string[],
): string[] {
  return catalog.fonts
    .filter((font) =>
      feeling === FAVORITES
        ? favorites.includes(font.family)
        : feeling
          ? font.feelings.includes(feeling)
          : true,
    )
    .filter((font) => (appearance ? hasAppearance(font, appearance) : true))
    .map((font) => font.family);
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
