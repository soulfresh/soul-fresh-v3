import type { Project } from "@/app/data";

/** Where the project videos are hosted; the data lists their filenames. */
const VIDEO_ROOT = "https://storage.googleapis.com/soul-fresh-com-videos";

export interface VideoSource {
  src: string;
  /** MIME type, e.g. `video/webm`. */
  type: string;
}

/**
 * The large (unscaled) video files for a project, in the data's order of
 * preference, with types from their extensions.
 */
export function videoSources(project: Project): VideoSource[] {
  return (project.preview?.src?.large ?? []).map((file) => ({
    src: `${VIDEO_ROOT}/${encodeURIComponent(file)}`,
    type: `video/${file.split(".").pop()}`,
  }));
}

/** The project's poster frame, or undefined when the data has none. */
export function posterFrame(project: Project): string | undefined {
  const meta = project.preview?.meta;
  if (typeof meta !== "object" || meta === null || !("img" in meta)) return;
  return typeof meta.img === "string"
    ? `/poster-frames/${encodeURIComponent(meta.img)}`
    : undefined;
}
