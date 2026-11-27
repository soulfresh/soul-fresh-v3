import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import fonts from "../fonts.config";
import { buildFont, formatFontData } from "./fonts/build";
import { fetchFont } from "./fonts/fetch";
import { fontLabel, glyphDataPath, writeFileAtomic } from "./fonts/files";
import type { FontConfig } from "./fonts/types";

const program = new Command()
  .name("cli")
  .description("soul-fresh project tasks");

program
  .command("fonts")
  .description("Fetch fonts from Google Fonts and build glyph data")
  .argument(
    "[families...]",
    "only these families (default: every font in fonts.config.ts)",
  )
  .option("--force", "rebuild glyph data even if it exists")
  .option("--refetch", "re-download fonts even if they exist (implies --force)")
  .action(
    async (
      families: string[],
      options: { force?: boolean; refetch?: boolean },
    ) => {
      const refetch = options.refetch ?? false;
      const force = (options.force ?? false) || refetch;
      for (const config of selectFonts(families)) {
        const fetched = await fetchFont(config, { refetch });
        const output = glyphDataPath(config);
        let built = "skipped";
        if (force || !existsSync(output)) {
          const data = await buildFont(config);
          await mkdir(path.dirname(output), { recursive: true });
          await writeFileAtomic(output, formatFontData(data));
          built =
            `built (${Object.keys(data.glyphs).length} glyphs, ` +
            `${Object.keys(data.kerning).length} kerning pairs, ` +
            `${data.missing.length} missing)`;
        }
        console.log(
          `${fontLabel(config)}: font ${fetched.font}, ` +
            `licence ${fetched.license}, glyphs ${built}`,
        );
        if (fetched.license === "missing") {
          console.warn(
            `  warning: no licence found in google/fonts for ${config.family}`,
          );
        }
      }
    },
  );

/** Config entries for the named families, or all of them. */
function selectFonts(families: string[]): FontConfig[] {
  if (families.length === 0) return fonts;
  return families.flatMap((name) => {
    const matches = fonts.filter(
      (font) => font.family.toLowerCase() === name.toLowerCase(),
    );
    if (matches.length === 0) {
      const configured = [...new Set(fonts.map((font) => font.family))];
      throw new Error(
        `"${name}" is not in fonts.config.ts. Configured: ${configured.join(", ")}`,
      );
    }
    return matches;
  });
}

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
