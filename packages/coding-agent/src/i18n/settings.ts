import { effect, register } from "../config/registry";
import { setLocale } from "@oh-my-pi/pi-utils/i18n";
import { registerCoreCatalogs } from "./index";
import { resolveLocale, validateLocaleTag } from "./locale";

registerCoreCatalogs();

/**
 * UI language. `auto` follows the system locale; bundled catalogs cover English
 * and Russian. Plugins and extensions can register additional catalogs.
 */
export const cfgLanguage = register({
	id: "language",
	type: "string",
	default: "auto",
	env: "OMP_LANG",
	normalize: value => {
		if (typeof value !== "string") return value;
		return value.trim().split(".")[0]!.replaceAll("_", "-").toLowerCase();
	},
	validate: value => {
		if (value === undefined || value === null) return;
		if (typeof value !== "string") throw new Error("Language must be a string");
		validateLocaleTag(value);
	},
	ui: {
		tab: "appearance",
		group: "Language",
		label: "Language",
		description: "UI language. Auto follows the system locale; English and Russian are bundled.",
		options: [
			{ value: "auto", label: "Auto (system)", description: "Follow the system locale" },
			{ value: "en", label: "English", description: "English UI" },
			{ value: "ru", label: "Русский", description: "Russian UI" },
		],
	},
});

effect(cfgLanguage, value => {
	setLocale(resolveLocale({ configured: value }));
});
