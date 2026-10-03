import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type Registry, renderExport, renderNotices, type SourceLock } from "../src/sources/index.ts";

const registry = JSON.parse(await readFile("third_party/registry.json", "utf8")) as Registry;
const lock = JSON.parse(await readFile("third_party/lock.json", "utf8")) as SourceLock;
await mkdir("project-sources", { recursive: true });
for (const skill of registry.skills) {
  const entry = lock.skills.find((item) => item.mapping_id === skill.mapping_id);
  if (!entry) throw new Error(`Missing lock entry: ${skill.mapping_id}`);
  await writeFile(
    join("project-sources", `${skill.mapping_id}.md`),
    await renderExport(".", skill, entry),
    "utf8",
  );
}
await writeFile("THIRD_PARTY_NOTICES.md", await renderNotices(registry, lock), "utf8");
console.log(
  `Exported ${registry.skills.length} skills, ${lock.totals.files} files, ${lock.totals.license_files} license files.`,
);
