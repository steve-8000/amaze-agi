import * as fs from "node:fs";
import * as path from "node:path";
import { isRecord } from "./core/guards.ts";
import type { Routing } from "./sources/index.ts";

export const PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
export const MARKETPLACE_FILE = ".agents/plugins/marketplace.json";
export const PLUGIN_REL = "plugins/amaze-agi";
export const SKILL_REL = `${PLUGIN_REL}/skills/amaze-goal`;
export const SOURCE_INDEX_REL = `${SKILL_REL}/references/source-index.md`;
export const MODEL_PREFS_REL = `${SKILL_REL}/references/model-preferences.json`;

const PLUGIN_KEYS: Record<string, true> = {
  $schema: true,
  name: true,
  version: true,
  description: true,
  author: true,
  homepage: true,
  repository: true,
  license: true,
  keywords: true,
  extensions: true,
};
const THINKING: Record<string, true> = { low: true, medium: true, high: true, xhigh: true, max: true };
// Leftovers of the superseded host-extension design must not reach the public package.
const FORBIDDEN = [
  /omp\.extensions/,
  /"omp"\s*:/,
  /extension\/index\.ts/,
  /src\/omp\//,
  /--mode rpc/,
  /--no-extensions/,
];
const NAME = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface PluginReport {
  errors: string[];
  skills: string[];
  files: number;
}

/** Deterministic Markdown index of task kinds to exact Project source filenames. */
export function renderSourceIndex(routing: Routing): string {
  const lines = [
    "# Source index",
    "",
    "Generated from `config/research-routing.json`; do not edit by hand. Read only the files routed to the task kind.",
    "Filenames are exact ChatGPT Project source names produced by `bun run sources:export`.",
    "Nested paths are cited inside an export as `<export file> > <nested path>`.",
    "",
    "| Task kind | Sources | Reasoning | Nested documents | When |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const r of routing.routes) {
    const sources =
      r.sources.length === 0 ? "none (web or memory only)" : r.sources.map((s) => `\`${s}\``).join(", ");
    lines.push(
      `| \`${r.task_kind}\` | ${sources} | ${r.reasoning_preference} | ${r.nested_documents?.length ?? 0} | ${r.description} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function readJson(file: string, errors: string[]): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    errors.push(`${file}: ${String(err)}`);
    return undefined;
  }
}

function frontmatter(text: string): Record<string, string> | undefined {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m?.[1]) return undefined;
  const out: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([a-z_-]+):\s*(.*)$/.exec(line);
    if (kv?.[1]) out[kv[1]] = (kv[2] ?? "").replace(/^["']|["']$/g, "");
  }
  return out;
}

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

function checkMarketplace(root: string, errors: string[]): void {
  const m = readJson(path.join(root, MARKETPLACE_FILE), errors);
  if (!isRecord(m)) return void errors.push(`${MARKETPLACE_FILE}: not an object`);
  if (typeof m.name !== "string" || !NAME.test(m.name)) errors.push(`${MARKETPLACE_FILE}: invalid name`);
  const entry = Array.isArray(m.plugins)
    ? m.plugins.find((p) => isRecord(p) && p.name === "amaze-agi")
    : undefined;
  if (!isRecord(entry)) return void errors.push(`${MARKETPLACE_FILE}: no amaze-agi plugin entry`);
  const src = entry.source;
  if (!isRecord(src) || src.source !== "local" || src.path !== `./${PLUGIN_REL}`)
    errors.push(`${MARKETPLACE_FILE}: source must be local ./${PLUGIN_REL}`);
  const policy = entry.policy;
  if (
    !isRecord(policy) ||
    typeof policy.installation !== "string" ||
    typeof policy.authentication !== "string"
  )
    errors.push(`${MARKETPLACE_FILE}: policy.installation and policy.authentication are required`);
  if (typeof entry.category !== "string") errors.push(`${MARKETPLACE_FILE}: category is required`);
}

function checkManifest(root: string, errors: string[]): void {
  const file = path.join(root, PLUGIN_REL, "plugin.json");
  const p = readJson(file, errors);
  if (!isRecord(p)) return void errors.push(`${PLUGIN_REL}/plugin.json: not an object`);
  if (p.$schema !== PLUGIN_SCHEMA) errors.push(`${PLUGIN_REL}/plugin.json: $schema must be ${PLUGIN_SCHEMA}`);
  if (p.name !== path.basename(PLUGIN_REL))
    errors.push(`${PLUGIN_REL}/plugin.json: name must be ${path.basename(PLUGIN_REL)}`);
  for (const key of Object.keys(p))
    if (!PLUGIN_KEYS[key]) errors.push(`${PLUGIN_REL}/plugin.json: unknown key ${key}`);
  if (typeof p.version !== "string" || !/^\d+\.\d+\.\d+$/.test(p.version))
    errors.push(`${PLUGIN_REL}/plugin.json: version must be semver`);
}

function checkSkill(dir: string, rel: string, errors: string[]): void {
  const file = path.join(dir, "SKILL.md");
  if (!fs.existsSync(file)) return void errors.push(`${rel}: missing SKILL.md`);
  const text = fs.readFileSync(file, "utf8");
  const fm = frontmatter(text);
  const name = path.basename(dir);
  if (!fm) return void errors.push(`${rel}/SKILL.md: missing frontmatter`);
  if (fm.name !== name || !SKILL_NAME.test(name) || name.length > 64)
    errors.push(`${rel}/SKILL.md: name must equal folder name ${name}`);
  if (!fm.description || fm.description.length > 1024)
    errors.push(`${rel}/SKILL.md: description must be 1-1024 characters`);
  for (const m of text.matchAll(/\]\((references\/[^)#]+)\)/g))
    if (m[1] && !fs.existsSync(path.join(dir, m[1]))) errors.push(`${rel}/SKILL.md: broken link ${m[1]}`);
}

function checkModelPrefs(root: string, errors: string[]): void {
  const prefs = readJson(path.join(root, MODEL_PREFS_REL), errors);
  const roles = isRecord(prefs) ? prefs.roles : undefined;
  if (!isRecord(roles)) return void errors.push(`${MODEL_PREFS_REL}: roles object required`);
  for (const [role, v] of Object.entries(roles)) {
    if (
      !isRecord(v) ||
      typeof v.model !== "string" ||
      typeof v.thinking !== "string" ||
      !THINKING[v.thinking]
    )
      errors.push(`${MODEL_PREFS_REL}: role ${role} needs model and thinking (low|medium|high|xhigh|max)`);
  }
}

/** Validates the portable Agent Plugins layout; it cannot tell whether ChatGPT has installed or enabled it. */
export function verifyPlugin(root: string): PluginReport {
  const errors: string[] = [];
  checkMarketplace(root, errors);
  checkManifest(root, errors);
  const skillsDir = path.join(root, PLUGIN_REL, "skills");
  const skills = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir).filter((n) => fs.statSync(path.join(skillsDir, n)).isDirectory())
    : [];
  const routing = readJson(path.join(root, "config/research-routing.json"), errors) as Routing | undefined;
  const indexFile = path.join(root, SOURCE_INDEX_REL);
  if (routing && Array.isArray(routing.routes)) {
    const expected = renderSourceIndex(routing);
    if (!fs.existsSync(indexFile) || fs.readFileSync(indexFile, "utf8") !== expected)
      errors.push(`${SOURCE_INDEX_REL}: stale; run \`bun scripts/build-plugin.ts\``);
  }
  if (skills.length === 0) errors.push(`${PLUGIN_REL}/skills: no skills`);
  for (const s of skills) checkSkill(path.join(skillsDir, s), `${PLUGIN_REL}/skills/${s}`, errors);
  checkModelPrefs(root, errors);

  const files = fs.existsSync(path.join(root, PLUGIN_REL)) ? walk(path.join(root, PLUGIN_REL)) : [];
  for (const f of [...files, path.join(root, "package.json"), path.join(root, "tsconfig.json")]) {
    const text = fs.readFileSync(f, "utf8");
    for (const re of FORBIDDEN)
      if (re.test(text)) errors.push(`${path.relative(root, f)}: host-extension leftover ${re.source}`);
  }
  return { errors, skills, files: files.length };
}
