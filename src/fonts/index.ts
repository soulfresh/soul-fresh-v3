import archivoBlack400Data from "./generated/archivoblack-400.json";
import playfairDisplay700ItalicData from "./generated/playfairdisplay-700-italic.json";
import type { FontData } from "./types";

// JSON imports are typed from their contents; fonts are FontData.
const font = (data: unknown) => data as FontData;

export const archivoBlack400 = font(archivoBlack400Data);
export const playfairDisplay700Italic = font(playfairDisplay700ItalicData);

export { layoutText } from "./layout";
export type { LaidOutGlyph, LaidOutText, LayoutOptions } from "./layout";
export type * from "./types";
