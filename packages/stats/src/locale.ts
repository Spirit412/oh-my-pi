import * as path from "node:path";
import { getAgentDir } from "@oh-my-pi/pi-utils";
import { parse as parseYaml } from "yaml";

/** Dashboard UI locales. The client bundles English and Russian dictionaries. */
export type DashboardLocale = "en" | "ru";

/**
 * Normalize an arbitrary locale tag (`ru_RU.UTF-8`, `pt-BR`) to a dashboard
 * locale. Unsupported tags fall back to English so the UI never renders a
 * half-translated page: the bundled dictionaries cover exactly `en` and `ru`.
 */
export function normalizeDashboardLocale(tag: string | undefined | null): DashboardLocale {
	return tag?.split("-")[0]?.toLowerCase() === "ru" ? "ru" : "en";
}

/** Extract a usable tag from a raw setting/env value; `auto`/empty → undefined. */
function usableTag(raw: string | undefined | null): string | undefined {
	if (!raw) return undefined;
	const tag = raw.trim().split(".")[0]!.replaceAll("_", "-");
	if (!tag || /^auto$/i.test(tag) || /^system$/i.test(tag)) return undefined;
	try {
		return Intl.getCanonicalLocales(tag)[0]?.toLowerCase();
	} catch {
		return undefined;
	}
}

/** Read the `language` key from the user-level omp config (`~/.omp/config.yml`). */
async function configuredLanguage(configDir: string): Promise<string | undefined> {
	let text: string | undefined;
	for (const filename of ["config.yml", "config.yaml"]) {
		try {
			text = await Bun.file(path.join(configDir, filename)).text();
			break;
		} catch {
			// Try the next legacy filename (mirrors MAIN_CONFIG_FILENAMES).
		}
	}
	if (text === undefined) return undefined;
	try {
		const doc: unknown = parseYaml(text);
		if (doc && typeof doc === "object" && !Array.isArray(doc)) {
			const value = (doc as Record<string, unknown>).language;
			if (typeof value === "string") return value;
		}
	} catch {
		// Malformed YAML: behave as if the key is absent rather than failing the page.
	}
	return undefined;
}

/**
 * Resolve the dashboard UI locale, mirroring the CLI's `resolveLocale`:
 * `OMP_LANG` env > `language` setting in the user-level omp config > system
 * `LC_ALL`/`LC_MESSAGES`/`LANG` > English. The setting value `auto` falls
 * through to the system locale. `configDir` is injectable for tests.
 */
export async function resolveDashboardLocale(
	env: NodeJS.ProcessEnv = process.env,
	configDir: string = getAgentDir(),
): Promise<DashboardLocale> {
	const fromEnv = usableTag(env.OMP_LANG);
	if (fromEnv) return normalizeDashboardLocale(fromEnv);
	const fromConfig = usableTag(await configuredLanguage(configDir));
	if (fromConfig) return normalizeDashboardLocale(fromConfig);
	const fromSystem = usableTag(env.LC_ALL ?? env.LC_MESSAGES ?? env.LANG);
	return normalizeDashboardLocale(fromSystem);
}
