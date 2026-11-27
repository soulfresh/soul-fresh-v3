import { jsonFileHandlers } from "../jsonFile";

// See saved/route.dev.ts.
export const dynamic = "force-static";

const handlers = jsonFileHandlers("favorites.json");
export const GET = handlers.GET;
export const PUT = handlers.PUT;
