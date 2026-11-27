import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import {
  familySlug,
  fontDir,
  fontLabel,
  fontPath,
  writeFileAtomic,
} from "./files";
import type { FontConfig } from "./types";

// Where the google/fonts repo keeps each licence, in the order to try.
const LICENSES = [
  ["ofl", "OFL.txt"],
  ["apache", "LICENSE.txt"],
  ["ufl", "UFL.txt"],
] as const;

export interface FetchResult {
  font: "fetched" | "skipped";
  license: "fetched" | "skipped" | "missing";
}

/**
 * Download a font's TTF and licence into assets/fonts/, skipping files that
 * are already there unless `refetch` is set.
 */
export async function fetchFont(
  config: FontConfig,
  { refetch }: { refetch: boolean },
): Promise<FetchResult> {
  const file = fontPath(config);
  await mkdir(fontDir(config), { recursive: true });

  let font: FetchResult["font"] = "skipped";
  if (refetch || !existsSync(file)) {
    const url = await fontUrl(config);
    await writeFileAtomic(file, await download(url, config));
    font = "fetched";
  }

  return { font, license: await fetchLicense(config, refetch) };
}

/**
 * The TTF URL from the Google Fonts CSS API. Without a browser User-Agent
 * the API answers with a single, unsubset TrueType file.
 */
async function fontUrl(config: FontConfig) {
  const family = config.family.trim().replace(/\s+/g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${family}:ital,wght@${
    config.italic ? 1 : 0
  },${config.weight}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `${fontLabel(config)}: Google Fonts returned ${response.status}. ` +
        `Check the family name and that this weight/style exists.`,
    );
  }
  const match = (await response.text()).match(/url\((https:[^)]+\.ttf)\)/);
  if (!match) {
    throw new Error(`${fontLabel(config)}: no .ttf URL in the Google Fonts CSS`);
  }
  return match[1];
}

async function download(url: string, config: FontConfig) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `${fontLabel(config)}: downloading ${url} returned ${response.status}`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

/** Download the family's licence from the google/fonts repo. */
async function fetchLicense(
  config: FontConfig,
  refetch: boolean,
): Promise<FetchResult["license"]> {
  const dir = fontDir(config);
  const existing = LICENSES.some(([, name]) =>
    existsSync(path.join(dir, name)),
  );
  if (existing && !refetch) return "skipped";

  const slug = familySlug(config.family);
  for (const [folder, name] of LICENSES) {
    const response = await fetch(
      `https://raw.githubusercontent.com/google/fonts/main/${folder}/${slug}/${name}`,
    );
    if (response.ok) {
      await writeFileAtomic(
        path.join(dir, name),
        Buffer.from(await response.arrayBuffer()),
      );
      return "fetched";
    }
  }
  return "missing";
}
