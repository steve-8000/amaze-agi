# Setup: make the skill available to dot

The skill is `plugins/amaze-agi/skills/amaze-goal/` (entrypoint `SKILL.md`, frontmatter `name: amaze-goal`). It follows the Agent Skills layout and is packaged in a portable Agent Plugins folder. Installation is done in ChatGPT, by you or a workspace admin; this repository cannot install anything and `doctor` cannot see whether it is installed.

Availability, menu names and permissions depend on your plan and workspace settings. Check the current OpenAI documentation before following these steps:

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
