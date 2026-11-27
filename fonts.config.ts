import type { FontConfig } from "./scripts/fonts/types";

// Fonts for `yarn cli fonts`. Placeholders chosen to contrast: a heavy
// grotesque for "Soul" and a high-contrast italic serif for "Fresh".
export default [
  { family: "Archivo Black", weight: 400 },
  { family: "Playfair Display", weight: 700, italic: true },
] satisfies FontConfig[];
