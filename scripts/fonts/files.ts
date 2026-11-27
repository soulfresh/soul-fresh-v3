import { rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { FontConfig } from "./types";

const ROOT = path.resolve(__dirname, "..", "..");
const FONTS_DIR = path.join(ROOT, "assets", "fonts");
const GENERATED_DIR = path.join(ROOT, "src", "fonts", "generated");

/** Folder name used by the google/fonts repo, e.g. "playfairdisplay". */
export function familySlug(family: string) {
  return family.toLowerCase().replace(/\s+/g, "");
}

/** e.g. "700-italic". */
function variant({ weight, italic }: FontConfig) {
  return `${weight}${italic ? "-italic" : ""}`;
}

/** e.g. "Playfair Display 700 italic". */
export function fontLabel({ family, weight, italic }: FontConfig) {
  return `${family} ${weight}${italic ? " italic" : ""}`;
}

/** Folder holding a family's fonts and licence. */
export function fontDir(config: FontConfig) {
  return path.join(FONTS_DIR, familySlug(config.family));
}

/** e.g. assets/fonts/playfairdisplay/700-italic.ttf */
export function fontPath(config: FontConfig) {
  return path.join(fontDir(config), `${variant(config)}.ttf`);
}

/** e.g. src/fonts/generated/playfairdisplay-700-italic.json */
export function glyphDataPath(config: FontConfig) {
  return path.join(
    GENERATED_DIR,
    `${familySlug(config.family)}-${variant(config)}.json`,
  );
}

/**
 * Write to a temporary file and rename it into place, so a failure never
 * leaves a partial file that a later run would treat as done.
 */
export async function writeFileAtomic(file: string, data: string | Buffer) {
  const temp = `${file}.tmp`;
  await writeFile(temp, data);
  await rename(temp, file);
}
