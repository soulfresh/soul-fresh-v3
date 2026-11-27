import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Next refuses to serve a route handler under `output: "export"` without
// this, even in development. The .dev extension already keeps the route out
// of production builds, so it never actually gets exported.
export const dynamic = "force-static";

// `yarn cli start` runs from the repo root.
const FILE = path.join(
  process.cwd(),
  "src",
  "app",
  "experiments",
  "logo",
  "saved.json",
);

/** The saved combos; an empty list if the file doesn't exist yet. */
export async function GET() {
  try {
    return new Response(await readFile(FILE, "utf8"), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return Response.json([]);
    }
    throw error;
  }
}

/** Replace the file with the request body (the full list of combos). */
export async function PUT(request: Request) {
  const combos: unknown = await request.json();
  if (!Array.isArray(combos)) {
    return new Response("Expected a JSON array", { status: 400 });
  }
  // Write then rename so a failure never leaves a half-written file.
  const temp = `${FILE}.tmp`;
  await writeFile(temp, JSON.stringify(combos, null, 2) + "\n");
  await rename(temp, FILE);
  return new Response(null, { status: 204 });
}
