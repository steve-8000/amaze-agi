import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Registry, SourceLock } from "../src/sources/index.ts";

interface TreeBlob {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
}
interface GitTree {
  tree: TreeBlob[];
  truncated: boolean;
}
interface GitBlob {
  content: string;
  encoding: string;
}
const registry = JSON.parse(await readFile("third_party/registry.json", "utf8")) as Registry;
const lock: SourceLock = { skills: [], totals: { skills: 0, files: 0, license_files: 0 } };
const treeCache = new Map<string, GitTree>();
const blobCache = new Map<string, Uint8Array>();

async function gh<T>(endpoint: string): Promise<T> {
  const process = Bun.spawn(["gh", "api", endpoint], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, status] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if (status !== 0) throw new Error(`gh api ${endpoint} failed (${status}): ${stderr.trim()}`);
  return JSON.parse(stdout) as T;
}
function digest(data: Uint8Array, kind: "sha1" | "sha256"): string {
  return createHash(kind).update(data).digest("hex");
}
function blobSha(data: Uint8Array): string {
  return digest(Buffer.concat([Buffer.from(`blob ${data.length}\0`), Buffer.from(data)]), "sha1");
}
async function tree(repo: string, commit: string): Promise<GitTree> {
  const key = `${repo}@${commit}`;
  let result = treeCache.get(key);
  if (!result) {
    result = await gh<GitTree>(`repos/${repo}/git/trees/${commit}?recursive=1`);
    if (result.truncated) throw new Error(`Truncated upstream tree: ${key}`);
    treeCache.set(key, result);
  }
  return result;
}
let currentRepo = "";
async function blob(sha: string): Promise<Uint8Array> {
  let result = blobCache.get(sha);
  if (!result) {
    const response = await gh<GitBlob>(`repos/${currentRepo}/git/blobs/${sha}`);
    if (response.encoding !== "base64") throw new Error(`Unexpected blob encoding: ${sha}`);
    result = Buffer.from(response.content.replace(/\s/g, ""), "base64");
    if (blobSha(result) !== sha) throw new Error(`Upstream blob SHA mismatch: ${sha}`);
    blobCache.set(sha, result);
  }
  return result;
}
async function save(relative: string, data: Uint8Array): Promise<void> {
  const target = join(relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, data);
}
function licenseName(path: string): boolean {
  return /^[^/]*(?:LICENSE|LICENCE|COPYING|NOTICE)[^/]*$/i.test(path);
}
const licensesByRepo = new Map<
  string,
  { repo_path: string; vendored_path: string; git_blob_sha1: string; sha256: string }[]
>();

for (const skill of registry.skills) {
  currentRepo = skill.upstream_repository;
  const treeResult = await tree(skill.upstream_repository, skill.upstream_commit);
  const folderPrefix = `${skill.upstream_skill_folder}/`;
  const files = treeResult.tree.filter((item) => item.type === "blob" && item.path.startsWith(folderPrefix));
  if (files.length !== skill.complete_folder_file_count)
    throw new Error(
      `${skill.mapping_id}: pinned tree has ${files.length} files; registry expects ${skill.complete_folder_file_count}`,
    );
  const checked = new Map<string, Uint8Array>();
  for (const item of files) {
    const path = item.path.slice(folderPrefix.length);
    if (!path) throw new Error(`Invalid folder blob path: ${item.path}`);
    const bytes = await blob(item.sha);
    await save(join("third_party/skills", skill.mapping_id, path), bytes);
    checked.set(path, bytes);
  }
  let repoLicenseFiles = licensesByRepo.get(skill.upstream_repository);
  if (!repoLicenseFiles) {
    repoLicenseFiles = [];
    for (const item of treeResult.tree.filter(
      (candidate) => candidate.type === "blob" && licenseName(candidate.path),
    )) {
      const bytes = await blob(item.sha);
      const vendoredPath = `third_party/licenses/${skill.upstream_repository.replace("/", "__")}/${item.path}`;
      await save(vendoredPath, bytes);
      repoLicenseFiles.push({
        repo_path: item.path,
        vendored_path: vendoredPath,
        git_blob_sha1: blobSha(bytes),
        sha256: digest(bytes, "sha256"),
      });
    }
    licensesByRepo.set(skill.upstream_repository, repoLicenseFiles);
    if (skill.upstream_repository === "vercel-labs/agent-skills" && repoLicenseFiles.length)
      throw new Error("Expected no root license/notice in vercel-labs/agent-skills pinned tree");
  }
  const lockFiles = files
    .map((item) => {
      const path = item.path.slice(folderPrefix.length);
      const bytes = checked.get(path);
      if (!bytes) throw new Error(`Fetched blob disappeared from inventory: ${skill.mapping_id}/${path}`);
      return { path, bytes: bytes.length, git_blob_sha1: blobSha(bytes), sha256: digest(bytes, "sha256") };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  if (skill.mapping_id === "16-frontend-design" && !checked.has("LICENSE.txt"))
    throw new Error("Expected frontend-design folder LICENSE.txt");
  lock.skills.push({
    mapping_id: skill.mapping_id,
    upstream_repository: skill.upstream_repository,
    upstream_commit: skill.upstream_commit,
    upstream_skill_folder: skill.upstream_skill_folder,
    files: lockFiles,
    license_files: repoLicenseFiles.map((file) => ({ ...file })),
    root_license_present: repoLicenseFiles.length > 0,
    license_evidence_observed: repoLicenseFiles.length
      ? `Root license/notice files observed: ${repoLicenseFiles.map((file) => file.repo_path).join(", ")}`
      : "No root LICENSE, LICENCE, COPYING, or NOTICE files in pinned recursive repository tree; retain registry frontmatter declaration.",
  });
}
lock.skills.sort((a, b) => a.mapping_id.localeCompare(b.mapping_id));
lock.totals = {
  skills: lock.skills.length,
  files: lock.skills.reduce((total, skill) => total + skill.files.length, 0),
  license_files: [
    ...new Set(lock.skills.flatMap((skill) => skill.license_files.map((file) => file.vendored_path))),
  ].length,
};
if (lock.totals.files !== 150) throw new Error(`Total vendored files ${lock.totals.files} != expected 150`);
await writeFile("third_party/lock.json", `${JSON.stringify(lock, null, 2)}\n`);
console.log(
  `Fetched ${lock.totals.skills} skills, ${lock.totals.files} files, ${lock.totals.license_files} root license/notice files.`,
);
