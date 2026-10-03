import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { isScannedPath, scanText } from "../src/privacy.ts";

// Usage: AMAZE_PRIVACY_DENYLIST="name1,name2" bun scripts/privacy-scan.ts
// Scans tracked and untracked-but-not-ignored files; optional gitleaks run when installed.
const root = path.resolve(import.meta.dir, "..");
const list = Bun.spawnSync(["git", "-C", root, "ls-files", "-co", "--exclude-standard", "-z"]);
if (list.exitCode !== 0) {
  console.error("git ls-files failed");
  process.exit(2);
}
const denylist = (process.env.AMAZE_PRIVACY_DENYLIST ?? "").split(",").filter(Boolean);
const files = list.stdout.toString().split("\0").filter(Boolean);
const findings = [];
let scanned = 0;
for (const file of files) {
  if (!isScannedPath(file)) continue;
  const abs = path.join(root, file);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
  const bytes = fs.readFileSync(abs);
  if (bytes.includes(0)) continue;
  scanned++;
  findings.push(...scanText(file, bytes.toString("utf8"), denylist));
}
// Upstream bundles may carry public author emails; private identifiers are still checked there.
let upstreamScanned = 0;
for (const file of files) {
  if (isScannedPath(file) || file.startsWith("node_modules/") || denylist.length === 0) continue;
  const abs = path.join(root, file);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
  upstreamScanned++;
  findings.push(
    ...scanText(file, fs.readFileSync(abs, "utf8"), denylist).filter((f) => f.rule === "denylist"),
  );
}

let gitleaks = "not installed (skipped)";
const which = Bun.spawnSync(["sh", "-c", "command -v gitleaks"]);
if (which.exitCode === 0) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "amaze-leaks-"));
  const report = path.join(tmp, "report.json");
  const g = Bun.spawnSync(
    ["gitleaks", "dir", root, "--no-banner", "--report-format", "json", "--report-path", report],
    {
      stdout: "ignore",
      stderr: "ignore",
    },
  );
  const leaks: Array<{ File: string; RuleID: string; StartLine: number }> = fs.existsSync(report)
    ? JSON.parse(fs.readFileSync(report, "utf8"))
    : [];
  fs.rmSync(tmp, { recursive: true, force: true });
  const relevant = leaks.filter((l) => {
    const rel = path.relative(root, l.File);
    return isScannedPath(rel) && !rel.startsWith("node_modules/") && !rel.startsWith(".git/");
  });
  for (const l of relevant)
    findings.push({
      file: path.relative(root, l.File),
      line: l.StartLine,
      rule: `gitleaks:${l.RuleID}`,
      excerpt: "",
    });
  gitleaks = `exit ${g.exitCode}, ${leaks.length} raw, ${relevant.length} in first-party files`;
}

console.log(
  `privacy scan: ${scanned} first-party files, ${upstreamScanned} upstream files (denylist only), denylist=${denylist.length} terms, gitleaks: ${gitleaks}`,
);
if (findings.length > 0) {
  for (const f of findings) console.log(`FINDING ${f.rule} ${f.file}:${f.line} ${f.excerpt}`);
  process.exit(1);
}
console.log("no findings");
