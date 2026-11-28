# Soul Fresh website

Next.js 15 (App Router, static export) · React 19 · strict TypeScript · Sass
modules · Yarn 4 · Node 22 (`.nvmrc`). Deployed to Firebase Hosting by GitHub
Actions on merge to `main`.

## Commands

Every task runs through the project CLI; `package.json` has only the `cli`
script, and `./sf <command>` is a shortcut for `yarn cli <command>`. See the
README's CLI section for details.

- `yarn cli start` — dev server on :3000
- `yarn cli build` — static build into `dist/`
- `yarn cli serve` — serve `dist/`
- `yarn cli lint` — `tsc` then ESLint. There is no test framework; this is
  the check to run after changes.
- `yarn cli typecheck` — `tsc` only
- `yarn cli release` — manual Firebase deploy
- `yarn cli fonts` — fetch Google Fonts and build glyph JSON

The CLI lives in `scripts/` (Commander, run with `tsx`): `cli.ts` wires up
the commands in `scripts/commands/`.

## Gotchas

- **Avoid running `yarn cli build` while the dev server is running.** The
  dev server works in `dist/dev`, and the static export clears all of `dist/`
  (`distDir` in `next.config.ts`) first, which can take the dev server down.
- `*.dev.tsx` pages and `*.dev.ts` route handlers (e.g. `saved/route.dev.ts`)
  exist only in development (`pageExtensions`). Under `output: "export"` a
  route handler needs `export const dynamic = "force-static"` even in dev.
  Experiments live under `src/app/experiments/`.
- Components using randomness or browser APIs render `null` until mounted, to
  avoid hydration mismatches.

## Fonts and glyphs

`fonts.config.ts` lists the fonts. `yarn cli fonts` downloads them into
`assets/fonts/` and builds `src/fonts/generated/*.json` (outlines in font
units, y down, baseline at 0, cubic curves only). Adding a font also needs an
export line in `src/fonts/index.ts`. `layoutText` in `src/fonts/layout.ts`
positions glyphs on a line. Fonts, licences and generated JSON are committed;
use `--force` to rebuild after changing a font's config. A full
`yarn cli fonts` run also builds `src/app/experiments/logo/generated/catalog.json`
(Google Fonts families + Feeling and appearance tags) for the logo experiment.

## Working here

Don't commit or push unless asked.
