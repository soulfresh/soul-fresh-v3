import { Command } from "commander";

import fonts from "../fonts.config";
import { fetchFont } from "./fonts/fetch";
import { fontLabel } from "./fonts/files";
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
      for (const config of selectFonts(families)) {
        const fetched = await fetchFont(config, { refetch });
        console.log(
          `${fontLabel(config)}: font ${fetched.font}, licence ${fetched.license}`,
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
