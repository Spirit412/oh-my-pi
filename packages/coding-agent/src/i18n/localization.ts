/**
 * `/localization` resolution: the choice list shown by the command and its TUI
 * selector, argument validation, and the persisted write that switches the
 * ambient locale.
 */
import type { LocalizationChoice } from "@oh-my-pi/pi-tui/overlays/localization-selector";
import type { Settings } from "../config/settings";
import { getAvailableLocales, getLocale, t } from "./index";
import { validateLocaleTag } from "./locale";
import { cfgLanguage } from "./settings";

/** Selector value that follows the system locale ({@link resolveLocale}). */
export const AUTO_LOCALE = "auto";
const ENGLISH_LOCALE = "en";

/** Native display name for a locale tag (`ru` → `русский`), falling back to the tag. */
function localeLabel(tag: string): string {
	try {
		const label = new Intl.DisplayNames([tag], { type: "language" }).of(tag);
		if (label) return label;
	} catch {
		// Malformed or unsupported tag: the raw tag is still a usable label.
	}
	return tag;
}

/** Label for a configured value, including the `auto` pseudo-locale. */
export function localizationLabel(value: string): string {
	return value === AUTO_LOCALE ? t("omp.slash.localization.option.auto.label", "Auto (system)") : localeLabel(value);
}

/**
 * Every localization the UI can switch to: `auto`, English (the inline
 * fallback, never a catalog), then each locale with a registered catalog —
 * bundled Russian plus user/project/plugin catalogs, sorted.
 */
export function localizationChoices(): LocalizationChoice[] {
	const catalogs = [...new Set(getAvailableLocales())].filter(locale => locale !== ENGLISH_LOCALE).sort();
	return [
		{
			value: AUTO_LOCALE,
			label: localizationLabel(AUTO_LOCALE),
			description: t("omp.slash.localization.option.auto.description", "Follow the system locale"),
		},
		{
			value: ENGLISH_LOCALE,
			label: localeLabel(ENGLISH_LOCALE),
			description: t("omp.slash.localization.option.en.description", "English UI"),
		},
		...catalogs.map(locale => ({ value: locale, label: localeLabel(locale), description: locale })),
	];
}

/**
 * Selector value representing the configured localization. A regional
 * override (`ru-ru`) selects its base catalog entry so the list opens on the
 * language actually in effect.
 */
export function currentLocalizationChoice(settings: Settings): string {
	const configured = cfgLanguage.get(settings) ?? AUTO_LOCALE;
	if (configured === AUTO_LOCALE) return AUTO_LOCALE;
	const choices = localizationChoices();
	const exact = choices.find(choice => choice.value === configured);
	if (exact) return exact.value;
	const base = configured.split("-")[0] ?? configured;
	return choices.find(choice => choice.value === base)?.value ?? configured;
}

/** One-line status for autocomplete and `/localization` help output. */
export function currentLocalizationLabel(settings: Settings): string {
	const configured = cfgLanguage.get(settings) ?? AUTO_LOCALE;
	return configured === AUTO_LOCALE ? `${localizationLabel(AUTO_LOCALE)}, ${getLocale()}` : localeLabel(configured);
}

function unknownLocalization(input: string): string {
	const locales = localizationChoices()
		.map(choice => choice.value)
		.join(", ");
	return t("omp.slash.localization.unknown", 'Unknown localization "{locale}". Available: {locales}', {
		locale: input,
		locales,
	});
}

export type LocalizationResolution = { value: string } | { error: string };

/**
 * Validate one `/localization` argument. `auto`/`system` follow the system
 * locale; a tag is accepted when its language has a registered catalog, so
 * `ru-RU` resolves to the Russian catalog and `de-AT` works once a `de` catalog
 * is installed.
 */
export function resolveLocalizationArgument(raw: string): LocalizationResolution {
	const input = raw.trim();
	if (!input) {
		return { error: t("omp.slash.localization.usage", "Usage: /localization [auto|en|<locale>]") };
	}
	const lower = input.toLowerCase();
	if (lower === AUTO_LOCALE || lower === "system") return { value: AUTO_LOCALE };

	let tag: string;
	try {
		tag = validateLocaleTag(input);
	} catch {
		return { error: unknownLocalization(input) };
	}
	if (tag === ENGLISH_LOCALE) return { value: tag };

	const available = getAvailableLocales();
	if (available.includes(tag)) return { value: tag };
	const base = tag.split("-")[0] ?? tag;
	if (available.includes(base)) return { value: tag };
	return { error: unknownLocalization(input) };
}

/** Persist the localization and return the operator-facing confirmation. */
export function applyLocalization(settings: Settings, value: string): string {
	cfgLanguage.set(settings, value);
	// The `cfgLanguage` effect already switched the ambient locale, so this
	// message renders in the localization the operator just picked.
	return t("omp.slash.localization.applied", "Localization set to {locale}.", {
		locale: localizationLabel(value),
	});
}

/** Current localization plus the switchable values, for text/ACP output. */
export function localizationSummary(settings: Settings): string {
	const locales = localizationChoices()
		.map(choice => choice.value)
		.join(", ");
	return `${t("omp.slash.localization.current", "Localization: {locale}", {
		locale: currentLocalizationLabel(settings),
	})}\n${t("omp.slash.localization.available", "Available: {locales}", { locales })}`;
}
