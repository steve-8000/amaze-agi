import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  exportSectionMap,
  gitBlobSha1,
  loadInputs,
  type Registry,
  type Routing,
  renderExport,
  type SourceLock,
  sha256,
  validateRouting,
  verifySources,
} from "../src/sources/index.ts";

const root = ".";
let registry: Registry;
let lock: SourceLock;
let temp = "";

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected test fixture value");
  return value;
}

beforeAll(async () => {
  ({ registry, lock } = await loadInputs(root));
  temp = await mkdtemp(join(tmpdir(), "amaze-sources-"));
  for (const path of [
    "third_party/registry.json",
    "third_party/lock.json",
    "third_party/skills",
    "third_party/licenses",
    "project-sources",
    "config/research-routing.json",
    "THIRD_PARTY_NOTICES.md",
  ]) {
    await cp(path, join(temp, path), { recursive: true });
  }
});
afterAll(async () => {
  if (temp) await rm(temp, { recursive: true, force: true });
});

describe("vendored source integrity", () => {
  test("contains every registry inventory file with exact blob and SHA-256 digests", async () => {
    expect(registry.skills).toHaveLength(18);
    expect(lock.skills.reduce((total, item) => total + item.files.length, 0)).toBe(150);
    for (const skill of registry.skills) {
      const entry = required(lock.skills.find((item) => item.mapping_id === skill.mapping_id));
      expect(entry.files).toHaveLength(skill.complete_folder_file_count);
      for (const file of entry.files) {
        const bytes = await readFile(join("third_party/skills", skill.mapping_id, file.path));
        expect(bytes.length).toBe(file.bytes);
        expect(gitBlobSha1(bytes)).toBe(file.git_blob_sha1);
        expect(sha256(bytes)).toBe(file.sha256);
      }
    }
  });

  test("preserves root and folder license evidence semantics", async () => {
    const vercel = required(registry.skills.find((item) => item.mapping_id === "10-react-best-practices"));
    const vercelLock = required(lock.skills.find((item) => item.mapping_id === vercel.mapping_id));
    expect(vercelLock.root_license_present).toBe(false);
    expect(vercelLock.license_files).toHaveLength(0);
    expect(vercel.license_evidence).toContain("No LICENSE");
    const frontend = required(lock.skills.find((item) => item.mapping_id === "16-frontend-design"));
    expect(frontend.files.some((file) => file.path === "LICENSE.txt")).toBe(true);
    const otherRootLicensed = lock.skills.filter(
      (item) => item.upstream_repository !== "vercel-labs/agent-skills",
    );
    expect(otherRootLicensed.every((item) => item.root_license_present)).toBe(true);
    expect(lock.totals.license_files).toBe(7);
  });

  test("renders deterministically and maps embedded file lines", async () => {
    for (const skill of registry.skills) {
      const entry = required(lock.skills.find((item) => item.mapping_id === skill.mapping_id));
      const first = await renderExport(root, skill, entry);
      expect(await renderExport(root, skill, entry)).toBe(first);
      expect(await readFile(join("project-sources", `${skill.mapping_id}.md`), "utf8")).toBe(first);
      const sections = await exportSectionMap(root, skill.mapping_id);
      const lines = first.split("\n");
      for (const section of sections) {
        const file = required(entry.files.find((item) => item.path === section.path));
        const bytes = await readFile(join("third_party/skills", skill.mapping_id, file.path));
        let original: string;
        try {
          original = new TextDecoder("utf-8", { fatal: true })
            .decode(bytes)
            .replace(/\r\n?/g, "\n")
            .replace(/\n$/, "");
        } catch {
          continue;
        }
        const embedded = lines.slice(section.bundleStartLine - 1, section.bundleEndLine).join("\n");
        expect(embedded).toBe(original);
      }
    }
  });

  test("detects byte tampering in an isolated copied source tree", async () => {
    const skill = required(registry.skills.find((item) => item.mapping_id === "16-frontend-design"));
    const entry = required(lock.skills.find((item) => item.mapping_id === skill.mapping_id));
    const file = required(entry.files[0]);
    const path = join(temp, "third_party/skills", skill.mapping_id, file.path);
    const bytes = await readFile(path);
    const firstByte = bytes[0];
    if (firstByte === undefined) throw new Error("Expected nonempty fixture file");
    bytes[0] = firstByte ^ 1;
    await writeFile(path, bytes);
    const result = await verifySources(temp);
    expect(
      result.errors.some((error) => error.includes(`Hash mismatch: ${skill.mapping_id}/${file.path}`)),
    ).toBe(true);
  });

  test("accepts the configured exact-filename routing registry", async () => {
    const routing = JSON.parse(await readFile("config/research-routing.json", "utf8")) as Routing;
    expect(await validateRouting(root, registry, routing)).toEqual([]);
  });
});
