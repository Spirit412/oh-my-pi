import { registerCatalog } from "@oh-my-pi/pi-utils/i18n";
import { ru } from "./catalogs/ru";

/** Register catalogs bundled with the coding agent. Safe to call repeatedly. */
export function registerCoreCatalogs(): void {
	registerCatalog("ru", ru, "omp-core");
}

export {
	formatMessage,
	getAvailableLocales,
	getLocale,
	hasTranslation,
	isTranslationCatalog,
	normalizeLocale,
	registerCatalog,
	resetI18nForTest,
	setLocale,
	t,
	type Message,
	type MessageParams,
	type PluralMessage,
	type TranslationCatalog,
} from "@oh-my-pi/pi-utils/i18n";

registerCoreCatalogs();
