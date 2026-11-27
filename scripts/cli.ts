import { Command, type HelpConfiguration } from "commander";

import { color } from "./color";
import { fonts } from "./commands/fonts";
import {
  build,
  lint,
  release,
  serve,
  start,
  typecheck,
} from "./commands/tools";

const program = new Command()
  .name("yarn cli")
  .description("soul-fresh project tasks")
  .addCommand(start)
  .addCommand(build)
  .addCommand(serve)
  .addCommand(lint)
  .addCommand(typecheck)
  .addCommand(release)
  .addCommand(fonts);

// Help colors. Commander strips them when the output isn't a terminal or
// NO_COLOR is set.
const helpStyle: HelpConfiguration = {
  styleTitle: (text) => color("bold", text),
  styleCommandText: (text) => color("bold", text),
  styleSubcommandText: (text) => color("cyan", text),
  styleOptionText: (text) => color("green", text),
  styleArgumentText: (text) => color("yellow", text),
};
// Commands added with addCommand don't inherit help settings, so set them on
// each one.
for (const command of [program, ...program.commands]) {
  command.configureHelp(helpStyle);
}

program.parseAsync().catch((error: unknown) => {
  console.error(
    color("red", error instanceof Error ? error.message : String(error)),
  );
  process.exit(1);
});
