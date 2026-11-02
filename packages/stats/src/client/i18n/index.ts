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
	interface ImportMeta {
		/** Bun/Vite-compatible eager glob import (bundled at build time). */
		glob<T>(pattern: string, options: { eager: true }): Record<string, T>;
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

const routeModules = import.meta.glob<{ en: MessageDict; ru: MessageDict }>("./routes/*.ts", { eager: true });

function merge(base: MessageDict, modules: Record<string, { en: MessageDict; ru: MessageDict }>, locale: "en" | "ru") {
	const merged: MessageDict = { ...base };
	for (const key of Object.keys(modules)) {
		Object.assign(merged, locale === "en" ? modules[key]!.en : modules[key]!.ru);
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

let current: DashboardLocale = initialLocale;

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
