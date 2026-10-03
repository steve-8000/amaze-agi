import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { type CommandRunner, GBrainContext } from "../src/adapters/gbrain.ts";
import { defaultProfile, loadProfile, type Profile, parseProfile } from "../src/config.ts";
import type { EvidenceReceipt } from "../src/core/types.ts";
import { runDoctor } from "../src/doctor.ts";
import { scanText } from "../src/privacy.ts";
import { excerpt, planResearch, registrationStatus, researchClaims } from "../src/research/project.ts";
import { fsSnapshot, REPO_ROOT, tmpDir } from "./helpers.ts";

describe("research routing and excerpts", () => {
  test("task kinds route to exact project-source filenames with hashes and pinned commits", async () => {
    const plan = await planResearch(REPO_ROOT, "kubernetes");
    expect(plan.sources.map((s) => s.filename)).toEqual(["33-kubernetes-specialist.md"]);
    expect(plan.sources[0]?.upstreamCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(plan.sources[0]?.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(plan.nestedDocuments).toContain("references/gitops.md");
    expect(plan.reasoningPreference).toBe("extra-high");
    expect((await planResearch(REPO_ROOT, "simple-web-lookup")).reasoningPreference).toBe("medium");
    await expect(planResearch(REPO_ROOT, "kube")).rejects.toThrow(/no route/);
  });

  test("excerpt lines carry original and bundle numbers that match the committed bundle", async () => {
    const ex = await excerpt(REPO_ROOT, "19-performance.md", "references/RUM.md", [1, 5]);
    const bundle = fs
      .readFileSync(path.join(REPO_ROOT, "project-sources", "19-performance.md"), "utf8")
      .split("\n");
    expect(ex.lines).toHaveLength(5);
    for (const l of ex.lines) expect(bundle[l.bundleLine - 1]).toBe(l.text);
    expect(ex.manifest.sectionSha256).toMatch(/^[0-9a-f]{64}$/);
    await expect(excerpt(REPO_ROOT, "19-performance.md", "references/NOPE.md")).rejects.toThrow(
      /not embedded/,
    );
  });

  test("registration status: needs_project_registration -> partial -> ready only with exact hash, revision and proof", async () => {
    const profile = defaultProfile();
    expect((await registrationStatus(REPO_ROOT, profile, "kubernetes")).state).toBe(
      "needs_project_registration",
    );
    const plan = await planResearch(REPO_ROOT, "kubernetes");
    const src = plan.sources[0] as (typeof plan.sources)[number];
    const reg = { filename: src.filename, sha256: src.sha256, upstreamCommit: src.upstreamCommit };
    const unproven: Profile = {
      ...profile,
      chatgptProject: { label: "<PROJECT_LABEL>", registeredSources: [reg] },
    };
    expect(await registrationStatus(REPO_ROOT, unproven, "kubernetes")).toMatchObject({
      state: "partial",
      unproven: [src.filename],
    });
    const staleHash: Profile = {
      ...profile,
      chatgptProject: {
        label: "x",
        registeredSources: [
          {
            ...reg,
            sha256: "0".repeat(64),
            proof: { kind: "human_observation", observedAt: "2026-01-01", note: "seen" },
          },
        ],
      },
    };
    expect(await registrationStatus(REPO_ROOT, staleHash, "kubernetes")).toMatchObject({
      state: "partial",
      mismatched: [src.filename],
    });
    const ready: Profile = {
      ...profile,
      chatgptProject: {
        label: "x",
        registeredSources: [
          {
            ...reg,
            proof: { kind: "human_observation", observedAt: "2026-01-01", note: "listed in project sources" },
          },
        ],
      },
    };
    expect((await registrationStatus(REPO_ROOT, ready, "kubernetes")).state).toBe("ready");
    expect((await registrationStatus(REPO_ROOT, ready)).state).toBe("partial");
  });

  test("installed app, selected app and fetched data are independent claims", () => {
    const ev = (claimKind: EvidenceReceipt["claimKind"], status: EvidenceReceipt["status"]) =>
      ({ claimKind, status }) as EvidenceReceipt;
    expect(researchClaims([ev("app_installed", "supported")])).toEqual({
      appInstalled: true,
      appSelected: false,
      dataFetched: false,
    });
    expect(researchClaims([ev("app_selected", "supported"), ev("data_fetched", "inconclusive")])).toEqual({
      appInstalled: false,
      appSelected: true,
      dataFetched: false,
    });
  });
});

describe("doctor", () => {
  test("is read-only and reports needs_project_registration when sources are not registered", async () => {
    const cwd = tmpDir();
    const home = path.join(cwd, ".amaze-agi");
    const before = fsSnapshot(cwd);
    const report = await runDoctor({ cwd, home, repoRoot: REPO_ROOT, probeBinaries: false });
    expect(report.overall).toBe("needs_project_registration");
    expect(report.checks.find((c) => c.name === "sources")?.state).toBe("ok");
    expect(report.checks.find((c) => c.name === "plugin_package")?.state).toBe("ok");
    expect(fsSnapshot(cwd)).toEqual(before);
  });

  test("an invalid profile is broken, not ready", async () => {
    const cwd = tmpDir();
    const home = path.join(cwd, ".amaze-agi");
    fs.mkdirSync(home);
    fs.writeFileSync(path.join(home, "profile.local.json"), JSON.stringify({ grant: { autoApprove: true } }));
    expect((await runDoctor({ cwd, home, repoRoot: REPO_ROOT, probeBinaries: false })).overall).toBe(
      "broken",
    );
  });
});

describe("profile and privacy", () => {
  test("unknown keys and wrong types are rejected; defaults apply when absent", () => {
    expect(() => parseProfile({ autoApprove: true })).toThrow(/unknown profile key/);
    expect(() => parseProfile({ gbrain: { maxResults: "5" } })).toThrow(/positive number/);
    expect(() => parseProfile({ readback: { allowedCommandPrefixes: "curl" } })).toThrow();
    expect(loadProfile(path.join(tmpDir(), "missing")).exists).toBe(false);
  });

  test("the public example profile parses and contains placeholders only", () => {
    const text = fs.readFileSync(path.join(REPO_ROOT, "examples", "profile.example.json"), "utf8");
    const profile = parseProfile(JSON.parse(text));
    expect(profile.chatgptProject.label).toMatch(/^<.+>$/);
    expect(scanText("examples/profile.example.json", text)).toEqual([]);
  });

  test("scanner flags secrets, private URLs and denylisted identifiers but not placeholders", () => {
    // Samples are assembled at runtime so this file itself passes the repository privacy scan.
    const fakeToken = ["ghp", "_", "a".repeat(36)].join("");
    const hits = scanText(
      "x",
      [
        `token ${fakeToken}`,
        `see https://${["chatgpt", "com"].join(".")}/g/g-p-abc123def/project`,
        `https://${["drive", "google", "com"].join(".")}/drive/folders/1AbCdEfGhIjKlMnOp`,
        `mail ${["someone", "company.io"].join("@")}`,
        `path ${["", "Users", "alice", "work"].join("/")}`,
        "owner acme-internal-team",
        "placeholder <DRIVE_FOLDER_ID> and /home/<user> and dev@example.com",
        "ingestEvent is not a denylisted name",
      ].join("\n"),
      ["acme-internal-team", "steve"],
    );
    expect(hits.map((h) => h.rule)).toEqual([
      "github_token",
      "chatgpt_private_url",
      "drive_id_url",
      "email",
      "home_path",
      "denylist",
    ]);
  });
});

describe("gbrain adapter", () => {
  test("only read verbs run, output is bounded, and context never carries authority", () => {
    const calls: string[][] = [];
    const runner: CommandRunner = (argv) => {
      calls.push(argv);
      return { exitCode: 0, stdout: "decision: chose option B because of cost\n".repeat(100), stderr: "" };
    };
    const gb = new GBrainContext(
      { binary: "gbrain", sourceId: "<SOURCE>", maxResults: 3, snippetChars: 200, maxBytes: 64 },
      runner,
    );
    const ctx = gb.search("vendor choice");
    expect(calls[0]).toEqual([
      "gbrain",
      "search",
      "vendor choice",
      "--limit",
      "3",
      "--snippet-chars",
      "200",
      "--source-id",
      "<SOURCE>",
    ]);
    expect(Buffer.byteLength(ctx.text)).toBeLessThanOrEqual(64);
    expect(ctx).toMatchObject({
      truncated: true,
      authority: "none",
      level: "read_observed",
      claimKind: "data_fetched",
    });
    expect(() => gb.get("../secrets")).toThrow(/unsafe slug/);
  });

  test("a failed gbrain read is inconclusive, not empty-success", () => {
    const gb = new GBrainContext(
      { binary: "gbrain", maxResults: 3, snippetChars: 200, maxBytes: 64 },
      () => ({ exitCode: 1, stdout: "", stderr: "not configured" }),
    );
    expect(gb.search("x").status).toBe("inconclusive");
  });
});
