// Synthetic fixture entry point; note that unwired.ts is not imported.
import { RETRY_LIMIT } from "./config.ts";
import { total } from "./guarded.ts";

export function run(): number {
  return total({ items: [RETRY_LIMIT, 4] });
}
