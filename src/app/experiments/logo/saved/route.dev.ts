import { jsonFileHandlers } from "../jsonFile";

// Next refuses to serve a route handler under `output: "export"` without
// this, even in development. The .dev extension already keeps the route out
// of production builds, so it never actually gets exported.
export const dynamic = "force-static";

const handlers = jsonFileHandlers("saved.json");
export const GET = handlers.GET;
export const PUT = handlers.PUT;
