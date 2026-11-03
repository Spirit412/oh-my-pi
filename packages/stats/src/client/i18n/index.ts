/**
 * Dashboard i18n. The locale is fixed at page load: the server injects
 * `window.__OMP_DASHBOARD_CONFIG__` (resolved from the omp `language` setting,
 * `OMP_LANG`, or the system locale), so no locale flash and no async catalog
 * fetch. Dictionaries for the common chrome live in `common.ts`; each route
 * owns a module in `routes/` — glob-imported here so route slices stay
 * mergeable without touching shared files.
 *
 * Strings support `{name}` interpolation; entries can also be plural forms
 * (`{ count }` in the string picks the form by the locale's plural rule —
 * Russian needs one/few/many, English one/other).
 */

import { en as commonEn, ru as commonRu } from "./common";

export type DashboardLocale = "en" | "ru";

/** Plural forms per CLDR categories; `one`/`other` always required. */
export interface PluralForms {
	zero?: string;
	one: string;
	few?: string;
	many?: string;
	other: string;
}

export type MessageEntry = string | PluralForms;
export type MessageDict = Record<string, MessageEntry>;

declare global {
	interface Window {
		__OMP_DASHBOARD_CONFIG__?: { locale?: string };
	}
}

/**
 * Read the boot locale injected into index.html by the stats server. The
 * server tsconfig typechecks this file without the DOM lib (client files are
 * pulled in via shared imports), where `globalThis.window` is untyped — in
 * the browser bundle it is the real window.
 */
function bootLocale(): DashboardLocale {
	const globalRef = globalThis as { window?: Window };
	const config = globalRef.window?.__OMP_DASHBOARD_CONFIG__;
	return config?.locale === "ru" ? "ru" : "en";
}

const initialLocale: DashboardLocale = bootLocale();

/**
 * Route dictionaries, listed explicitly: `import.meta.glob` resolves to an
 * empty record under `Bun.build` (the bundler does not run the glob), which
 * silently dropped every route string from the production bundle. Explicit
 * imports keep the test runtime and the bundle in parity.
 */
import * as charts from "./routes/charts";
import * as commonUi from "./routes/common-ui";
import * as costs from "./routes/costs";
import * as errors from "./routes/errors";
import * as frustration from "./routes/frustration";
import * as gain from "./routes/gain";
import * as models from "./routes/models";
import * as overview from "./routes/overview";
import * as projects from "./routes/projects";
import * as providers from "./routes/providers";
import * as requests from "./routes/requests";
import * as shell from "./routes/shell";
import * as tools from "./routes/tools";
import * as traces from "./routes/traces";
import * as tracesRoute from "./routes/traces-route";

interface RouteDictModule {
	en: MessageDict;
	ru: MessageDict;
}

const routeModules: RouteDictModule[] = [
	charts,
	commonUi,
	costs,
	errors,
	frustration,
	gain,
	models,
	overview,
	projects,
	providers,
	requests,
	shell,
	tools,
	traces,
	tracesRoute,
];

function merge(base: MessageDict, modules: RouteDictModule[], locale: "en" | "ru") {
	const merged: MessageDict = { ...base };
	for (const mod of modules) {
		Object.assign(merged, locale === "en" ? mod.en : mod.ru);
	}
	return merged;
}

const en = merge(commonEn, routeModules, "en");
const ru = merge(commonRu, routeModules, "ru");

// Boot-time dictionary integrity check: every key must exist in both locales.
// A missing key falls back to English at runtime; surfacing it here keeps the
// dictionaries honest without needing a build step.
if (typeof console !== "undefined") {
	for (const key of Object.keys(en)) {
		if (!(key in ru)) console.warn(`[i18n] missing ru translation: ${key}`);
	}
	for (const key of Object.keys(ru)) {
		if (!(key in en)) console.warn(`[i18n] missing en translation: ${key}`);
	}
}

const messages: Record<DashboardLocale, MessageDict> = { en, ru };

/** Fully merged English dictionary (common + all routes); consumer: tests. */
export const enMessages: MessageDict = en;
/** Fully merged Russian dictionary (common + all routes); consumer: tests. */
export const ruMessages: MessageDict = ru;

const current: DashboardLocale = initialLocale;

/** The active dashboard locale (fixed for the page lifetime). */
export function getLocale(): DashboardLocale {
	return current;
}

/** BCP-47 tag for Intl formatters. */
export function intlLocale(): string {
	return current === "ru" ? "ru-RU" : "en-US";
}

/** CLDR plural category for `n` in the active locale. */
function pluralForm(n: number): keyof PluralForms {
	if (current === "ru") {
		const abs = Math.abs(n);
		if (Number.isInteger(abs)) {
			const mod10 = abs % 10;
			const mod100 = abs % 100;
			if (mod10 === 1 && mod100 !== 11) return "one";
			if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
			if (mod10 === 0 || (mod10 >= 5 && mod10 <= 9) || (mod100 >= 11 && mod100 <= 14)) return "many";
		}
		return "other";
	}
	return n === 1 ? "one" : "other";
}

/**
 * Translate `key` with `{name}` interpolation. When the entry is plural forms
 * and `params.count` is present, the matching form is selected.
 */
export function t(key: string, params?: Record<string, string | number>): string {
	const entry = messages[current][key] ?? messages.en[key];
	if (entry === undefined) {
		if (typeof console !== "undefined") console.warn(`[i18n] unknown key: ${key}`);
		return key;
	}
	let template: string;
	if (typeof entry === "string") {
		template = entry;
	} else {
		template = (params?.count !== undefined && entry[pluralForm(Number(params.count))]) || entry.other;
	}
	if (params) {
		for (const [name, value] of Object.entries(params)) {
			template = template.replaceAll(`{${name}}`, String(value));
		}
	}
	return template;
}

/** Hook form of {@link t}; the locale never changes at runtime, so this is stable. */
export function useT(): typeof t {
	return t;
}
