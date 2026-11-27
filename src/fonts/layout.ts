import type { FontData, Point, Segment, Shape } from "./types";

export interface LaidOutGlyph {
  char: string;
  /** Outline scaled to the layout size and moved to its place on the line. */
  shape: Shape;
  /** Pen position where this glyph starts. */
  x: number;
}

export interface LaidOutText {
  /** Glyphs with ink. Spaces and characters the font lacks are left out. */
  glyphs: LaidOutGlyph[];
  /** Pen position after the last character. */
  width: number;
}

export interface LayoutOptions {
  /** Em size in output units. */
  size: number;
  /** Extra space between characters, in output units. */
  letterSpacing?: number;
}

/**
 * Set `text` on a single line starting at x = 0 with the baseline at y = 0,
 * applying the font's advance widths and kerning.
 */
export function layoutText(
  font: FontData,
  text: string,
  { size, letterSpacing = 0 }: LayoutOptions,
): LaidOutText {
  const scale = size / font.unitsPerEm;
  const glyphs: LaidOutGlyph[] = [];
  let pen = 0;
  let previous: string | undefined;

  for (const char of Array.from(text)) {
    const glyph = font.glyphs[char];
    if (!glyph) continue;

    if (previous !== undefined) {
      pen += letterSpacing + (font.kerning[previous + char] ?? 0) * scale;
    }
    if (glyph.shape.length > 0) {
      glyphs.push({ char, x: pen, shape: place(glyph.shape, scale, pen) });
    }
    pen += glyph.advanceWidth * scale;
    previous = char;
  }

  return { glyphs, width: pen };
}

/** `shape` scaled by `scale` and moved right by `dx`. */
function place(shape: Shape, scale: number, dx: number): Shape {
  return shape.map(
    ([command, ...points]) =>
      [
        command,
        ...points.map(([x, y]): Point => [x * scale + dx, y * scale]),
      ] as Segment,
  );
}
