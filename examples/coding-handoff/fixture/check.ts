// The fixture's existing check; the handoff runs it unchanged.
import { parsePort } from "./src/port.ts";

const failures: string[] = [];
if (parsePort(8080) !== 8080) failures.push("8080 should parse");
for (const bad of ["8080", -1, 70000, 1.5, null]) {
  try {
    parsePort(bad);
    failures.push(`${JSON.stringify(bad)} should be rejected`);
  } catch {}
}
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("check passed");
