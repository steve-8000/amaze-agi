import * as fs from "node:fs";
import * as path from "node:path";
import { REPO_ROOT } from "../src/paths.ts";
import { renderSourceIndex, SOURCE_INDEX_REL } from "../src/plugin.ts";
import type { Routing } from "../src/sources/index.ts";

const routing = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, "config/research-routing.json"), "utf8"),
) as Routing;
fs.writeFileSync(path.join(REPO_ROOT, SOURCE_INDEX_REL), renderSourceIndex(routing));
console.log(`Wrote ${SOURCE_INDEX_REL} (${routing.routes.length} routes).`);
