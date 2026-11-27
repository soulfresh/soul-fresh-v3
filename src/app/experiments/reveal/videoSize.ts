import type { Project } from "@/app/data";

export interface Size {
  width: number;
  height: number;
}

/** Fallback when a project has no video or its filename has no dimensions. */
export const defaultVideoSize: Size = { width: 960, height: 720 };

/**
 * Video dimensions are encoded in the source filenames, e.g.
 * `"AptSnap 960 x 720.webm"`. Returns the unscaled (large) size of a
 * project's video, or the default when it can't be determined.
 */
export function videoSize(project: Project): Size {
  const large = project.preview?.src?.large?.[0];
  const match = large?.match(/(\d+)\s*x\s*(\d+)/);
  if (!match) return defaultVideoSize;
  return { width: Number(match[1]), height: Number(match[2]) };
}
