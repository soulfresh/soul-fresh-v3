export interface FontConfig {
  /** Google Fonts family name, exactly as listed on fonts.google.com. */
  family: string;
  /** 100–900. */
  weight: number;
  italic?: boolean;
  /** Characters to build glyphs for. Defaults to printable ASCII. */
  characters?: string;
}

/** U+0020 (space) through U+007E (~). */
export const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i),
).join("");
