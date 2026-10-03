# Setup: make the skill available to dot

The skill is `plugins/amaze-agi/skills/amaze-goal/` (entrypoint `SKILL.md`, frontmatter `name: amaze-goal`). It follows the Agent Skills layout and is packaged in a portable Agent Plugins folder. This repository and its helper do not install anything, and `doctor` cannot see whether the skill is installed.

Keep four questions apart:

- **Current capability**: if your dot host already supports writing a personal skill, it can add these files for you (host-assisted); otherwise use one of the options below.
- **Eligibility**: whether skills or plugins are offered for your plan or workspace, per OpenAI's current documentation.
- **Permissions**: workspace roles and policies decide who may upload, approve or import (some options need an owner or admin).
- **User-only steps**: sign-in and any authorization the platform reserves for you; nobody else can complete those.

Menu names and availability change; check the current documentation:

- Skills: <https://help.openai.com/en/articles/20001066>
- Plugins: <https://help.openai.com/en/articles/20001256>
- Plugin marketplaces and import: <https://help.openai.com/en/articles/20001504>
- Plugin format: <https://developers.openai.com/plugins/build/plugins>

## Option A: personal or workspace skill upload

1. `bun run plugin:verify` (checks frontmatter, links and the generated source index).
2. Zip the folder `plugins/amaze-agi/skills/amaze-goal/` (the folder itself, with `SKILL.md` at its top).
3. In ChatGPT: **Skills > Create > Upload from your computer**, choose the ZIP.
4. Uploaded skills are scanned and may be marked *Needs Review* or *Blocked*; resolve that before use.

## Option B: workspace plugin upload (owner/admin)

1. Zip `plugins/amaze-agi/` (contains `plugin.json` and `skills/`).
2. **Admin > Plugins > Add > Upload plugin**. Requires a role with plugin upload permission.

## Option C: GitHub marketplace import

The repository root has `.agents/plugins/marketplace.json` pointing at `./plugins/amaze-agi`. A workspace admin can import the GitHub repository as a marketplace and sync it. Repository policy values (`installation`, `authentication`) are not applied on import; the workspace sets its own.

For a local client that reads a personal marketplace, add an entry to your own `~/.agents/plugins/marketplace.json` whose `source.path` points at your clone's `plugins/amaze-agi`, then restart the app. That file is yours; do not commit it.

## Activation intent

Ask dot to use the `amaze-goal` skill for multi-step work, coding handoffs, source-based decisions, and anything to be delivered or remembered. Simple questions do not need it.

## Merging into an existing personal operating skill

If you already maintain your own dot operating skill, merge by copying the public sections you want from `SKILL.md` and `references/` into it and keep your private material (account details, connector specifics, personal rules) in your copy only. Do not publish the merged result.

## Uninstall and recovery

- Remove the skill or plugin from the same ChatGPT screen where it was added (or remove the marketplace entry and restart).
- A wrong or stale upload: re-run `bun run plugin:verify`, re-zip, upload again, and remove the old version.
