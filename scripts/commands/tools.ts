import { Command } from "commander";

import { run, runAll } from "../run";

/**
 * A command that wraps a project tool. Extra arguments and options are
 * passed through, e.g. `yarn cli start --port 3001`.
 */
function toolCommand(
  name: string,
  description: string,
  passedTo: string,
  action: (args: string[]) => Promise<number>,
) {
  return new Command(name)
    .description(description)
    .argument("[args...]", `passed to ${passedTo}`)
    .allowUnknownOption()
    .action(async (args: string[]) => {
      process.exitCode = await action(args);
    });
}

export const start = toolCommand(
  "start",
  "Start the dev server on http://localhost:3000",
  "next dev",
  (args) => run("next", ["dev", "--turbopack", ...args]),
);

export const build = toolCommand(
  "build",
  "Build the static site into dist/ (stop the dev server first: the build clears dist/dev)",
  "next build",
  (args) => run("next", ["build", ...args]),
);

export const serve = toolCommand(
  "serve",
  "Serve the built site from dist/ (run `build` first)",
  "serve",
  (args) => run("serve", ["dist", ...args]),
);

export const typecheck = toolCommand(
  "typecheck",
  "Type-check the project with tsc",
  "tsc",
  (args) => run("tsc", ["--noEmit", ...args]),
);

export const lint = toolCommand(
  "lint",
  "Type-check, then run ESLint",
  "eslint",
  (args) =>
    runAll([
      ["tsc", ["--noEmit"]],
      // Next 16 removed `next lint`; `src` matches the directories it linted.
      ["eslint", ["src", ...args]],
    ]),
);

export const release = toolCommand(
  "release",
  "Deploy to Firebase Hosting (merging to main deploys automatically)",
  "firebase deploy",
  (args) => run("firebase", ["deploy", ...args]),
);
