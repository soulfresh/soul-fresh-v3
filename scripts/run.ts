import { spawn } from "node:child_process";
import { constants } from "node:os";

/**
 * Run a project binary (`next`, `tsc`, `firebase`, …) with its output going
 * straight to this terminal, and resolve with its exit code. Binaries are
 * found through the PATH Yarn sets up for `yarn cli`.
 */
export function run(command: string, args: string[] = []): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });

    // Ctrl-C already reaches the child (it shares our terminal), so just
    // stay alive until it exits. Signals sent only to us are passed on.
    const ignore = () => {};
    const forward = (signal: NodeJS.Signals) => child.kill(signal);
    process.on("SIGINT", ignore);
    process.on("SIGTERM", forward);
    process.on("SIGHUP", forward);
    const cleanup = () => {
      process.off("SIGINT", ignore);
      process.off("SIGTERM", forward);
      process.off("SIGHUP", forward);
    };

    child.on("error", (error) => {
      cleanup();
      reject(new Error(`Could not run ${command}: ${error.message}`));
    });
    child.on("exit", (code, signal) => {
      cleanup();
      // Shell convention for a process killed by a signal: 128 + its number.
      resolve(code ?? 128 + (signal ? constants.signals[signal] : 0));
    });
  });
}

/** Run each step in order, stopping at the first that fails. */
export async function runAll(
  steps: [command: string, args: string[]][],
): Promise<number> {
  for (const [command, args] of steps) {
    const code = await run(command, args);
    if (code !== 0) return code;
  }
  return 0;
}
