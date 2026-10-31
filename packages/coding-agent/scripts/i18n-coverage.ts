/**
 * Catalog coverage guard.
 *
 * Two independent checks:
 * 1. Runtime metadata: every builtin slash command, displayed setting, settings
 *    chrome entry, and CLI command/flag/argument must have a Russian key.
 * 2. Source scan: literal `t("key", …)` calls in the TUI, coding agent, and CLI
 *    framework must have a key, and shipped keys must be reachable by a literal
 *    key or by a dynamic key prefix (`t(\`omp.setting.${id}.label\`)`).
 *
 * Run with `bun packages/coding-agent/scripts/i18n-coverage.ts`.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { TAB_GROUPS, TAB_METADATA } from "@oh-my-pi/pi-tui/overlays/settings-defs";
import { commands as cliCommands } from "../src/cli-commands";
import { launchHelp } from "../src/commands/launch-help";
import { orderedSettings } from "../src/config/all-settings";
import { ru } from "../src/i18n/catalogs/ru";
import { ruCli } from "../src/i18n/catalogs/ru-cli";
import { ruSettings } from "../src/i18n/catalogs/ru-settings";
import { ruTui } from "../src/i18n/catalogs/ru-tui";
import { BUILTIN_SLASH_COMMANDS_INTERNAL } from "../src/slash-commands/builtin-registry";

const ROOT = path.resolve(import.meta.dir, "../../..");
const SOURCE_DIRS = ["packages/tui/src", "packages/coding-agent/src", "packages/utils/src"];

const LITERAL_DOUBLE = /(?:^|[^\w.$])t\(\s*"([^"\n]+)"/g;
const LITERAL_SINGLE = /(?:^|[^\w.$])t\(\s*'([^'\n]+)'/g;
const TEMPLATE_PREFIX = /(?:^|[^\w.$])t\(\s*`([^`\n$]*?)\$\{/g;

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...walk(full));
		else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) files.push(full);
	}
	return files;
}

function groupSlug(group: string): string {
	return group
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function subcommandSlug(name: string): string {
	return name.trim().replace(/\s+/g, "-");
}

const runtimeExpected = new Set<string>();

for (const command of BUILTIN_SLASH_COMMANDS_INTERNAL) {
	runtimeExpected.add(`omp.slash.${command.name}.description`);
	if (command.acpDescription) runtimeExpected.add(`omp.slash.${command.name}.acpDescription`);
	for (const subcommand of command.subcommands ?? []) {
		runtimeExpected.add(`omp.slash.${command.name}.sub.${subcommandSlug(subcommand.name)}.description`);
	}
}

const settingGroups = new Set<string>();
for (const setting of orderedSettings()) {
	const ui = setting.ui;
	if (!ui?.label || !ui.description) continue;
	runtimeExpected.add(`omp.setting.${setting.id}.label`);
	runtimeExpected.add(`omp.setting.${setting.id}.description`);
	if (ui.warning) runtimeExpected.add(`omp.setting.${setting.id}.warning`);
	if (ui.group) settingGroups.add(ui.group);
	const options = Array.isArray(ui.options) ? ui.options : [];
	for (const option of options) {
		runtimeExpected.add(`omp.setting.${setting.id}.option.${option.value}.label`);
		if (option.description) {
			runtimeExpected.add(`omp.setting.${setting.id}.option.${option.value}.description`);
		}
	}
}
for (const tab of Object.keys(TAB_METADATA)) {
	runtimeExpected.add(`tui.settings.tab.${tab}`);
	runtimeExpected.add(`tui.settings.lead.${tab}`);
}
for (const groups of Object.values(TAB_GROUPS)) {
	for (const group of groups) runtimeExpected.add(`tui.settings.group.${groupSlug(group)}`);
}
for (const group of settingGroups) runtimeExpected.add(`tui.settings.group.${groupSlug(group)}`);
runtimeExpected.add("tui.settings.title");
runtimeExpected.add("tui.settings.plugins.installed");
runtimeExpected.add("omp.setting.env.fallback");
runtimeExpected.add("omp.setting.env.overrides");

for (const entry of cliCommands) {
	if (entry.help?.description) runtimeExpected.add(`omp.cli.command.${entry.name}.description`);
}
for (const [name, flag] of Object.entries(launchHelp.flags ?? {})) {
	if (flag.description) runtimeExpected.add(`omp.cli.command.default.flag.${name}.description`);
}
for (const [name, arg] of Object.entries(launchHelp.args ?? {})) {
	if (arg.description) runtimeExpected.add(`omp.cli.command.default.arg.${name}.description`);
}
for (const entry of cliCommands) {
	if (entry.name === "launch") continue;
	const Cmd = await entry.load();
	for (const [name, flag] of Object.entries(Cmd.flags ?? {})) {
		if (flag.description) runtimeExpected.add(`omp.cli.command.${entry.name}.flag.${name}.description`);
	}
	for (const [name, arg] of Object.entries(Cmd.args ?? {})) {
		if (arg.description) runtimeExpected.add(`omp.cli.command.${entry.name}.arg.${name}.description`);
	}
}

const literals = new Set<string>();
const prefixes = new Set<string>();
for (const dir of SOURCE_DIRS) {
	for (const file of walk(path.join(ROOT, dir))) {
		const text = fs.readFileSync(file, "utf8");
		for (const regex of [LITERAL_DOUBLE, LITERAL_SINGLE]) {
			regex.lastIndex = 0;
			for (const match of text.matchAll(regex)) {
				const key = match[1]!.trim();
				if (key.includes(".") && key.length > 3) literals.add(key);
			}
		}
		TEMPLATE_PREFIX.lastIndex = 0;
		for (const match of text.matchAll(TEMPLATE_PREFIX)) {
			const prefix = match[1]!.trim();
			if (prefix.includes(".")) prefixes.add(prefix);
		}
	}
}

const catalogs = [ru, ruCli, ruSettings, ruTui];
const shipped = new Set<string>();
for (const catalog of catalogs) {
	for (const key of Object.keys(catalog)) shipped.add(key);
}

const missingSet = new Set<string>();
for (const key of literals) if (!shipped.has(key)) missingSet.add(key);
for (const key of runtimeExpected) if (!shipped.has(key)) missingSet.add(key);

const unused = [...shipped]
	.filter(key => {
		if (literals.has(key)) return false;
		if ([...prefixes].some(prefix => key.startsWith(prefix))) return false;
		// Registry-derived keys are only reachable through their expected set.
		return !runtimeExpected.has(key);
	})
	.sort();
const missing = [...missingSet].sort();

const limit = Number(Bun.env.I18N_COVERAGE_LIMIT ?? 40);
if (missing.length > 0) {
	console.error(`missing translations (${missing.length}):`);
	for (const key of missing.slice(0, limit)) console.error(`  ${key}`);
	if (missing.length > limit) console.error(`  … ${missing.length - limit} more`);
}
if (unused.length > 0) {
	console.error(`unused catalog keys (${unused.length}):`);
	for (const key of unused.slice(0, limit)) console.error(`  ${key}`);
	if (unused.length > limit) console.error(`  … ${unused.length - limit} more`);
}

console.log(
	`i18n coverage: ${runtimeExpected.size} runtime keys, ${literals.size} literal keys, ` +
		`${prefixes.size} dynamic prefixes, ${shipped.size} shipped keys, ` +
		`${missing.length} missing, ${unused.length} unused`,
);

if (missing.length > 0 || unused.length > 0) process.exit(1);
