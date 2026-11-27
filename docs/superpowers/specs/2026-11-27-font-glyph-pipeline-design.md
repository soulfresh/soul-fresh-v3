# Font Glyph Pipeline Design

## Goal

Turn Google Fonts into committed glyph data (outlines plus metrics) that the
site can render and animate letter by letter, using the stretch animation in
`src/app/experiments/logo/stretch.ts`. A project CLI runs the pipeline:
`yarn cli fonts`.

The logo will eventually use one font for "Soul" and another for "Fresh",
so the pipeline handles any number of fonts listed in a config file.

## Decisions

- **Output is a glyph library per font**, not pre-laid-out words. Text is
  laid out at runtime by `layoutText`, and every letter stays a separate
  shape so it can be animated on its own.
- **Source fonts are committed** in `assets/fonts/`, with their licence
  files. This pins the exact font version (regenerating gives identical
  output) and removes any runtime or build-time dependency on Google Fonts.
- **Generated glyph data is committed** as JSON in `src/fonts/generated/`.
  The site build never touches the network or the font files.
- **CLI uses Commander**, run with `tsx` so it can import project TypeScript
  (including `@/` path aliases).
- **Outlines are cubic only.** TrueType quadratic curves are converted to
  cubics (an exact conversion), so glyph shapes use the same `M` / `L` /
  `C` / `Z` segments as the stretch prototype and need no new path support.
- **Ligatures and other OpenType substitutions are out of scope.** One
  character maps to one glyph.

## Files

```
fonts.config.ts                   # which fonts to fetch and build
assets/fonts/                     # committed source fonts
  <family-slug>/
    <weight>[-italic].ttf
    OFL.txt                       # (or LICENSE.txt / UFL.txt)
scripts/
  cli.ts                          # Commander entry point
  fonts/
    types.ts                      # FontConfig
    fetch.ts                      # Google Fonts → assets/fonts/
    build.ts                      # TTF → glyph JSON
src/fonts/
  types.ts                        # Point, Segment, Shape, FontData, Glyph
  layout.ts                       # layoutText
  index.ts                        # typed exports of each generated font
  generated/
    <family-slug>-<weight>[-italic].json
```

`<family-slug>` is the family name lowercased with spaces removed, matching
the google/fonts repo (`Playfair Display` → `playfairdisplay`).

The shape types (`Point`, `Segment`, `Shape`) move from `stretch.ts` to
`src/fonts/types.ts`; `stretch.ts` imports them from there so the glyph data
and the animation share one definition.

## Config

`fonts.config.ts` at the repo root:

```ts
import type { FontConfig } from "./scripts/fonts/types";

export default [
  { family: "Archivo Black", weight: 400 },
  { family: "Playfair Display", weight: 700, italic: true },
] satisfies FontConfig[];
```

```ts
interface FontConfig {
  family: string;      // Google Fonts family name, exactly as listed
  weight: number;      // 100–900
  italic?: boolean;    // default false
  characters?: string; // default: printable ASCII (U+0020–U+007E)
}
```

The two starting fonts are placeholders that contrast clearly (a heavy
grotesque and a high-contrast italic serif) so the experiment exercises
both straight-sided and curvy outlines. They are expected to change.

## CLI

`package.json`: `"cli": "tsx scripts/cli.ts"`.

- `yarn cli fonts` — for each config entry: fetch the font if its TTF is not
  in `assets/fonts/`, then build its JSON if not in `src/fonts/generated/`.
  Prints one line per entry saying what it fetched, built, or skipped.
- `yarn cli fonts <family...>` — the same, limited to the named families
  (matched case-insensitively against `family`). An unknown name is an
  error listing the configured families.
- `--force` — rebuild JSON even if it exists.
- `--refetch` — re-download fonts even if they exist (implies `--force`).

The scripts are covered by the root `tsconfig.json` (`**/*.ts`), so
`yarn lint` type-checks them too.

New dev dependencies: `commander`, `fontkit@^2.0.4`, `@types/fontkit`,
`tsx`.

**Why fontkit, not opentype.js:** Google fonts commonly wrap their GPOS
kerning in extension lookups (lookup type 9), which opentype.js (1.3 and
2.0) cannot parse — it reported zero kerning pairs for Playfair Display.
fontkit implements full GPOS (696 pairs for Playfair Display 700 italic,
271 for Archivo Black). fontkit 3 is ESM-only and the project's scripts run
as CommonJS under `tsx`, so pin fontkit 2, whose CommonJS build works under
`tsx` (verified).

## Fetch

1. Request `https://fonts.googleapis.com/css2?family=<Family+Name>:ital,wght@<0|1>,<weight>`
   with no browser User-Agent. Google then returns CSS whose `src` is a
   single, unsubset `.ttf` URL. (Verified: Playfair Display 700 italic and
   Archivo Black both return one `format('truetype')` URL.)
2. Extract the URL from the CSS and download the TTF to
   `assets/fonts/<slug>/<weight>[-italic].ttf`.
3. Download the licence from the google/fonts repo, trying in order:
   `ofl/<slug>/OFL.txt`, `apache/<slug>/LICENSE.txt`, `ufl/<slug>/UFL.txt`
   on `https://raw.githubusercontent.com/google/fonts/main/`. Save it beside
   the font under its original name. If none exists, print a warning and
   continue. Skip if a licence file already exists in the folder (unless
   `--refetch`).

Errors — a non-200 CSS response (unknown family or unavailable weight), no
`.ttf` URL in the CSS, or a failed download — exit non-zero with a message
naming the config entry. Files are written to a temporary name and renamed
when complete, so a failure never leaves a partial file that a later run
would skip.

## Build

1. Load the TTF with `fontkit.openSync`.
2. For each character in the config's character set:
   - If `font.hasGlyphForCodePoint` is false, skip it and record it in
     `missing`.
   - Read `glyph.path.commands` (`moveTo`, `lineTo`, `quadraticCurveTo`,
     `bezierCurveTo`, `closePath`), which are in font units with y up.
   - Flip y so the output is in SVG orientation: y down, baseline at 0.
   - Drop `lineTo` commands that go nowhere (to the current point).
   - Convert quadratic curves to cubics:
     `c1 = p0 + 2/3·(q − p0)`, `c2 = p + 2/3·(q − p)`.
   - Round every coordinate to 2 decimals.
   - Record `advanceWidth` and the ink `bounds` (computed from all points,
     including control points, after the flip). A glyph with no outline
     (space) has an empty shape and `bounds: null`.
3. For every ordered pair of characters in the set, lay the pair out with
   `font.layout(pair, { liga: false })` and take the kerning as
   `positions[0].xAdvance − glyphs[0].advanceWidth`. Skip pairs that don't
   lay out as two glyphs, and keep only non-zero values.
4. Write `src/fonts/generated/<slug>-<weight>[-italic].json` with 2-space
   indentation.

## Data format

All values are in font units, y down, baseline at 0.

```ts
interface FontData {
  family: string;
  weight: number;
  italic: boolean;
  unitsPerEm: number;
  ascender: number;   // negative: above the baseline in y-down
  descender: number;  // positive: below the baseline in y-down
  capHeight: number;  // positive distance above the baseline
  xHeight: number;    // positive distance above the baseline
  glyphs: Record<string, Glyph>;   // keyed by the character
  kerning: Record<string, number>; // keyed by the two characters, e.g. "Fo"
  missing: string[];               // requested characters the font lacks
}

interface Glyph {
  shape: Shape;
  advanceWidth: number;
  bounds: { x1: number; y1: number; x2: number; y2: number } | null;
}
```

`ascender` and `descender` are stored with their y-down signs so they can be
used directly as coordinates. `capHeight` and `xHeight` are stored as
positive heights because they are used as measurements (for example, to
scale two fonts to the same cap height). `ascender`/`descender` come from
fontkit's `ascent`/`descent` (negated), and `capHeight`/`xHeight` from its
`capHeight`/`xHeight`; if either of those is 0 or missing, it falls back to
the ink height of `H` / `x`.

## Layout

`src/fonts/layout.ts`:

```ts
interface LaidOutGlyph {
  char: string;
  shape: Shape; // scaled to `size` and positioned on the line
  x: number;    // pen position where this glyph starts, in output units
}

interface LaidOutText {
  glyphs: LaidOutGlyph[]; // spaces and missing characters are omitted
  width: number;          // pen position after the last character
}

function layoutText(
  font: FontData,
  text: string,
  options: { size: number; letterSpacing?: number },
): LaidOutText;
```

- Scale is `size / font.unitsPerEm`; `size` is the em size in output units.
- The pen starts at 0. For each character: if it has a glyph with a
  non-empty shape, emit it translated to the pen position; then advance by
  `advanceWidth + kerning[prev + char]` (scaled) plus `letterSpacing`
  (already in output units). Characters missing from the font advance by
  nothing and emit nothing.
- The baseline is y = 0 in the output.
- Merging glyphs into one `Shape` (for a single sweep across a word) is a
  plain concatenation of their shapes; no helper is needed.

`src/fonts/index.ts` imports each generated JSON file and exports it typed
as `FontData` (for example `export const archivoBlack400 = data as FontData`).
Adding a font to the config means adding one export line here.

## Experiment update

The logo experiment (`/experiments/logo`) replaces the hand-made L and O
with "Soul" in the first config font and "Fresh" in the second, laid out
with `layoutText`:

- Both words are scaled so their cap heights match.
- "Soul" and "Fresh" sit on one line with a word gap between them, centered
  on the origin.
- All letters are merged into one shape, so the stretch, the control-point
  option, the points overlay and the blend mode keep working as before.
- The viewBox calculation stays as is (bounds of the shape plus the max
  distance).

The hand-made `L_SHAPE` / `O_SHAPE` and the `ellipse`, `polygon` and
`translate` helpers they need may be deleted if nothing else uses them.

## Verification

There is no test framework, so:

- `yarn lint` passes.
- `yarn cli fonts` on a clean checkout fetches and builds both fonts; a
  second run prints "skipped" for every step and changes no files
  (`git status` clean).
- `--force` rebuilds byte-identical JSON.
- Spot checks on the generated data: `H` has only `M`/`L`/`Z` segments in a
  grotesque; `o` has two subpaths; space has an empty shape and a positive
  `advanceWidth`; `missing` is empty for printable ASCII in both fonts.
- The logo experiment renders "Soul Fresh" and the stretch animation runs
  with every control.

Don't run `yarn build` while the dev server is running: both use `dist/`.

## Out of scope

- Ligatures, contextual alternates and other OpenType substitutions.
- Variable fonts (the Google Fonts CSS API serves static instances).
- Multi-line layout, alignment and text wrapping.
- Shipping the font files to the browser (they stay outside `public/`).
