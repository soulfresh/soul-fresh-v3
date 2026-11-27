import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import fontConfigs from "../../fonts.config";
import { color } from "../color";
import { buildFont, formatFontData } from "../fonts/build";
import { fetchFont } from "../fonts/fetch";
import { fontLabel, glyphDataPath, writeFileAtomic } from "../fonts/files";
import type { FontConfig } from "../fonts/types";

export const fonts = new Command("fonts")
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
        console.log(color("bold", fontLabel(config)));

        const fetched = await fetchFont(config, { refetch });
        step("font", fetched.font === "fetched" ? done("fetched") : skipped());
        step(
          "licence",
          fetched.license === "fetched"
            ? done("fetched")
            : fetched.license === "skipped"
              ? skipped()
              : color("yellow", "missing (not found in google/fonts)"),
        );

        const output = glyphDataPath(config);
        if (force || !existsSync(output)) {
          const data = await buildFont(config);
          await mkdir(path.dirname(output), { recursive: true });
          await writeFileAtomic(output, formatFontData(data));
          step(
            "glyphs",
            done("built") +
              color(
                "dim",
                ` (${Object.keys(data.glyphs).length} glyphs, ` +
                  `${Object.keys(data.kerning).length} kerning pairs, ` +
                  `${data.missing.length} missing)`,
              ),
          );
        } else {
          step("glyphs", skipped());
        }
      }
    },
  );

/** One indented, aligned line per step, e.g. "  font     fetched". */
function step(name: string, outcome: string) {
  console.log(`  ${name.padEnd(9)}${outcome}`);
}

function done(text: string) {
  return color("green", text);
}

function skipped() {
  return color("dim", "skipped (exists)");
}

/** Config entries for the named families, or all of them. */
function selectFonts(families: string[]): FontConfig[] {
  if (families.length === 0) return fontConfigs;
  return families.flatMap((name) => {
    const matches = fontConfigs.filter(
      (font) => font.family.toLowerCase() === name.toLowerCase(),
    );
    if (matches.length === 0) {
      const configured = [...new Set(fontConfigs.map((font) => font.family))];
      throw new Error(
        `"${name}" is not in fonts.config.ts. Configured: ${configured.join(", ")}`,
      );
    }
    return matches;
  });
}
