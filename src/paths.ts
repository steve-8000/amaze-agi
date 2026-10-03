import * as path from "node:path";

/** Root of this repository checkout: pinned sources, exports, routing and the plugin package live here. */
export const REPO_ROOT = path.resolve(import.meta.dir, "..");
