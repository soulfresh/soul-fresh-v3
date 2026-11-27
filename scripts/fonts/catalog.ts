/** Tag data behind the fonts.google.com filters, maintained by Google. */
export const FAMILIES_CSV_URL =
  "https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv";

/**
 * Minimum score for a family's representative row to count as having a
 * tag. fonts.google.com's filter is closed source, so this was calibrated
 * against the site on 2026-11-27: it listed Playful 716 of 1,961 families
 * and Cute 363; this rule gives 708 and 364. (The common third-party guess
 * of 50 gives 219 and 85.) The same cut is used for the appearance tags.
 */
export const TAG_THRESHOLD = 5;

const FEELING_GROUP = "Expressive";

/**
 * CSV tag groups shown as appearance filters, mapped to the group the site
 * files them under: "Slab" tags appear inside the site's Serif filter as
 * "Slab Clarendon" and so on, and "Script" is the site's Calligraphy.
 */
const APPEARANCE_GROUPS: Record<string, string> = {
  Sans: "Sans",
  Serif: "Serif",
  Slab: "Serif",
  Script: "Script",
};

export interface CatalogFont {
  family: string;
  /** Sorted feeling names, e.g. ["Calm", "Playful"]. */
  feelings: string[];
  /** Sorted "Group/Style" tags, e.g. ["Serif/Slab Clarendon"]. */
  appearances: string[];
}

export interface Catalog {
  /** Every feeling that at least one font has, sorted. */
  feelings: string[];
  /** Each appearance group's styles that at least one font has, sorted. */
  appearances: Record<string, string[]>;
  /** Every family in the CSV, sorted by name. */
  fonts: CatalogFont[];
}

interface TagRow {
  /** "" for static fonts, else an axis string such as "wght@700". */
  variant: string;
  /** e.g. "/Expressive/Calm" or "/Slab/Clarendon". */
  tag: string;
  score: number;
}

export async function fetchFamiliesCsv(): Promise<string> {
  const response = await fetch(FAMILIES_CSV_URL);
  if (!response.ok) {
    throw new Error(
      `Downloading ${FAMILIES_CSV_URL} returned ${response.status}`,
    );
  }
  return response.text();
}

/**
 * Parse CSV text into rows of fields. Handles quoted fields containing
 * commas and doubled quotes, and CRLF or LF line endings.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char !== '"') {
        field += char;
      } else if (text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        quoted = false;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * The variant whose scores stand for the whole family: the static font,
 * else the variable font's default instance, else whatever is listed first.
 */
function representativeVariant(variants: string[]): string {
  if (variants.includes("")) return "";
  // Known limitation: multi-axis variants ("wdth,wght@100,400") never match,
  // so those families fall through to their first variant. Calibration
  // depends on this; see the design spec.
  return variants.find((v) => v.includes("wght@400")) ?? variants[0];
}

/** "/Slab/Clarendon" → "Serif/Slab Clarendon"; `undefined` for other groups. */
function appearanceOf(tag: string): string | undefined {
  const [, group, style] = tag.split("/");
  const shown = APPEARANCE_GROUPS[group];
  if (!shown) return undefined;
  return `${shown}/${group === shown ? style : `${group} ${style}`}`;
}

export function buildCatalog(csv: string): Catalog {
  const rowsByFamily = new Map<string, TagRow[]>();
  for (const fields of parseCsv(csv)) {
    if (fields.length < 4) continue;
    const [family, variant, tag, score] = fields;
    const rows = rowsByFamily.get(family) ?? [];
    rows.push({ variant, tag, score: Number(score) });
    rowsByFamily.set(family, rows);
  }

  const feelings = new Set<string>();
  const appearances = new Map<string, Set<string>>();
  const fonts: CatalogFont[] = [];
  for (const [family, rows] of rowsByFamily) {
    const variant = representativeVariant([
      ...new Set(rows.map((r) => r.variant)),
    ]);
    const tags = rows
      .filter((r) => r.variant === variant && r.score >= TAG_THRESHOLD)
      .map((r) => r.tag);

    const fontFeelings = new Set<string>();
    const fontAppearances = new Set<string>();
    for (const tag of tags) {
      const [, group, name] = tag.split("/");
      if (group === FEELING_GROUP) {
        fontFeelings.add(name);
        feelings.add(name);
        continue;
      }
      const appearance = appearanceOf(tag);
      if (!appearance) continue;
      fontAppearances.add(appearance);
      const [shownGroup, style] = appearance.split("/");
      const styles = appearances.get(shownGroup) ?? new Set();
      styles.add(style);
      appearances.set(shownGroup, styles);
    }

    fonts.push({
      family,
      feelings: [...fontFeelings].sort(),
      appearances: [...fontAppearances].sort(),
    });
  }
  fonts.sort((a, b) => a.family.localeCompare(b.family, "en"));

  return {
    feelings: [...feelings].sort(),
    appearances: Object.fromEntries(
      [...appearances]
        .sort(([a], [b]) => a.localeCompare(b, "en"))
        .map(([group, styles]) => [group, [...styles].sort()]),
    ),
    fonts,
  };
}

/** JSON with one font per line, so diffs stay readable. */
export function formatCatalog({
  feelings,
  appearances,
  fonts,
}: Catalog): string {
  const lines = fonts.map((font) => `    ${JSON.stringify(font)}`);
  return (
    `{\n  "feelings": ${JSON.stringify(feelings)},\n` +
    `  "appearances": ${JSON.stringify(appearances)},\n` +
    `  "fonts": [\n${lines.join(",\n")}\n  ]\n}\n`
  );
}
