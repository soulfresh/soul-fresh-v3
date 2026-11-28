## Soul Fresh Website

The app uses the following libraries:

 - Yarn 4
 - [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
 - Firebase
 - SCSS

## Getting Started

```bash
yarn install
yarn cli start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## CLI

Every project task runs through the project CLI (`scripts/cli.ts`), which is
the only script in `package.json`:

```bash
yarn cli --help          # list commands
yarn cli <command> --help
```

`./sf` in the repo root is a shortcut for `yarn cli`: `./sf start`,
`./sf fonts --force`, and so on.

| Command | What it does |
|---|---|
| `yarn cli start` | Start the dev server on http://localhost:3000 |
| `yarn cli build` | Build the static site into `dist/` |
| `yarn cli serve` | Serve the built site from `dist/` |
| `yarn cli lint` | Type-check, then run ESLint |
| `yarn cli typecheck` | Type-check only |
| `yarn cli release` | Deploy to Firebase Hosting by hand |
| `yarn cli fonts` | Fetch fonts, build glyph data and the font catalog (see below) |

Extra arguments are passed through to the underlying tool, for example
`yarn cli start --port 3001` or `yarn cli serve -l 4000`.

The build clears `dist/` before exporting, including the dev server's files in
`dist/dev`, so stop the dev server before running `yarn cli build`.

### Fonts

`yarn cli fonts` turns the Google Fonts listed in `fonts.config.ts` into glyph
data for animating letters:

1. Downloads each font (TTF) and its licence into `assets/fonts/<family>/`.
2. Builds `src/fonts/generated/<family>-<weight>.json`: each character's
   outline as SVG path segments, plus metrics and kerning.

Steps whose output already exists are skipped. Use `--force` to rebuild the
glyph data (for example after changing a font's `characters`) and `--refetch`
to download the fonts again too. Pass family names to work on just those:
`yarn cli fonts "Playfair Display"`.

On a full run (no family names), the command also builds
`src/app/experiments/logo/generated/catalog.json` for the logo experiment:
every Google Fonts family with its "Feeling" and appearance tags, from the
[google/fonts](https://github.com/google/fonts) repo's `tags/all/families.csv`.
It is skipped when the file exists; use `--refetch` to rebuild it.

After adding a font to `fonts.config.ts`, add an export for its JSON in
`src/fonts/index.ts`. The fonts, licences and generated JSON are all
committed.

### Creating videos

- Screen capture at least 960 x 720 using Quicktime
  - Make sure the video capture is inside the web page border so the site
    completely fills the video and you don't have any borders.
  - To include audio, I used [Background Music app](https://github.com/kyleneideck/BackgroundMusic)
  - Save the screen capture into the video project `Work/Websites` folder
- In Final Cut Pro, create two empty projects
  - 960 x 720
  - 640 x 480
- Import the screenshot into FPX
  - Add 150% speed up
- Export both projects to Compressor and from compressor export two versions
  - uncompressed .mov
  - .mp4 (H.264 with AAC audio)
- Convert the .mov to .webm using my `mov2webm` alias
  - `ffmpeg -i "$mov" -c:v libvpx-vp9 -pix_fmt yuva420p "${$(basename $mov)}".webm`
- Create a poster frame using Preview
  - Open the .mov in Quicktime
  - Find a nice frame
  - Command + C
  - Open Preview
  - File > New from Clipboard
  - Save to the project `public/poster-frames`
- Upload videos to Google Cloud Storage

### Archiving videos

In Final Cut Pro

- Make sure the project is setup to consolidate files into the Library
  - Click on the SoulFresh Project library in the file navigator
  - Click the "Modify Settings" in the right hand panel
  - Make sure everything is set to "Library"
- Consolidate media by clicking the "Consolidate" buttons on the Library
inspector
- File > Delete Generated Library Files
- Archive the project folder

## Releasing

The site is released automatically by a GitHub action when you merge into
`main`. Opening a PR will create a release branch you can use for testing.
To deploy by hand, run `yarn cli release`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
