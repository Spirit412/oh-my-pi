/**
 * Ambient, late-bound message translation.
 *
 * English source text is the inline fallback:
 *
 *   t("omp.approval.allow", "Allow tool: {name}", { name })
 *
 * Catalogs registered for the active locale override that fallback. Lookup is
 * call-time, never import-time, so a locale change applies to the next render.
 * Missing keys and missing locales fall back to English.
 */

export type MessageParams = Readonly<Record<string, string | number>>;

export type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

/** A plural message keyed by `Intl.PluralRules` categories; `other` is required. */
export type PluralMessage = Partial<Record<PluralCategory, string>> & { other: string };

export type Message = string | PluralMessage;

export type TranslationCatalog = Readonly<Record<string, Message>>;

interface CatalogEntry {
	readonly source: string;
	readonly message: Message;
}

const FALLBACK_LOCALE = "en";
const catalogs = new Map<string, Map<string, CatalogEntry[]>>();
const pluralRulesCache = new Map<string, Intl.PluralRules>();
let currentLocale = FALLBACK_LOCALE;

/** Canonicalize a BCP-47 tag, tolerating POSIX spellings such as `ru_RU.UTF-8`. */
export function normalizeLocale(tag: string | undefined): string {
	if (!tag) return FALLBACK_LOCALE;
	let cleaned = tag.trim();
	if (!cleaned) return FALLBACK_LOCALE;
	const encodingStart = cleaned.indexOf(".");
	if (encodingStart !== -1) cleaned = cleaned.slice(0, encodingStart);
	cleaned = cleaned.replaceAll("_", "-");
	if (/^(c|posix)$/i.test(cleaned)) return FALLBACK_LOCALE;
	try {
		const [canonical] = Intl.getCanonicalLocales(cleaned);
		if (canonical) return canonical.toLowerCase();
	} catch {
		// Fall through to the base language for malformed or unknown tags.
	}
	const base = cleaned.split("-")[0]?.toLowerCase();
	return base || FALLBACK_LOCALE;
}

/** The language part of a normalized tag (`ru-RU` → `ru`). */
export function baseLocale(tag: string): string {
	const normalized = normalizeLocale(tag);
	return normalized.split("-")[0] ?? normalized;
}

/** Set the ambient locale used by {@link t}. Returns the normalized tag. */
export function setLocale(tag: string | undefined): string {
	currentLocale = normalizeLocale(tag);
	return currentLocale;
}

/** The ambient locale used by {@link t}. */
export function getLocale(): string {
	return currentLocale;
}

/** Locales with at least one registered catalog. */
export function getAvailableLocales(): string[] {
	return [...catalogs.keys()].sort();
}

function isPluralMessage(value: unknown): value is PluralMessage {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const record = value as Record<string, unknown>;
	if (typeof record.other !== "string") return false;
	for (const category of ["zero", "one", "two", "few", "many"] as const) {
		const form = record[category];
		if (form !== undefined && typeof form !== "string") return false;
	}
	return true;
}

/** Validate an untrusted catalog (plugin JSON) before registering it. */
export function isTranslationCatalog(value: unknown): value is TranslationCatalog {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	for (const [key, message] of Object.entries(value as Record<string, unknown>)) {
		if (!key.trim()) return false;
		if (typeof message !== "string" && !isPluralMessage(message)) return false;
	}
	return true;
}

function assertMessage(key: string, message: Message): void {
	if (typeof message === "string") {
		if (!message) throw new TypeError(`Translation "${key}" is empty`);
		return;
	}
	if (!isPluralMessage(message)) {
		throw new TypeError(`Translation "${key}" must be a string or a plural object with "other"`);
	}
}

/**
 * Register a catalog for `locale`. Later registrations win for the same
 * `source`; a different source stacks on top. Returns a disposer that restores
 * the previous value.
 */
export function registerCatalog(locale: string, catalog: TranslationCatalog, source = "anonymous"): () => void {
	const normalized = normalizeLocale(locale);
	const entries: Array<{ key: string; entry: CatalogEntry }> = [];
	let byKey = catalogs.get(normalized);
	if (!byKey) {
		byKey = new Map();
		catalogs.set(normalized, byKey);
	}
	for (const [key, message] of Object.entries(catalog)) {
		assertMessage(key, message);
		const entry: CatalogEntry = { source, message };
		const stack = byKey.get(key) ?? [];
		const existing = stack.findIndex(candidate => candidate.source === source);
		if (existing === -1) stack.push(entry);
		else stack[existing] = entry;
		byKey.set(key, stack);
		entries.push({ key, entry });
	}
	return () => {
		const activeByKey = catalogs.get(normalized);
		if (!activeByKey) return;
		for (const { key, entry } of entries) {
			const stack = activeByKey.get(key);
			if (!stack) continue;
			const index = stack.indexOf(entry);
			if (index !== -1) stack.splice(index, 1);
			if (stack.length === 0) activeByKey.delete(key);
		}
		if (activeByKey.size === 0) catalogs.delete(normalized);
	};
}

function lookupMessage(key: string, locale: string): Message | undefined {
	const candidates = [locale, baseLocale(locale), FALLBACK_LOCALE];
	const seen = new Set<string>();
	for (const candidate of candidates) {
		if (seen.has(candidate)) continue;
		seen.add(candidate);
		const stack = catalogs.get(candidate)?.get(key);
		if (stack && stack.length > 0) return stack[stack.length - 1]!.message;
	}
	return undefined;
}

function pluralRules(locale: string): Intl.PluralRules {
	const cached = pluralRulesCache.get(locale);
	if (cached) return cached;
	const rules = new Intl.PluralRules(locale);
	pluralRulesCache.set(locale, rules);
	return rules;
}

function selectPlural(message: PluralMessage, params: MessageParams | undefined, locale: string): string {
	const raw = params?.count;
	const count = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
	if (!Number.isFinite(count)) return message.other;
	const category = pluralRules(locale).select(count) as PluralCategory;
	return message[category] ?? message.other;
}

function interpolate(text: string, params: MessageParams | undefined): string {
	if (!params) return text;
	return text.replace(/\{([A-Za-z0-9_]+)\}/g, (placeholder, name: string) => {
		const value = params[name];
		return value === undefined ? placeholder : String(value);
	});
}

/** Format a message without a catalog lookup; used by tests and tooling. */
export function formatMessage(message: Message, params?: MessageParams, locale = currentLocale): string {
	const text = typeof message === "string" ? message : selectPlural(message, params, locale);
	return interpolate(text, params);
}

/**
 * Translate `key` in the active locale, falling back to `fallback` (English
 * source text). `{name}` placeholders are filled from `params`; plural objects
 * use `params.count`.
 */
export function t(key: string, fallback: Message, params?: MessageParams): string {
	return formatMessage(lookupMessage(key, currentLocale) ?? fallback, params, currentLocale);
}

/** Whether the active locale (or its base/English fallback) defines `key`. */
export function hasTranslation(key: string, locale = currentLocale): boolean {
	return lookupMessage(key, normalizeLocale(locale)) !== undefined;
}

/** Drop every catalog and reset the locale; test teardown only. */
export function resetI18nForTest(): void {
	catalogs.clear();
	pluralRulesCache.clear();
	currentLocale = FALLBACK_LOCALE;
}
