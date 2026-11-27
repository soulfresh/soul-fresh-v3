import * as fontkit from "fontkit";

import type {
  Bounds,
  FontData,
  Glyph,
  Point,
  Segment,
  Shape,
} from "../../src/fonts/types";
import { fontLabel, fontPath } from "./files";
import { PRINTABLE_ASCII, type FontConfig } from "./types";

/** Read a fetched font and extract its glyphs, metrics and kerning. */
export async function buildFont(config: FontConfig): Promise<FontData> {
  const font = fontkit.openSync(fontPath(config));
  if (!("layout" in font)) {
    throw new Error(`${fontLabel(config)}: expected a font, got a collection`);
  }

  const characters = [...new Set(config.characters ?? PRINTABLE_ASCII)];
  const glyphs: Record<string, Glyph> = {};
  const missing: string[] = [];
  for (const char of characters) {
    const codePoint = char.codePointAt(0)!;
    if (!font.hasGlyphForCodePoint(codePoint)) {
      missing.push(char);
      continue;
    }
    const glyph = font.glyphForCodePoint(codePoint);
    const shape = toShape(glyph.path.commands);
    glyphs[char] = {
      shape,
      advanceWidth: glyph.advanceWidth,
      bounds: shapeBounds(shape),
    };
  }

  // Kerning is whatever the font's layout adds to the first glyph's advance
  // when the pair is set together. Ligatures are off so pairs like "fi"
  // stay two glyphs.
  const present = Object.keys(glyphs);
  const kerning: Record<string, number> = {};
  for (const left of present) {
    for (const right of present) {
      const run = font.layout(left + right, { liga: false });
      if (run.glyphs.length !== 2) continue;
      const value = run.positions[0].xAdvance - run.glyphs[0].advanceWidth;
      if (value !== 0) kerning[left + right] = round(value);
    }
  }

  return {
    family: config.family,
    weight: config.weight,
    italic: config.italic ?? false,
    unitsPerEm: font.unitsPerEm,
    // fontkit measures up from the baseline; flip to y down.
    ascender: -font.ascent,
    descender: -font.descent,
    capHeight: font.capHeight || inkHeight(glyphs["H"]),
    xHeight: font.xHeight || inkHeight(glyphs["x"]),
    glyphs,
    kerning,
    missing,
  };
}

/**
 * Convert fontkit path commands (font units, y up, quadratic or cubic
 * curves) to a cubic-only Shape with y down.
 */
function toShape(commands: fontkit.PathCommand[]): Shape {
  const shape: Shape = [];
  const point = (x: number, y: number): Point => [x, -y];
  let current: Point = [0, 0];

  for (const { command, args } of commands) {
    switch (command) {
      case "moveTo":
        current = point(args[0], args[1]);
        shape.push(["M", current]);
        break;
      case "lineTo": {
        const to = point(args[0], args[1]);
        // Skip lines that go nowhere.
        if (to[0] === current[0] && to[1] === current[1]) break;
        shape.push(["L", to]);
        current = to;
        break;
      }
      case "quadraticCurveTo": {
        // A quadratic curve is exactly the cubic whose control points sit
        // two thirds of the way from each end toward the quadratic one.
        const q = point(args[0], args[1]);
        const to = point(args[2], args[3]);
        shape.push(["C", lerp(current, q, 2 / 3), lerp(to, q, 2 / 3), to]);
        current = to;
        break;
      }
      case "bezierCurveTo": {
        const to = point(args[4], args[5]);
        shape.push([
          "C",
          point(args[0], args[1]),
          point(args[2], args[3]),
          to,
        ]);
        current = to;
        break;
      }
      case "closePath":
        shape.push(["Z"]);
        break;
    }
  }

  return shape.map(
    ([command, ...points]) =>
      [
        command,
        ...points.map(([x, y]): Point => [round(x), round(y)]),
      ] as Segment,
  );
}

function shapeBounds(shape: Shape): Bounds | null {
  const points = shape.flatMap(([, ...points]) => points);
  if (points.length === 0) return null;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    x1: Math.min(...xs),
    y1: Math.min(...ys),
    x2: Math.max(...xs),
    y2: Math.max(...ys),
  };
}

/** Height of a glyph's ink above the baseline, or 0 without a glyph. */
function inkHeight(glyph: Glyph | undefined) {
  return glyph?.bounds ? -glyph.bounds.y1 : 0;
}

function lerp([x1, y1]: Point, [x2, y2]: Point, t: number): Point {
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * JSON with 2-space indentation, but each point and each segment on one
 * line so the files stay readable and diffable.
 */
export function formatFontData(data: FontData): string {
  return (
    JSON.stringify(data, null, 2)
      // [x, y]
      .replace(
        /\[\s+(-?\d+(?:\.\d+)?),\s+(-?\d+(?:\.\d+)?)\s+\]/g,
        "[$1, $2]",
      )
      // ["C", [x, y], [x, y], [x, y]]
      .replace(
        /\[\s+("[MLCZ]")((?:,\s+\[[^[\]]+\])*)\s+\]/g,
        (_, command: string, points: string) =>
          `[${command}${points.replace(/,\s+\[/g, ", [")}]`,
      ) + "\n"
  );
}
