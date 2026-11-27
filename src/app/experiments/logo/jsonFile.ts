import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * GET and PUT handlers for a JSON array stored next to this file, for the
 * experiment's dev-only route handlers. GET answers `[]` while the file
 * doesn't exist; PUT replaces the whole file with the request body.
 */
export function jsonFileHandlers(name: string) {
  // `yarn cli start` runs from the repo root.
  const file = path.join(
    process.cwd(),
    "src",
    "app",
    "experiments",
    "logo",
    name,
  );

  return {
    async GET() {
      try {
        return new Response(await readFile(file, "utf8"), {
          headers: { "content-type": "application/json" },
        });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return Response.json([]);
        }
        throw error;
      }
    },

    async PUT(request: Request) {
      const list: unknown = await request.json();
      if (!Array.isArray(list)) {
        return new Response("Expected a JSON array", { status: 400 });
      }
      // Write then rename so a failure never leaves a half-written file.
      const temp = `${file}.tmp`;
      await writeFile(temp, JSON.stringify(list, null, 2) + "\n");
      await rename(temp, file);
      return new Response(null, { status: 204 });
    },
  };
}
