# Logo Font Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the dev-only logo experiment pick any Google Font for "Soul" and "Fresh", filtered by Google's "Feeling" tags, and save favourite combinations to a committed JSON file.

**Architecture:** `yarn cli fonts` gains a final step that turns the google/fonts repo's `tags/all/families.csv` into a committed `catalog.json` (family → feelings). The experiment page reads that JSON, drives two native `<select>`s per word, and loads only the selected families from Google Fonts. Saved combos round-trip through a dev-only Next Route Handler that reads and writes `saved.json` on disk.

**Tech Stack:** Next.js 15 App Router (static export, `*.dev.*` files are dev-only), React 19, strict TypeScript, Sass modules, Commander CLI run with `tsx`, Yarn 4, Node 22.

**Spec:** `docs/superpowers/specs/2026-11-27-logo-font-picker-design.md`

## Global Constraints

- There is no test framework. `yarn cli lint` (tsc then ESLint) is the check after every change. Ad-hoc checks run with `yarn tsx <file>`.
- **Never run `yarn cli build` while the dev server is running** — both write to `dist/`. Check with `lsof -iTCP:3000 -sTCP:LISTEN` first. The user's dev server is normally running; if it is, skip the build step and say so in your report.
- App code under `src/` must not import from `scripts/`.
- Everything in this plan is development-only. Nothing may change the production build output.
- Fonts are used at their default (400) weight only. No weights, italics or axes.
- `FEELING_THRESHOLD = 5`. A family's representative row is: the empty-variant row; else the row whose variant contains `wght@400`; else the first variant in file order.
- Match the surrounding code's comment density and style (short `/** */` doc comments on exported things; `//` comments only where the why isn't obvious).
- Commit after each task. Do not push. Commit messages end with:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01AKm7rqRaHPkZLQZKK9bxD7
  ```

## File Structure

| File | Responsibility |
|---|---|
| `scripts/fonts/catalog.ts` (create) | Download `families.csv`, parse CSV, build and format the catalog |
| `scripts/fonts/files.ts` (modify) | Add `catalogPath` |
| `scripts/commands/fonts.ts` (modify) | Run the catalog step after the per-font loop |
| `README.md` (modify) | Document the catalog step |
| `src/app/experiments/logo/generated/catalog.json` (generated, committed) | `{ feelings, fonts }` |
| `src/app/experiments/logo/catalog.ts` (create) | App-side access: `catalog`, `fontsForFeeling`, `googleFontsUrl` |
| `src/app/experiments/logo/WordPicker.tsx` (create) | Feeling + font selects for one word |
| `src/app/experiments/logo/Wordmark.tsx` (rewrite) | Page body: stage, controls, saved grid; owns font state |
| `src/app/experiments/logo/page.dev.tsx` (modify) | Drop the hardcoded fonts link |
| `src/app/experiments/logo/fonts.ts` (delete) | Hardcoded lists, replaced by the catalog |
| `src/app/experiments/logo/saved/route.dev.ts` (create) | `GET`/`PUT` for `saved.json` |
| `src/app/experiments/logo/useSavedCombos.ts` (create) | Client state + persistence hook |
| `src/app/experiments/logo/SavedCombos.tsx` (create) | Grid of saved cards |
| `src/app/experiments/logo/saved.json` (create) | `[]` initially |
| `src/app/experiments/logo/logo.module.scss` (modify) | Layout and card styles |
| `next.config.ts` (modify) | Add `"dev.ts"` to dev `pageExtensions` |

---

### Task 1: Catalog builder

**Files:**
- Create: `scripts/fonts/catalog.ts`
- Modify: `scripts/fonts/files.ts`
- Check script (scratch, not committed): `/private/tmp/claude-501/-Users-marcwren-Development-atom-dance-soul-fresh-v3/f0a58f68-cf3d-4a8c-9ada-c347daabd60d/scratchpad/catalog.check.ts`

**Interfaces:**
- Produces:
  ```ts
  // scripts/fonts/catalog.ts
  export const FEELING_THRESHOLD: number;          // 5
  export interface CatalogFont { family: string; feelings: string[] }
  export interface Catalog { feelings: string[]; fonts: CatalogFont[] }
  export function parseCsv(text: string): string[][];
  export function buildCatalog(csv: string): Catalog;
  export function formatCatalog(catalog: Catalog): string;
  export async function fetchFamiliesCsv(): Promise<string>;
  // scripts/fonts/files.ts
  export const catalogPath: string; // <repo>/src/app/experiments/logo/generated/catalog.json
  ```

- [ ] **Step 1: Write the failing check script**

Write this to the scratch path above (replace `<REPO>` with `/Users/marcwren/Development/atom-dance/soul-fresh-v3`):

```ts
import assert from "node:assert/strict";

import { buildCatalog, formatCatalog, parseCsv } from "<REPO>/scripts/fonts/catalog";

// CSV: quoted fields with commas and doubled quotes, CRLF, trailing newline.
assert.deepEqual(parseCsv('a,"b,c",d\r\n"x ""y""",,z\n'), [
  ["a", "b,c", "d"],
  ['x "y"', "", "z"],
]);

const csv = [
  "Static,,/Expressive/Calm,81",
  "Static,,/Expressive/Loud,3",
  "Static,,/Sans/Humanist,90",
  "Var,wght@400,/Expressive/Playful,20",
  "Var,wght@700,/Expressive/Cute,60",
  "Var,wght@400,/Expressive/Cute,4",
  'Wide,"wdth@100,wght@400",/Expressive/Happy,10.5',
  "Wide,wght@900,/Expressive/Happy,99",
  "Both,,/Expressive/Cute,2",
  "Both,wght@400,/Expressive/Cute,99",
  "NoDefault,wght@100,/Expressive/Stiff,50",
  "NoDefault,wght@900,/Expressive/Stiff,1",
  "Untagged,,/Sans/Geometric,50",
].join("\n");

const catalog = buildCatalog(csv);

// Feelings are only those some font actually has, sorted.
assert.deepEqual(catalog.feelings, ["Calm", "Happy", "Playful", "Stiff"]);
// Every family appears, sorted; feelings come from the representative row
// (static > wght@400 > first variant) at score >= 5.
assert.deepEqual(catalog.fonts, [
  { family: "Both", feelings: [] },
  { family: "NoDefault", feelings: ["Stiff"] },
  { family: "Static", feelings: ["Calm"] },
  { family: "Untagged", feelings: [] },
  { family: "Var", feelings: ["Playful"] },
  { family: "Wide", feelings: ["Happy"] },
]);

// One font per line, trailing newline, round-trips.
const text = formatCatalog(catalog);
assert.equal(text.endsWith("\n"), true);
assert.equal(text.split("\n").filter((l) => l.includes('"family"')).length, 6);
assert.deepEqual(JSON.parse(text), catalog);

console.log("ok");
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /Users/marcwren/Development/atom-dance/soul-fresh-v3 && yarn tsx <scratch>/catalog.check.ts`
Expected: fails with a module-not-found error for `scripts/fonts/catalog`.

- [ ] **Step 3: Add `catalogPath` to `scripts/fonts/files.ts`**

After the `GENERATED_DIR` constant add:

```ts
/** Google Fonts family → feelings catalog used by the logo experiment. */
export const catalogPath = path.join(
  ROOT,
  "src",
  "app",
  "experiments",
  "logo",
  "generated",
  "catalog.json",
);
```

- [ ] **Step 4: Create `scripts/fonts/catalog.ts`**

```ts
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
```

- [ ] **Step 5: Run the check script to verify it passes**

Run: `cd /Users/marcwren/Development/atom-dance/soul-fresh-v3 && yarn tsx <scratch>/catalog.check.ts`
Expected: `ok`

- [ ] **Step 6: Lint**

Run: `yarn cli lint`
Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add scripts/fonts/catalog.ts scripts/fonts/files.ts
git commit -m "feat: build a Google Fonts feeling catalog from families.csv

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01AKm7rqRaHPkZLQZKK9bxD7"
```

---

### Task 2: Catalog step in `yarn cli fonts`

**Files:**
- Modify: `scripts/commands/fonts.ts`
- Modify: `README.md` (CLI table row and "Fonts" section)
- Generated: `src/app/experiments/logo/generated/catalog.json`

**Interfaces:**
- Consumes from Task 1: `fetchFamiliesCsv`, `buildCatalog`, `formatCatalog`, `catalogPath`.
- Produces: the committed `catalog.json` matching `Catalog` from Task 1.

- [ ] **Step 1: Add the catalog step to the command**

In `scripts/commands/fonts.ts`, add to the imports:

```ts
import { buildCatalog, fetchFamiliesCsv, formatCatalog } from "../fonts/catalog";
```

and add `catalogPath` to the existing `../fonts/files` import. Then, inside the `.action` callback, directly after the closing `}` of the `for (const config of selectFonts(families))` loop (still inside the callback), add:

```ts
      // The catalog is family-independent, so only build it on a full run.
      // Rebuilding means re-downloading the CSV, hence --refetch not --force.
      if (families.length === 0) {
        console.log(color("bold", "Font catalog"));
        if (refetch || !existsSync(catalogPath)) {
          const catalog = buildCatalog(await fetchFamiliesCsv());
          await mkdir(path.dirname(catalogPath), { recursive: true });
          await writeFileAtomic(catalogPath, formatCatalog(catalog));
          step(
            "catalog",
            done("built") +
              color(
                "dim",
                ` (${catalog.fonts.length} fonts, ` +
                  `${catalog.feelings.length} feelings)`,
              ),
          );
        } else {
          step("catalog", skipped());
        }
      }
```

- [ ] **Step 2: Run the command to generate the catalog**

Run: `yarn cli fonts`
Expected: the two configured fonts report `skipped (exists)` for font/licence/glyphs, then:

```
Font catalog
  catalog  built (1950 fonts, 20 feelings)
```

(Counts may drift slightly as Google updates the CSV; ~1,950 / 20 is what matters.)

- [ ] **Step 3: Sanity-check the output**

Run:

```bash
cd /Users/marcwren/Development/atom-dance/soul-fresh-v3 && node -e '
const c = require("./src/app/experiments/logo/generated/catalog.json");
const count = (f) => c.fonts.filter((x) => x.feelings.includes(f)).length;
console.log("fonts", c.fonts.length, "feelings", c.feelings.length);
console.log("Playful", count("Playful"), "Cute", count("Cute"));
console.log("Lobster", c.fonts.find((x) => x.family === "Lobster").feelings);
'
git status --short
```

Expected: ~1950 fonts, 20 feelings, Playful ≈ 718, Cute ≈ 379, Lobster includes `Fancy` and `Playful`. `git status` shows only `scripts/commands/fonts.ts` modified and `src/app/experiments/logo/generated/` untracked — no glyph JSON changed.

- [ ] **Step 4: Verify the skip path**

Run: `yarn cli fonts`
Expected: `catalog  skipped (exists)`.

- [ ] **Step 5: Update the README**

In the CLI table, change the `fonts` row to:

```markdown
| `yarn cli fonts` | Fetch fonts, build glyph data and the font catalog (see below) |
```

In the "Fonts" section, after the paragraph ending `yarn cli fonts "Playfair Display"`.` add:

```markdown
On a full run (no family names), the command also builds
`src/app/experiments/logo/generated/catalog.json` for the logo experiment:
every Google Fonts family with its "Feeling" tags, derived from the
[google/fonts](https://github.com/google/fonts) repo's `tags/all/families.csv`.
It is skipped when the file exists; use `--refetch` to rebuild it.
```

- [ ] **Step 6: Lint**

Run: `yarn cli lint`
Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add scripts/commands/fonts.ts README.md src/app/experiments/logo/generated/catalog.json
git commit -m "feat: build the font catalog in yarn cli fonts

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01AKm7rqRaHPkZLQZKK9bxD7"
```

---

### Task 3: Feeling and font pickers

**Files:**
- Create: `src/app/experiments/logo/catalog.ts`
- Create: `src/app/experiments/logo/WordPicker.tsx`
- Rewrite: `src/app/experiments/logo/Wordmark.tsx`
- Modify: `src/app/experiments/logo/page.dev.tsx`
- Modify: `src/app/experiments/logo/logo.module.scss`
- Delete: `src/app/experiments/logo/fonts.ts`

**Interfaces:**
- Consumes: `generated/catalog.json` from Task 2.
- Produces:
  ```ts
  // catalog.ts
  export interface CatalogFont { family: string; feelings: string[] }
  export interface Catalog { feelings: string[]; fonts: CatalogFont[] }
  export const catalog: Catalog;
  export function fontsForFeeling(feeling: string | null): string[]; // null = Any
  export function googleFontsUrl(families: Iterable<string>): string;
  // WordPicker.tsx
  export interface WordPickerProps {
    word: string; feeling: string | null; font: string;
    onFeelingChange: (feeling: string | null) => void;
    onFontChange: (font: string) => void;
  }
  export function WordPicker(props: WordPickerProps): JSX.Element;
  // Wordmark.tsx
  export function Wordmark(): JSX.Element;
  ```
  Task 4 adds a save button and the saved grid to `Wordmark.tsx`; its state shape here is `interface WordState { feeling: string | null; font: string }` held as `soul` / `fresh`.

- [ ] **Step 1: Create `src/app/experiments/logo/catalog.ts`**

```ts
import data from "./generated/catalog.json";

export interface CatalogFont {
  family: string;
  feelings: string[];
}

export interface Catalog {
  feelings: string[];
  fonts: CatalogFont[];
}

/** Every Google Fonts family with its feelings. Built by `yarn cli fonts`. */
export const catalog: Catalog = data;

/** Family names with the given feeling, or all of them for `null` (Any). */
export function fontsForFeeling(feeling: string | null): string[] {
  const fonts = feeling
    ? catalog.fonts.filter((font) => font.feelings.includes(feeling))
    : catalog.fonts;
  return fonts.map((font) => font.family);
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
```

- [ ] **Step 2: Create `src/app/experiments/logo/WordPicker.tsx`**

```tsx
"use client";

import React from "react";

import { catalog, fontsForFeeling } from "./catalog";
import styles from "./logo.module.scss";

export interface WordPickerProps {
  /** Label, e.g. "Soul". */
  word: string;
  /** `null` is "Any". */
  feeling: string | null;
  font: string;
  onFeelingChange: (feeling: string | null) => void;
  onFontChange: (font: string) => void;
}

/** Feeling and font selects for one word of the logo. */
export function WordPicker({
  word,
  feeling,
  font,
  onFeelingChange,
  onFontChange,
}: WordPickerProps) {
  const fonts = fontsForFeeling(feeling);

  // Keep the font valid for the new feeling.
  const changeFeeling = (next: string | null) => {
    onFeelingChange(next);
    const nextFonts = fontsForFeeling(next);
    if (!nextFonts.includes(font)) onFontChange(nextFonts[0]);
  };

  // Up and down step straight to the previous or next font, wrapping
  // around, instead of opening the native picker (as macOS does).
  const onKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!step || e.altKey || e.metaKey) return;
    e.preventDefault();
    const index = fonts.indexOf(font);
    onFontChange(fonts[(index + step + fonts.length) % fonts.length]);
  };

  return (
    <fieldset className={styles.picker}>
      <legend>{word}</legend>
      <label>
        Feeling
        <select
          value={feeling ?? ""}
          onChange={(e) => changeFeeling(e.target.value || null)}
        >
          <option value="">Any</option>
          {catalog.feelings.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label>
        Font
        <select
          value={font}
          onChange={(e) => onFontChange(e.target.value)}
          onKeyDown={onKeyDown}
        >
          {fonts.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/experiments/logo/Wordmark.tsx`**

Replace the whole file with:

```tsx
"use client";

import React from "react";

import { fontsForFeeling, googleFontsUrl } from "./catalog";
import styles from "./logo.module.scss";
import { WordPicker } from "./WordPicker";

interface WordState {
  feeling: string | null;
  font: string;
}

const initialWord: WordState = { feeling: null, font: fontsForFeeling(null)[0] };

/** "Soul" and "Fresh" with a feeling and font picker for each word. */
export function Wordmark() {
  const [soul, setSoul] = React.useState(initialWord);
  const [fresh, setFresh] = React.useState(initialWord);

  return (
    <>
      <link
        rel="stylesheet"
        href={googleFontsUrl([soul.font, fresh.font])}
        precedence="default"
      />
      <section className={styles.stage}>
        <h1 className={styles.wordmark}>
          <span style={{ fontFamily: `"${soul.font}"` }}>Soul</span>
          <span style={{ fontFamily: `"${fresh.font}"` }}>Fresh</span>
        </h1>
      </section>
      <div className={styles.controls}>
        <WordPicker
          word="Soul"
          feeling={soul.feeling}
          font={soul.font}
          onFeelingChange={(feeling) => setSoul((s) => ({ ...s, feeling }))}
          onFontChange={(font) => setSoul((s) => ({ ...s, font }))}
        />
        <WordPicker
          word="Fresh"
          feeling={fresh.feeling}
          font={fresh.font}
          onFeelingChange={(feeling) => setFresh((s) => ({ ...s, feeling }))}
          onFontChange={(font) => setFresh((s) => ({ ...s, font }))}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 4: Update `src/app/experiments/logo/page.dev.tsx`**

Replace the whole file with:

```tsx
import styles from "./logo.module.scss";
import { Wordmark } from "./Wordmark";

export default function LogoExperiment() {
  return (
    <main className={styles.logo}>
      <a href="/experiments">&larr; Experiments</a>
      <Wordmark />
    </main>
  );
}
```

- [ ] **Step 5: Delete the hardcoded font lists**

Run: `git rm src/app/experiments/logo/fonts.ts`

- [ ] **Step 6: Update `src/app/experiments/logo/logo.module.scss`**

Replace the whole file with:

```scss
@use 'variables' as *;

.logo {
  padding: 2rem;
  font-family: $f-body;
}

// Fills the first screen; the saved grid scrolls in below it.
.stage {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 4rem);
}

.wordmark {
  display: flex;
  // Fonts have different ascents, so line the words up on their baselines.
  align-items: baseline;
  gap: 0.35em;
  margin: 0;
  font-size: 8rem;
  font-weight: normal;
}

.controls {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 16rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
}

.picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    padding: 0;
    font-weight: bold;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
}
```

- [ ] **Step 7: Lint**

Run: `yarn cli lint`
Expected: passes.

- [ ] **Step 8: Check the page renders**

If the dev server is running (`lsof -iTCP:3000 -sTCP:LISTEN`), run:
`curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/experiments/logo`
Expected: `200`. Then `curl -s localhost:3000/experiments/logo | grep -o 'fonts.googleapis.com/css2[^"]*' | head -1` shows a URL with exactly two `family=` parameters.

If it is not running, start it with `yarn cli start` in the background, do the check, and stop it.

- [ ] **Step 9: Commit**

```bash
git add -A src/app/experiments/logo
git commit -m "feat: pick any Google font per word, filtered by feeling

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01AKm7rqRaHPkZLQZKK9bxD7"
```

---

### Task 4: Saved combos

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/experiments/logo/saved/route.dev.ts`
- Create: `src/app/experiments/logo/saved.json`
- Create: `src/app/experiments/logo/useSavedCombos.ts`
- Create: `src/app/experiments/logo/SavedCombos.tsx`
- Modify: `src/app/experiments/logo/Wordmark.tsx`
- Modify: `src/app/experiments/logo/logo.module.scss`

**Interfaces:**
- Consumes from Task 3: `fontsForFeeling`, `googleFontsUrl`, `WordPicker`, `styles.stage/.wordmark/.controls`.
- Produces:
  ```ts
  // useSavedCombos.ts
  export interface SavedCombo { id: string; soul: string; fresh: string }
  export function useSavedCombos(): {
    combos: SavedCombo[];
    add: (soul: string, fresh: string) => void;
    remove: (id: string) => void;
  };
  // SavedCombos.tsx
  export function SavedCombos(props: {
    combos: SavedCombo[];
    onLoad: (combo: SavedCombo) => void;
    onRemove: (id: string) => void;
  }): JSX.Element | null;
  ```
  HTTP: `GET /experiments/logo/saved` → `SavedCombo[]`; `PUT` same path with a `SavedCombo[]` body → `204`.

- [ ] **Step 1: Route `route.dev.ts` files in development**

In `next.config.ts` change the `pageExtensions` line to:

```ts
  pageExtensions: isProduction ? ["tsx", "ts"] : ["dev.tsx", "dev.ts", "tsx", "ts"],
```

- [ ] **Step 2: Create `src/app/experiments/logo/saved.json`**

Contents (exactly):

```json
[]
```

- [ ] **Step 3: Create `src/app/experiments/logo/saved/route.dev.ts`**

```ts
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Next refuses to serve a route handler under `output: "export"` without
// this, even in development. The .dev extension already keeps the route out
// of production builds, so it never actually gets exported.
export const dynamic = "force-static";

// `yarn cli start` runs from the repo root.
const FILE = path.join(
  process.cwd(),
  "src",
  "app",
  "experiments",
  "logo",
  "saved.json",
);

/** The saved combos; an empty list if the file doesn't exist yet. */
export async function GET() {
  try {
    return new Response(await readFile(FILE, "utf8"), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return Response.json([]);
    }
    throw error;
  }
}

/** Replace the file with the request body (the full list of combos). */
export async function PUT(request: Request) {
  const combos: unknown = await request.json();
  if (!Array.isArray(combos)) {
    return new Response("Expected a JSON array", { status: 400 });
  }
  // Write then rename so a failure never leaves a half-written file.
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(combos, null, 2) + "\n");
  await rename(temp, FILE);
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 4: Create `src/app/experiments/logo/useSavedCombos.ts`**

```ts
"use client";

import React from "react";

export interface SavedCombo {
  id: string;
  /** Family name for "Soul". */
  soul: string;
  /** Family name for "Fresh". */
  fresh: string;
}

const ENDPOINT = "/experiments/logo/saved";

/**
 * Saved font combinations, persisted to saved.json through the dev-only
 * route handler. Changes apply locally at once and are written after; a
 * failed write is logged and the local state stands.
 */
export function useSavedCombos() {
  const [combos, setCombos] = React.useState<SavedCombo[]>([]);

  React.useEffect(() => {
    fetch(ENDPOINT)
      .then((response) => {
        if (!response.ok) throw new Error(`GET ${ENDPOINT}: ${response.status}`);
        return response.json() as Promise<SavedCombo[]>;
      })
      .then(setCombos)
      .catch(console.error);
  }, []);

  const update = (next: SavedCombo[]) => {
    setCombos(next);
    fetch(ENDPOINT, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`PUT ${ENDPOINT}: ${response.status}`);
      })
      .catch(console.error);
  };

  const add = (soul: string, fresh: string) => {
    if (combos.some((c) => c.soul === soul && c.fresh === fresh)) return;
    update([...combos, { id: crypto.randomUUID(), soul, fresh }]);
  };

  const remove = (id: string) => update(combos.filter((c) => c.id !== id));

  return { combos, add, remove };
}
```

- [ ] **Step 5: Create `src/app/experiments/logo/SavedCombos.tsx`**

```tsx
"use client";

import styles from "./logo.module.scss";
import type { SavedCombo } from "./useSavedCombos";

/** Grid of saved combinations. Click a card to load it, × to remove it. */
export function SavedCombos({
  combos,
  onLoad,
  onRemove,
}: {
  combos: SavedCombo[];
  onLoad: (combo: SavedCombo) => void;
  onRemove: (id: string) => void;
}) {
  if (combos.length === 0) return null;

  return (
    <section className={styles.saved}>
      <h2>Saved</h2>
      <ul>
        {combos.map((combo) => (
          <li key={combo.id} className={styles.card}>
            <button
              type="button"
              className={styles.load}
              onClick={() => onLoad(combo)}
            >
              <span className={styles.wordmark}>
                <span style={{ fontFamily: `"${combo.soul}"` }}>Soul</span>
                <span style={{ fontFamily: `"${combo.fresh}"` }}>Fresh</span>
              </span>
              <span className={styles.names}>
                {combo.soul} + {combo.fresh}
              </span>
            </button>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${combo.soul} + ${combo.fresh}`}
              onClick={() => onRemove(combo.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 6: Wire saving into `Wordmark.tsx`**

Replace the whole file with:

```tsx
"use client";

import React from "react";

import { fontsForFeeling, googleFontsUrl } from "./catalog";
import styles from "./logo.module.scss";
import { SavedCombos } from "./SavedCombos";
import { type SavedCombo, useSavedCombos } from "./useSavedCombos";
import { WordPicker } from "./WordPicker";

interface WordState {
  feeling: string | null;
  font: string;
}

const initialWord: WordState = { feeling: null, font: fontsForFeeling(null)[0] };

/**
 * "Soul" and "Fresh" with a feeling and font picker for each word, plus the
 * combinations saved so far.
 */
export function Wordmark() {
  const [soul, setSoul] = React.useState(initialWord);
  const [fresh, setFresh] = React.useState(initialWord);
  const saved = useSavedCombos();

  // The saved cards render in their own fonts, so load those too.
  const families = [
    soul.font,
    fresh.font,
    ...saved.combos.flatMap((c) => [c.soul, c.fresh]),
  ];

  // "Any" feeling, so each font is guaranteed to be in its list.
  const load = (combo: SavedCombo) => {
    setSoul({ feeling: null, font: combo.soul });
    setFresh({ feeling: null, font: combo.fresh });
  };

  return (
    <>
      <link
        rel="stylesheet"
        href={googleFontsUrl(families)}
        precedence="default"
      />
      <section className={styles.stage}>
        <h1 className={styles.wordmark}>
          <span style={{ fontFamily: `"${soul.font}"` }}>Soul</span>
          <span style={{ fontFamily: `"${fresh.font}"` }}>Fresh</span>
        </h1>
      </section>
      <div className={styles.controls}>
        <WordPicker
          word="Soul"
          feeling={soul.feeling}
          font={soul.font}
          onFeelingChange={(feeling) => setSoul((s) => ({ ...s, feeling }))}
          onFontChange={(font) => setSoul((s) => ({ ...s, font }))}
        />
        <WordPicker
          word="Fresh"
          feeling={fresh.feeling}
          font={fresh.font}
          onFeelingChange={(feeling) => setFresh((s) => ({ ...s, feeling }))}
          onFontChange={(font) => setFresh((s) => ({ ...s, font }))}
        />
        <button
          type="button"
          className={styles.save}
          onClick={() => saved.add(soul.font, fresh.font)}
        >
          + Save
        </button>
      </div>
      <SavedCombos
        combos={saved.combos}
        onLoad={load}
        onRemove={saved.remove}
      />
    </>
  );
}
```

- [ ] **Step 7: Add the save button and card styles**

Append to `src/app/experiments/logo/logo.module.scss`:

```scss
.save {
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.25rem;
  background: white;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.saved {
  h2 {
    margin: 0 0 1rem;
    font-size: 1rem;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}

.card {
  position: relative;
  padding: 1.5rem 1rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;

  // Roughly a third of the stage size.
  .wordmark {
    font-size: 2.75rem;
  }
}

.load {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.names {
  font-size: 0.75rem;
  color: #666;
}

.remove {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  border: 0;
  background: none;
  font-size: 1.25rem;
  line-height: 1;
  color: #666;
  cursor: pointer;

  &:hover {
    color: black;
  }
}
```

- [ ] **Step 8: Lint**

Run: `yarn cli lint`
Expected: passes.

- [ ] **Step 9: Exercise the route**

The `next.config.ts` change needs a dev server restart. If a dev server is already running on :3000 (`lsof -iTCP:3000 -sTCP:LISTEN`) it belongs to the user — do **not** kill it; skip this step and tell the user in your report that the server must be restarted for the route to be picked up. Otherwise start `yarn cli start` in the background and run:

```bash
curl -s -w ' [%{http_code}]\n' localhost:3000/experiments/logo/saved
curl -s -w ' [%{http_code}]\n' -X PUT -H 'content-type: application/json' \
  -d '[{"id":"test","soul":"Lobster","fresh":"Anton"}]' localhost:3000/experiments/logo/saved
curl -s -w ' [%{http_code}]\n' localhost:3000/experiments/logo/saved
curl -s -w ' [%{http_code}]\n' -X PUT -H 'content-type: application/json' \
  -d '[]' localhost:3000/experiments/logo/saved
cat src/app/experiments/logo/saved.json
```

Expected: `[] [200]`, ` [204]`, the combo `[200]`, ` [204]`, and the file ends as `[]`. Stop the server you started.

- [ ] **Step 10: Commit**

```bash
git add next.config.ts src/app/experiments/logo
git commit -m "feat: save logo font combinations to saved.json

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01AKm7rqRaHPkZLQZKK9bxD7"
```

---

### Task 5: Final verification

**Files:** none changed unless a check fails.

- [ ] **Step 1: Lint from a clean tree**

Run: `git status --short && yarn cli lint`
Expected: empty status, lint passes.

- [ ] **Step 2: Production build excludes the experiment**

Only if **no** dev server is running (`lsof -iTCP:3000 -sTCP:LISTEN` prints nothing):

```bash
yarn cli build && find dist -path '*experiments*' | head
```

Expected: build succeeds and `find` prints nothing. Then `git status --short` is still empty (`dist/` is ignored).

If the dev server is running, skip this and report that the build check still needs to be run by the user with the server stopped.

- [ ] **Step 3: Report**

List, for the user: the manual pass still to do in the browser at `/experiments/logo` (choose a feeling, arrow through fonts, save, refresh, click a card, remove, watch `saved.json`), whether the dev server needs restarting for `next.config.ts`, and whether the build check was run.
