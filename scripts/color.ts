import { styleText } from "node:util";

type Format = Parameters<typeof styleText>[0];

// Color when writing to a terminal, unless NO_COLOR is set. FORCE_COLOR
// overrides both (FORCE_COLOR=0 turns color off).
const enabled = process.env.FORCE_COLOR
  ? process.env.FORCE_COLOR !== "0"
  : !process.env.NO_COLOR && process.stdout.isTTY === true;

/** `text` styled with `format` when color is enabled, otherwise as is. */
export function color(format: Format, text: string) {
  return enabled ? styleText(format, text) : text;
}
