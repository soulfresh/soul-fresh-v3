/** Tag data behind the fonts.google.com filters, maintained by Google. */
export const FAMILIES_CSV_URL =
  "https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv";

/**
 * Minimum score for a family's representative row to count as having a
 * feeling. fonts.google.com's filter is closed source, so this was
 * calibrated against the site on 2026-11-27: it listed Playful 716 of
 * 1,961 families and Cute 363; this rule gives 718 and 379. (The common
 * third-party guess of 50 gives 219 and 85.)
 */
export const FEELING_THRESHOLD = 5;

const FEELING_PREFIX = "/Expressive/";

export interface CatalogFont {
  family: string;
  /** Sorted feeling names, e.g. ["Calm", "Playful"]. */
  feelings: string[];
}

export interface Catalog {
  /** Every feeling that at least one font has, sorted. */
  feelings: string[];
  /** Every family in the CSV, sorted by name. */
  fonts: CatalogFont[];
}

interface TagRow {
  family: string;
  /** "" for static fonts, else an axis string such as "wght@700". */
  variant: string;
  /** Feeling name without the /Expressive/ prefix. */
  feeling: string;
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
  return variants.find((v) => v.includes("wght@400")) ?? variants[0];
}

export function buildCatalog(csv: string): Catalog {
  const families = new Set<string>();
  const rowsByFamily = new Map<string, TagRow[]>();

  for (const fields of parseCsv(csv)) {
    if (fields.length < 4) continue;
    const [family, variant, tag, score] = fields;
    families.add(family);
    if (!tag.startsWith(FEELING_PREFIX)) continue;
    const rows = rowsByFamily.get(family) ?? [];
    rows.push({
      family,
      variant,
      feeling: tag.slice(FEELING_PREFIX.length),
      score: Number(score),
    });
    rowsByFamily.set(family, rows);
  }

  const feelings = new Set<string>();
  const fonts: CatalogFont[] = [];
  for (const family of families) {
    const rows = rowsByFamily.get(family) ?? [];
    const variant = representativeVariant([
      ...new Set(rows.map((r) => r.variant)),
    ]);
    const fontFeelings = new Set(
      rows
        .filter((r) => r.variant === variant && r.score >= FEELING_THRESHOLD)
        .map((r) => r.feeling),
    );
    for (const feeling of fontFeelings) feelings.add(feeling);
    fonts.push({ family, feelings: [...fontFeelings].sort() });
  }
  fonts.sort((a, b) => a.family.localeCompare(b.family));

  return { feelings: [...feelings].sort(), fonts };
}

/** JSON with one font per line, so diffs stay readable. */
export function formatCatalog({ feelings, fonts }: Catalog): string {
  const lines = fonts.map((font) => `    ${JSON.stringify(font)}`);
  return (
    `{\n  "feelings": ${JSON.stringify(feelings)},\n` +
    `  "fonts": [\n${lines.join(",\n")}\n  ]\n}\n`
  );
}
