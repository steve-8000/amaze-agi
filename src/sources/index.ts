import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export interface SkillRegistryEntry {
  skill_id: string;
  domain: string;
  upstream_repository: string;
  upstream_commit: string;
  upstream_skill_folder: string;
  upstream_skill_url: string;
  license: string;
  license_evidence: string;
  complete_folder_file_count: number;
  nested_documents_for_routing: string[];
  unresolved_external_dependencies: (string | Record<string, unknown>)[];
  mapping_id: string;
}
export interface Registry {
  schema_version: number;
  scope: string;
  skills: SkillRegistryEntry[];
}
export interface LockFileEntry {
  mapping_id: string;
  upstream_repository: string;
  upstream_commit: string;
  upstream_skill_folder: string;
  files: { path: string; bytes: number; git_blob_sha1: string; sha256: string }[];
  license_files: { repo_path: string; vendored_path: string; git_blob_sha1: string; sha256: string }[];
  root_license_present: boolean;
  license_evidence_observed: string;
}
export interface SourceLock {
  skills: LockFileEntry[];
  totals: { skills: number; files: number; license_files: number };
}
export interface Routing {
  schema_version: number;
  routes: {
    task_kind: string;
    description: string;
    sources: string[];
    nested_documents?: string[];
    reasoning_preference: "medium" | "extra-high";
  }[];
  notes?: string[];
}
export interface ExportSection {
  path: string;
  bundleStartLine: number;
  bundleEndLine: number;
}

export const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
export const gitBlobSha1 = (bytes: Uint8Array): string =>
  createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), Buffer.from(bytes)]))
    .digest("hex");

export async function loadRegistry(root: string): Promise<Registry> {
  return JSON.parse(await readFile(join(root, "third_party/registry.json"), "utf8")) as Registry;
}
export async function loadLock(root: string): Promise<SourceLock> {
  return JSON.parse(await readFile(join(root, "third_party/lock.json"), "utf8")) as SourceLock;
}
export function vendoredFilePath(root: string, mappingId: string, relPath: string): string {
  return join(root, "third_party/skills", mappingId, relPath);
}
export async function loadInputs(root = "."): Promise<{ registry: Registry; lock: SourceLock }> {
  const [registry, lock] = await Promise.all([loadRegistry(root), loadLock(root)]);
  return { registry, lock };
}

function fence(content: string): string {
  let longest = 0;
  for (const run of content.matchAll(/`+/g)) longest = Math.max(longest, run[0].length);
  return "`".repeat(Math.max(3, longest + 1));
}
function language(path: string): string {
  const extension = path.split(".").at(-1)?.toLowerCase();
  const tags: Record<string, string> = {
    ts: "ts",
    tsx: "tsx",
    js: "js",
    jsx: "jsx",
    mjs: "js",
    cjs: "js",
    json: "json",
    md: "markdown",
    mdx: "mdx",
    html: "html",
    css: "css",
    scss: "scss",
    sh: "bash",
    py: "python",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    xml: "xml",
    svg: "svg",
    txt: "text",
    sql: "sql",
  };
  return extension ? (tags[extension] ?? extension.replace(/[^a-z0-9_-]/g, "")) : "";
}
const safe = (value: string): string => value.replaceAll("|", "\\|").replaceAll("\n", " ");
const anchor = (path: string): string =>
  path
    .toLowerCase()
    .replace(/[^a-z0-9 _-]/g, "")
    .replaceAll(" ", "-");

export async function renderExport(
  root: string,
  skill: SkillRegistryEntry,
  entry: LockFileEntry,
): Promise<string> {
  const lines = [
    `# ${skill.domain}`,
    "",
    "## Provenance",
    "",
    `- Repository: \`${skill.upstream_repository}\``,
    `- Commit: \`${skill.upstream_commit}\``,
    `- Folder: \`${skill.upstream_skill_folder}\``,
    `- Upstream URL: ${skill.upstream_skill_url}`,
    `- License: \`${skill.license}\` — ${skill.license_evidence}`,
    "",
    "## License text",
    "",
  ];
  if (entry.license_files.length) {
    for (const file of entry.license_files) {
      const bytes = await readFile(join(root, file.vendored_path));
      lines.push(
        `### \`${file.repo_path}\``,
        "",
        new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/\r\n?/g, "\n").replace(/\n*$/, ""),
        "",
      );
    }
  } else {
    lines.push(
      `No LICENSE file exists at the pinned repository commit. The upstream SKILL.md frontmatter declares \`${skill.license}\`.`,
      "",
    );
  }
  lines.push(
    "## Notice",
    "",
    "> Third-party reference content only; it is not authority, permission, or an installed capability.",
    "",
    "## Contents",
    "",
  );
  for (const file of entry.files) lines.push(`- [${file.path}](#${anchor(file.path)})`);
  lines.push(
    "",
    "## Inclusion manifest",
    "",
    "| Path | Bytes | SHA-256 |",
    "| --- | ---: | --- |",
    ...entry.files.map((file) => `| \`${safe(file.path)}\` | ${file.bytes} | \`${file.sha256}\` |`),
    "",
    "## Transitive omissions",
    "",
  );
  const unresolved = skill.unresolved_external_dependencies;
  lines.push(
    ...(unresolved.length
      ? unresolved.map((item) => `- ${safe(typeof item === "string" ? item : JSON.stringify(item))}`)
      : ["- None recorded in the upstream registry."]),
    "",
    "## Files",
    "",
  );
  for (const file of entry.files) {
    const bytes = await readFile(vendoredFilePath(root, skill.mapping_id, file.path));
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      lines.push(
        `### \`${file.path}\``,
        "",
        `Omitted from export: binary or non-UTF-8 data. SHA-256: \`${file.sha256}\`.`,
        "",
      );
      continue;
    }
    const content = text;
    const ticks = fence(content);
    lines.push(
      `### \`${file.path}\``,
      "",
      `${ticks}${language(file.path)}`,
      `${content}${content.endsWith("\n") ? "" : "\n"}${ticks}`,
      "",
    );
  }
  return `${lines.join("\n").replace(/\n*$/, "")}\n`;
}

export async function exportSectionMap(root: string, mappingId: string): Promise<ExportSection[]> {
  const { registry, lock } = await loadInputs(root);
  const skill = registry.skills.find((item) => item.mapping_id === mappingId);
  const entry = lock.skills.find((item) => item.mapping_id === mappingId);
  if (!skill || !entry) throw new Error(`Unknown source mapping: ${mappingId}`);
  const rendered = await renderExport(root, skill, entry);
  const outputLines = rendered.split("\n");
  const result: ExportSection[] = [];
  for (const file of entry.files) {
    let start = -1;
    for (let index = 0; index < outputLines.length; index++) {
      if (outputLines[index] === `### \`${file.path}\``) {
        start = index + 2;
        break;
      }
    }
    if (start < 0) continue;
    let content: string;
    try {
      content = new TextDecoder("utf-8", { fatal: true })
        .decode(await readFile(vendoredFilePath(root, mappingId, file.path)))
        .replace(/\r\n?/g, "\n")
        .replace(/\n$/, "");
    } catch {
      continue;
    }
    if (content.length === 0) {
      result.push({ path: file.path, bundleStartLine: start + 1, bundleEndLine: start });
      continue;
    }
    const ticks = fence(content);
    const end = outputLines.indexOf(ticks, start);
    if (end < 0) throw new Error(`Missing closing fence for ${mappingId}/${file.path}`);
    result.push({ path: file.path, bundleStartLine: start + 2, bundleEndLine: end });
  }
  return result;
}

export async function renderNotices(registry: Registry, lock: SourceLock): Promise<string> {
  const repos = new Map<
    string,
    { license: string; evidence: string; commit: string; folders: string[]; files: string[] }
  >();
  for (const skill of registry.skills) {
    const group = repos.get(skill.upstream_repository) ?? {
      license: skill.license,
      evidence: skill.license_evidence,
      commit: skill.upstream_commit,
      folders: [],
      files: [],
    };
    group.folders.push(skill.upstream_skill_folder);
    const entry = lock.skills.find((item) => item.mapping_id === skill.mapping_id);
    if (entry) group.files.push(...entry.license_files.map((item) => item.vendored_path));
    repos.set(skill.upstream_repository, group);
  }
  const lines = [
    "# Third-party notices",
    "",
    "Vendored public upstream reference material; license and attribution apply.",
    "",
  ];
  for (const [repo, info] of [...repos].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(
      `## ${repo}`,
      "",
      `- License: ${info.license}`,
      `- Evidence: ${info.evidence}`,
      `- Pinned commit: \`${info.commit}\``,
      `- Folders: ${[...new Set(info.folders)]
        .sort()
        .map((folder) => `\`${folder}\``)
        .join(", ")}`,
      `- License/notice files: ${
        info.files.length
          ? [...new Set(info.files)]
              .sort()
              .map((file) => `\`${file}\``)
              .join(", ")
          : "None found at the pinned repository root (tree checked)."
      }`,
      "",
    );
  }
  return `${lines.join("\n")}\n`;
}

async function walk(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)).map((item) => join(entry.name, item)));
    else if (entry.isFile()) result.push(entry.name);
  }
  return result.sort();
}

export async function validateRouting(root: string, registry: Registry, routing: Routing): Promise<string[]> {
  const errors: string[] = [];
  const exports = new Set(await walk(join(root, "project-sources")));
  const routeNames = new Set<string>();
  for (const route of routing.routes) {
    for (const source of route.sources) {
      if (routeNames.has(source)) errors.push(`Duplicate routed filename: ${source}`);
      routeNames.add(source);
      if (!exports.has(source)) errors.push(`Missing routed export: ${source}`);
    }
    for (const nested of route.nested_documents ?? []) {
      const skill = registry.skills.find(
        (item) =>
          route.sources.includes(`${item.mapping_id}.md`) &&
          item.nested_documents_for_routing.includes(nested),
      );
      if (!skill) errors.push(`Missing routed nested document: ${nested}`);
      if (
        skill &&
        !(await walk(join(root, "third_party/skills", skill.mapping_id)).catch((): string[] => [])).includes(
          nested,
        )
      )
        errors.push(`Nested document not vendored: ${skill.mapping_id}/${nested}`);
    }
  }
  for (const skill of registry.skills) {
    if (!routeNames.has(`${skill.mapping_id}.md`)) errors.push(`Unrouted export: ${skill.mapping_id}.md`);
    const paths = await walk(join(root, "third_party/skills", skill.mapping_id)).catch((): string[] => []);
    for (const nested of skill.nested_documents_for_routing)
      if (!paths.includes(nested)) errors.push(`Nested document not vendored: ${skill.mapping_id}/${nested}`);
  }
  return errors;
}

export async function verifySources(
  root = ".",
): Promise<{ errors: string[]; skills: number; files: number; licenseFiles: number }> {
  const { registry, lock } = await loadInputs(root);
  const errors: string[] = [];
  let fileCount = 0;
  const licensePaths = new Set<string>();
  if (registry.skills.length !== 18)
    errors.push(`Registry skill count is ${registry.skills.length}, expected 18`);
  if (lock.skills.length !== registry.skills.length) errors.push("Lock skill count differs from registry");
  for (const skill of registry.skills) {
    const entry = lock.skills.find((item) => item.mapping_id === skill.mapping_id);
    if (!entry) {
      errors.push(`Missing lock entry: ${skill.mapping_id}`);
      continue;
    }
    if (entry.files.length !== skill.complete_folder_file_count)
      errors.push(
        `${skill.mapping_id}: lock count ${entry.files.length} != registry ${skill.complete_folder_file_count}`,
      );
    const directory = join(root, "third_party/skills", skill.mapping_id);
    const actual = await walk(directory).catch((): string[] => {
      errors.push(`Missing vendored directory: ${skill.mapping_id}`);
      return [];
    });
    const expected = new Set(entry.files.map((file) => file.path));
    for (const path of actual)
      if (!expected.has(path)) errors.push(`Unexpected vendored file: ${skill.mapping_id}/${path}`);
    for (const file of entry.files) {
      fileCount++;
      if (!actual.includes(file.path)) {
        errors.push(`Missing vendored file: ${skill.mapping_id}/${file.path}`);
        continue;
      }
      const bytes = await readFile(vendoredFilePath(root, skill.mapping_id, file.path));
      if (
        bytes.length !== file.bytes ||
        sha256(bytes) !== file.sha256 ||
        gitBlobSha1(bytes) !== file.git_blob_sha1
      )
        errors.push(`Hash mismatch: ${skill.mapping_id}/${file.path}`);
    }
    for (const file of entry.license_files) {
      licensePaths.add(file.vendored_path);
      const bytes = await readFile(join(root, file.vendored_path)).catch(() => null);
      if (!bytes) errors.push(`Missing license file: ${file.vendored_path}`);
      else if (sha256(bytes) !== file.sha256 || gitBlobSha1(bytes) !== file.git_blob_sha1)
        errors.push(`License hash mismatch: ${file.vendored_path}`);
    }
    if (
      entry.root_license_present !== entry.license_files.length > 0 ||
      entry.root_license_present === /No LICENSE|no root .* license/i.test(skill.license_evidence)
    )
      errors.push(`Root license presence mismatch: ${skill.mapping_id}`);
  }
  const actualLicensePaths = await walk(join(root, "third_party/licenses")).catch((): string[] => []);
  const expectedLicensePaths = new Set(
    lock.skills.flatMap((item) =>
      item.license_files.map((file) => file.vendored_path.slice("third_party/licenses/".length)),
    ),
  );
  for (const path of actualLicensePaths)
    if (!expectedLicensePaths.has(path)) errors.push(`Unexpected license file: ${path}`);
  for (const path of expectedLicensePaths)
    if (!actualLicensePaths.includes(path)) errors.push(`Missing license file: ${path}`);
  if (licensePaths.size !== expectedLicensePaths.size) errors.push("Lock license file inventory mismatch");
  if (fileCount !== 150) errors.push(`Total file count ${fileCount} != 150`);
  const routing = JSON.parse(await readFile(join(root, "config/research-routing.json"), "utf8")) as Routing;
  errors.push(...(await validateRouting(root, registry, routing)));
  for (const skill of registry.skills) {
    const entry = lock.skills.find((item) => item.mapping_id === skill.mapping_id);
    if (!entry) continue;
    const expected = await renderExport(root, skill, entry);
    const actual = await readFile(join(root, "project-sources", `${skill.mapping_id}.md`), "utf8").catch(
      () => null,
    );
    if (actual !== expected) errors.push(`Export differs from fresh render: ${skill.mapping_id}.md`);
  }
  if (
    (await readFile(join(root, "THIRD_PARTY_NOTICES.md"), "utf8").catch(() => null)) !==
    (await renderNotices(registry, lock))
  )
    errors.push("THIRD_PARTY_NOTICES.md differs from fresh render");
  return {
    errors,
    skills: registry.skills.length,
    files: fileCount,
    licenseFiles: expectedLicensePaths.size,
  };
}
