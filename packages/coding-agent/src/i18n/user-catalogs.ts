/**
 * User- and project-level translation catalogs.
 *
 * Core catalogs ship with omp and plugin catalogs ship inside a plugin, but
 * project commands, user skills, and installed third-party commands/skills
 * still need a place to put display translations. These catalogs live next to
 * the configuration:
 *
 * - `<agentDir>/locales/<locale>.json` (user, e.g. `~/.omp/agent/locales/ru.json`)
 * - `<cwd>/.omp/locales/<locale>.json` (project, wins over the user catalog)
 *
 * They register after core and plugin catalogs, so a user entry can translate
 * a description that a plugin left in English without modifying the plugin
 * (whose files are replaced on update).
 */
import type { Dirent } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { isEnoent, logger } from "@oh-my-pi/pi-utils";
import { getAgentDir, getProjectDir } from "@oh-my-pi/pi-utils/dirs";
import { isTranslationCatalog, registerCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Same bound the plugin loader applies to untrusted catalogs. */
const MAX_CATALOG_KEYS = 5000;

/**
 * Project catalogs come from the checked-out repository, so they may only
 * describe project commands and skills. Letting them redefine core UI copy
 * would let a repository relabel approval actions.
 */
function isProjectCatalogKey(key: string): boolean {
	return key.startsWith("omp.dynamic.");
}

async function registerCatalogDir(dir: string, source: string, keyFilter?: (key: string) => boolean): Promise<void> {
	let entries: Dirent[];
	try {
		entries = await fs.readdir(dir, { withFileTypes: true });
	} catch (error) {
		if (isEnoent(error)) return;
		logger.warn("Failed to read locale catalog directory", { dir, error: String(error) });
		return;
	}
	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
		const locale = entry.name.slice(0, -".json".length).trim();
		if (!locale) continue;
		const file = path.join(dir, entry.name);
		try {
			const raw: unknown = await Bun.file(file).json();
			if (!isTranslationCatalog(raw)) {
				logger.warn("Ignoring invalid locale catalog", { file });
				continue;
			}
			const keys = Object.keys(raw).length;
			if (keys > MAX_CATALOG_KEYS) {
				logger.warn("Ignoring oversized locale catalog", { file, keys });
				continue;
			}
			const catalog = keyFilter ? Object.fromEntries(Object.entries(raw).filter(([key]) => keyFilter(key))) : raw;
			const kept = Object.keys(catalog).length;
			if (kept === 0) continue;
			if (kept !== keys) {
				logger.warn("Ignoring project locale keys outside omp.dynamic.*", { file, ignored: keys - kept });
			}
			registerCatalog(locale, catalog, `${source}:${file}`);
		} catch (error) {
			logger.warn("Failed to load locale catalog", { file, error: String(error) });
		}
	}
}

/**
 * Register user and project locale catalogs. User entries load first so a
 * project catalog in the same locale wins for the keys it defines.
 */
export async function loadUserTranslationCatalogs(options: { agentDir?: string; cwd?: string } = {}): Promise<void> {
	const agentDir = options.agentDir ?? getAgentDir();
	const cwd = options.cwd ?? getProjectDir();
	await registerCatalogDir(path.join(agentDir, "locales"), "user-locales");
	await registerCatalogDir(path.join(cwd, ".omp", "locales"), "project-locales", isProjectCatalogKey);
}
