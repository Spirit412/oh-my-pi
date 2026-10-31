import { normalizeLocale } from "@oh-my-pi/pi-utils/i18n";
import { isBunTestRuntime } from "@oh-my-pi/pi-utils/test-runtime";

export interface LocaleSources {
	/** Explicit CLI `--lang` value. */
	cli?: string;
	/** Effective `language` setting (already includes the `OMP_LANG` env override). */
	configured?: string;
	/** Process environment; injectable for tests. */
	env?: Readonly<Record<string, string | undefined>>;
	/** Force test determinism; defaults to {@link isBunTestRuntime}. */
	test?: boolean;
}

function isAuto(value: string | undefined): boolean {
	const normalized = value?.trim().toLowerCase();
	return !normalized || normalized === "auto" || normalized === "system";
}

/**
 * Resolve the UI locale.
 *
 * CLI > `OMP_LANG`/setting > system `LC_ALL`/`LC_MESSAGES`/`LANG` > English.
 * Under `bun test`, `auto` resolves to English unless `--lang` or `OMP_LANG`
 * is explicit, so host locale never changes English assertions.
 */
export function resolveLocale(sources: LocaleSources = {}): string {
	const cli = sources.cli?.trim();
	if (cli) return normalizeLocale(cli);

	const configured = sources.configured?.trim();
	if (!isAuto(configured)) return normalizeLocale(configured);

	if (sources.test ?? isBunTestRuntime()) return "en";

	const env = sources.env ?? process.env;
	const raw = env.OMP_LANG ?? env.LC_ALL ?? env.LC_MESSAGES ?? env.LANG;
	return normalizeLocale(raw);
}

/** Validate a `language` setting value and return its normalized form. */
export function validateLocaleTag(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) throw new Error("Language must not be empty");
	if (isAuto(trimmed)) return "auto";
	const withoutEncoding = trimmed.split(".")[0]!;
	if (!withoutEncoding) throw new Error("Language must not be empty");
	const normalized = withoutEncoding.replaceAll("_", "-");
	Intl.getCanonicalLocales(normalized);
	return normalized.toLowerCase();
}
