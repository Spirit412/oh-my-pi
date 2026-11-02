import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { resetSettingsForTest, Settings } from "../src/config/settings";
import { getLocale, registerCoreCatalogs, resetI18nForTest, setLocale } from "../src/i18n";
import {
	AUTO_LOCALE,
	applyLocalization,
	currentLocalizationChoice,
	localizationChoices,
	localizationSummary,
	resolveLocalizationArgument,
} from "../src/i18n/localization";
import { cfgLanguage } from "../src/i18n/settings";
import { BUILTIN_SLASH_COMMANDS_INTERNAL, BUILTIN_SLASH_COMMAND_DEFS } from "../src/slash-commands/builtin-registry";
import type { SlashCommandSpec } from "../src/slash-commands/types";

let settings: Settings;

function localizationSpec(): SlashCommandSpec {
	const spec = BUILTIN_SLASH_COMMANDS_INTERNAL.find(command => command.name === "localization");
	if (!spec) throw new Error("missing /localization command");
	return spec;
}

beforeEach(async () => {
	resetSettingsForTest();
	resetI18nForTest();
	registerCoreCatalogs();
	setLocale("en");
	settings = await Settings.init({ inMemory: true, cwd: process.cwd() });
});

afterEach(() => {
	resetSettingsForTest();
	resetI18nForTest();
	registerCoreCatalogs();
	setLocale("en");
});

describe("/localization choices", () => {
	test("covers auto, English, and every installed catalog exactly once", () => {
		const values = localizationChoices().map(choice => choice.value);
		expect(values[0]).toBe(AUTO_LOCALE);
		expect(values).toContain("en");
		expect(values).toContain("ru");
		expect(new Set(values).size).toBe(values.length);
	});

	test("preselects the base catalog for a regional configuration", () => {
		cfgLanguage.set(settings, "ru-RU");
		expect(currentLocalizationChoice(settings)).toBe("ru");
		expect(cfgLanguage.get(settings)).toBe("ru-ru");
	});
});

describe("/localization arguments", () => {
	test("accepts auto, the English fallback, catalogs, and regional tags covered by a base catalog", () => {
		expect(resolveLocalizationArgument("auto")).toEqual({ value: AUTO_LOCALE });
		expect(resolveLocalizationArgument("system")).toEqual({ value: AUTO_LOCALE });
		expect(resolveLocalizationArgument("en")).toEqual({ value: "en" });
		expect(resolveLocalizationArgument("ru")).toEqual({ value: "ru" });
		expect(resolveLocalizationArgument("ru-RU")).toEqual({ value: "ru-ru" });
	});

	test("rejects locales without a catalog and keeps the input in the message", () => {
		const resolved = resolveLocalizationArgument("zz");
		if (!("error" in resolved)) throw new Error("expected a rejection");
		expect(resolved.error).toContain('"zz"');
		expect(resolved.error).toContain("auto");
	});

	test("applying a localization persists it, switches the ambient locale, and reports in the new one", () => {
		const message = applyLocalization(settings, "ru");
		expect(cfgLanguage.get(settings)).toBe("ru");
		expect(getLocale()).toBe("ru");
		expect(message).toContain("Локализация");
		expect(localizationSummary(settings)).toContain("Локализация");
	});
});

describe("/localization command", () => {
	test("registry advertises the locale alias and a live status line", () => {
		const def = BUILTIN_SLASH_COMMAND_DEFS.find(command => command.name === "localization");
		expect(def?.aliases).toEqual(["locale"]);
		expect(def?.allowArgs).toBe(true);

		const spec = localizationSpec();
		expect(spec.getTuiAutocompleteDescription?.({ ctx: { settings } } as never)).toContain("Auto (system)");
		cfgLanguage.set(settings, "ru");
		expect(spec.getTuiAutocompleteDescription?.({ ctx: { settings } } as never)).toContain("Локализация");
	});

	test("TUI handler opens the picker without an argument and applies one with it", () => {
		const spec = localizationSpec();
		const statuses: string[] = [];
		let opened = 0;
		const runtime = {
			ctx: {
				settings,
				editor: { setText() {} },
				showLocalizationSelector: () => {
					opened += 1;
				},
				showStatus: (message: string) => {
					statuses.push(message);
				},
				showError: (message: string) => {
					statuses.push(`error: ${message}`);
				},
				ui: { requestRender() {} },
			},
		} as never;

		spec.handleTui?.({ name: "localization", args: "", text: "/localization" }, runtime);
		expect(opened).toBe(1);

		spec.handleTui?.({ name: "localization", args: "ru", text: "/localization ru" }, runtime);
		expect(cfgLanguage.get(settings)).toBe("ru");
		expect(statuses.at(-1)).toContain("Локализация");

		spec.handleTui?.({ name: "localization", args: "zz", text: "/localization zz" }, runtime);
		expect(statuses.at(-1)).toStartWith("error:");
		expect(cfgLanguage.get(settings)).toBe("ru");
	});

	test("text/ACP handler prints the current localization and notifies on a change", async () => {
		const spec = localizationSpec();
		const output: string[] = [];
		let configChanges = 0;
		const runtime = {
			settings,
			output: async (text: string) => {
				output.push(text);
			},
			notifyConfigChanged: async () => {
				configChanges += 1;
			},
		} as never;

		await spec.handle?.({ name: "localization", args: "", text: "/localization" }, runtime);
		expect(output.at(-1)).toContain("Localization:");
		expect(output.at(-1)).toContain("auto");
		expect(configChanges).toBe(0);

		await spec.handle?.({ name: "localization", args: "ru", text: "/localization ru" }, runtime);
		expect(cfgLanguage.get(settings)).toBe("ru");
		expect(output.at(-1)).toContain("Локализация");
		expect(configChanges).toBe(1);

		await spec.handle?.({ name: "localization", args: "zz", text: "/localization zz" }, runtime);
		expect(output.at(-1)).toContain("zz");
		expect(configChanges).toBe(1);
	});
});
