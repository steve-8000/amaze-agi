export interface Finding {
  file: string;
  line: number;
  rule: string;
  excerpt: string;
}

const RULES: Array<{ rule: string; re: RegExp }> = [
  { rule: "private_key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { rule: "github_token", re: /\b(gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { rule: "openai_key", re: /\bsk-(proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { rule: "aws_key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { rule: "slack_token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { rule: "google_api_key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { rule: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { rule: "email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { rule: "home_path", re: /(\/Users\/|\/home\/)(?!<)[A-Za-z0-9._-]+/ },
  { rule: "chatgpt_private_url", re: /chat(gpt\.com|\.openai\.com)\/(g\/g-p-|c\/|share\/)[A-Za-z0-9-]+/ },
  { rule: "drive_id_url", re: /(drive|docs)\.google\.com\/[^\s"')]*\/(folders|d)\/[A-Za-z0-9_-]{10,}/ },
];

const EMAIL_ALLOW = /@(example\.(com|org|net|invalid)|users\.noreply\.github\.com)$/;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Scans text for secrets and private identifiers. `denylist` carries user-local identifiers (account
 * names, project labels) supplied at scan time so they never need to be committed themselves.
 */
export function scanText(file: string, text: string, denylist: string[] = []): Finding[] {
  const findings: Finding[] = [];
  const deny = denylist
    .map((d) => d.trim())
    .filter((d) => d.length >= 3)
    .map((d) => ({ d, re: new RegExp(`(^|[^A-Za-z0-9])${escapeRegExp(d)}($|[^A-Za-z0-9])`, "i") }));
  text.split("\n").forEach((line, i) => {
    for (const { rule, re } of RULES) {
      const m = re.exec(line);
      if (!m) continue;
      if (rule === "email" && EMAIL_ALLOW.test(m[0])) continue;
      findings.push({ file, line: i + 1, rule, excerpt: m[0].slice(0, 12) + (m[0].length > 12 ? "…" : "") });
    }
    for (const { d, re } of deny) {
      if (re.test(line)) findings.push({ file, line: i + 1, rule: "denylist", excerpt: `${d.slice(0, 2)}…` });
    }
  });
  return findings;
}

/** Upstream third-party bytes are verified by pinned hashes instead; they are public data, not ours. */
export function isScannedPath(file: string): boolean {
  return !(
    file.startsWith("third_party/") ||
    file.startsWith("project-sources/") ||
    file.startsWith("node_modules/") ||
    file === "bun.lock"
  );
}
