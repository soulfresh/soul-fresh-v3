import { Command } from "commander";

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

program.parseAsync().catch((error: unknown) => {
  console.error(
    color("red", error instanceof Error ? error.message : String(error)),
  );
  process.exit(1);
});
