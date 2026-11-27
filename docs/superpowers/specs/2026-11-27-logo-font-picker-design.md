# Logo experiment: any Google font, Feeling filter, saved combos

**Date:** 2026-11-27
**Scope:** the dev-only experiment at `src/app/experiments/logo/`

## Goal

Let the logo experiment compare any two Google Fonts for "Soul" and "Fresh",
narrowed by the Google Fonts "Feeling" filter, stepped through quickly with
the arrow keys, and save combinations worth keeping to a committed JSON file
so they survive refreshes and show side by side.

## Non-goals

- Weights, italics or variable axes. Each font is used at its default (400)
  weight, as today.
- Other Google Fonts filters (category, language, etc.).
- In-font previews inside the picker. The stage is the preview.
- A custom dropdown. Native `<select>` is enough for ~2,000 text options.
- Anything in the production build. Everything here is `*.dev.*`.

## 1. Font catalog (built by `yarn cli fonts`)

### Source

`https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv`
is the data behind the Google Fonts site's filters. Shape (checked
2026-11-27): no header; one row per family × variant × tag:

```
Family,Variant,Tag,Score
ABeeZee,,/Expressive/Calm,81
AR One Sans,wght@700,/Expressive/Active,23
```

- `Variant` is empty for static fonts and an axis string for variable ones.
  Fields may be quoted (e.g. `"wdth@...,wght@..."`), so parse as real CSV.
- `Score` is 0–100 and may be a decimal (`10.5`).
- Tags under `/Expressive/` are the 20 "Feelings". Other prefixes (`/Sans/`,
  `/Quality/`, `/Theme/`, …) are ignored.
- 1,950 families at time of writing.

### Output

`src/app/experiments/logo/generated/catalog.json`, committed like the glyph
JSON:

```ts
interface Catalog {
  feelings: string[]; // e.g. ["Active", "Artistic", …], sorted
  fonts: { family: string; feelings: string[] }[]; // sorted by family
}
```

A family has a feeling when its **representative row** for that tag scores
**≥ 5**. The representative row is chosen per family, in order:

1. the row with an empty `Variant` column (static fonts);
2. else the row whose `Variant` is, or contains, `wght@400` (a variable
   font's default instance);
3. else the family's first variant in file order.

`FEELING_THRESHOLD = 5` is a named constant in the build code. Families with
no feeling over the threshold are still listed with `feelings: []`, so "Any
feeling" shows the whole library.

Why this rule: fonts.google.com's filter logic is closed source, so the rule
was calibrated against the site's own counts on 2026-11-27 (Playful 716 of
1,961, Cute 363). This rule gives Playful 708 and Cute 364; the common
third-party convention of "any variant ≥ 50" gives 219 and 85, which is
clearly not what the site does. The remaining gap is most likely the site
serving a different revision of the CSV than `main`, and is not worth
chasing. Known limitation: multi-axis variants such as `wdth,wght@100,400` never match the `wght@400` test, so about 63 families fall back to their first variant; the calibration depends on this, so it stays. Record the calibration counts in a comment next to the constant.

### Command changes

Extend the existing `fonts` command rather than adding a new one:

- New module `scripts/fonts/catalog.ts`: `fetchFamiliesCsv()`,
  `buildCatalog(csv: string): Catalog`, and `catalogPath` (in `files.ts`).
  Parsing is a small hand-written RFC-4180-enough CSV reader (quotes, commas
  in quotes); no new dependency.
- `scripts/commands/fonts.ts`: after the per-font loop, when **no family
  arguments were given**, run a `catalog` step. It is skipped if
  `catalog.json` exists unless `--refetch` is set (the CSV is not kept on
  disk, so rebuilding always means re-downloading; `--force` alone does not
  rebuild it). Log in the existing `step()` style, e.g.
  `catalog   built (1950 fonts, 20 feelings)` or `skipped (exists)`.
- README "Fonts" section: one paragraph describing the catalog step.

## 2. Picker UI (`Wordmark.tsx` and friends)

### Layout

The page becomes a normal scrolling page: stage on top (full viewport
height, wordmark centered), saved grid below. The controls panel stays
`position: fixed` top-right so it is reachable while scrolling.

### Controls panel

Per word ("Soul", "Fresh"), two selects stacked:

1. **Feeling** — `Any` plus the 20 feelings from the catalog.
2. **Font** — the catalog's fonts filtered by the chosen feeling, names only.

Then a **+ Save** button spanning the panel.

### Behaviour

- Changing a feeling refilters its font list. If the current font is not in
  the new list, select the list's first font.
- The font select keeps the existing arrow-key stepping (wrap around, ignore
  Alt/Meta).
- Fonts load through one `<link rel="stylesheet" precedence="default">` to
  `fonts.googleapis.com/css2?family=A&family=B…&display=swap` built from the
  two selected families **plus every family used by a saved combo**,
  deduplicated and sorted so the URL is stable. The hardcoded `fonts.ts`
  lists and `fontsUrl` are deleted.
- Initial fonts: the first font of the catalog for each word (feeling `Any`).

### Code shape

- `catalog.ts` (app side): imports the JSON, exports `catalog`,
  `fontsForFeeling(feeling: string | null)`, and `googleFontsUrl(families)`.
- `Wordmark.tsx` becomes the page body: stage, controls, saved grid. Font
  state lives here as `{ soul: string; fresh: string }`.
- `WordPicker.tsx`: the feeling + font selects for one word (the current
  `FontSelect` logic moves here).
- `SavedCombos.tsx`: the grid.
- `useSavedCombos.ts`: persistence hook (section 3).
- `logo.module.scss`: stage, controls, saved grid styles.

## 3. Saved combos

### Data

`src/app/experiments/logo/saved.json`, committed:

```ts
interface SavedCombo {
  id: string; // crypto.randomUUID()
  soul: string; // family name
  fresh: string;
}
// file contents: SavedCombo[]
```

### UI

- **+ Save** appends the current pair. Saving a pair that already exists
  (same `soul` and `fresh`) is a no-op.
- Each card in the grid renders "Soul Fresh" in its fonts at roughly a third
  of stage size, baseline-aligned like the stage, with the family names
  underneath and a **×** button to remove it.
- Clicking a card (not the ×) loads its fonts into the pickers and sets both
  feelings to `Any` so the font appears in each list.

### Persistence

`src/app/experiments/logo/saved/route.dev.ts` — a Route Handler. The `.dev`
extension keeps it out of production builds via `pageExtensions`, which is
what makes a dynamic route compatible with `output: "export"`. Two details
verified against the running dev server on 2026-11-27:

- `pageExtensions` in `next.config.ts` is `["dev.tsx", "tsx", "ts"]` in
  development; `"dev.ts"` must be added or `route.dev.ts` is not routed.
  (Changing `next.config.ts` requires restarting the dev server.)
- Even in `next dev`, `output: "export"` makes Next reject a route handler
  with a 500 unless it declares `export const dynamic = "force-static"`.
  With that export, `GET` and `PUT` both run normally in dev and `GET` is
  not cached between requests. The route must include it.

- `GET /experiments/logo/saved` → `SavedCombo[]`; a missing file is `[]`.
- `PUT /experiments/logo/saved` with body `SavedCombo[]` → replaces the file,
  written atomically (temp file + `rename`, same idea as
  `writeFileAtomic` in `scripts/fonts/files.ts`, but implemented in the
  route so app code does not import from `scripts/`), pretty-printed with a
  trailing newline. Responds `204`. The file path is resolved from
  `process.cwd()`, which is the repo root under `yarn cli start`.

`useSavedCombos()` returns `{ combos, add(soul, fresh), remove(id) }`. It
GETs on mount (renders the grid empty until then — this is a dev tool, no
loading state), updates local state optimistically on add/remove, then PUTs
the full array. A failed request is `console.error`ed; the local state
stands.

The whole-array PUT is deliberate: it is one route, one write, and the file
stays tidy. Concurrent edits are not a concern for a single developer's
local tool.

## 4. Verification

There is no test framework; the check after changes is `yarn cli lint`.

1. `yarn cli lint` passes (covers `scripts/` and `src/`).
2. `yarn cli fonts --refetch` logs the catalog step; `catalog.json` has
   ~1,950 fonts and 20 feelings; roughly 708 fonts carry Playful and 364
   Cute (the calibration counts); a known font has sensible feelings (e.g.
   "Lobster" includes Fancy and Playful). A second run without flags
   reports `skipped (exists)`.
3. Manual pass in `yarn cli start` at `/experiments/logo`: choose a feeling,
   arrow through fonts and watch the stage change; save a combo; refresh and
   see it; click it to reload it; remove it; confirm `saved.json` tracks
   each change.
4. `yarn cli build` (dev server stopped) succeeds and `dist/` contains
   nothing from `experiments/`.
