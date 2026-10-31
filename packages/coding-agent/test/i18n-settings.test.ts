import { afterEach, describe, expect, test } from "bun:test";
import {
	TAB_GROUPS,
	TAB_LEADS,
	TAB_METADATA,
	type SettingTab,
	type SubmenuOption,
	settingsGroupKey,
	settingsGroupLabel,
} from "@oh-my-pi/pi-tui/overlays/settings-defs";
import { createSettingsHost } from "../src/config/settings-ui";
import { hasTranslation, registerCatalog, registerCoreCatalogs, resetI18nForTest, setLocale } from "../src/i18n";

afterEach(() => {
	resetI18nForTest();
	registerCoreCatalogs();
});

function settingsEntry(path: string) {
	const found = createSettingsHost().entries.find(entry => entry.path === path);
	if (!found) throw new Error(`missing setting: ${path}`);
	return found;
}

function settingsUi(path: string) {
	const ui = settingsEntry(path).ui;
	if (!ui) throw new Error(`setting has no UI metadata: ${path}`);
	return ui;
}

function submenuOptions(path: string): SubmenuOption[] {
	const options = settingsUi(path).options;
	if (options === "runtime" || options === undefined) throw new Error(`no static options for: ${path}`);
	return [...options];
}

describe("settings UI i18n", () => {
	test("English labels, descriptions, and option copy are unchanged", () => {
		expect(settingsUi("language").label).toBe("Language");
		expect(settingsUi("language").description).toBe(
			"UI language. Auto follows the system locale; English and Russian are bundled.",
		);

		const storage = submenuOptions("modelRoleStorage");
		expect(storage[0]).toMatchObject({ value: "global", label: "Global" });
		expect(storage[1]).toMatchObject({ value: "project", label: "Per-project" });
	});

	test("labels, descriptions, and option copy resolve through the ambient locale", () => {
		registerCatalog(
			"de",
			{
				"omp.setting.modelRoleStorage.label": "Speicherort der Modellrollen",
				"omp.setting.modelRoleStorage.description": "Wo Rollenmodelle gespeichert werden",
				"omp.setting.modelRoleStorage.option.global.label": "Global",
				"omp.setting.modelRoleStorage.option.global.description":
					"Rollenmodelle in der aktiven Profilkonfiguration speichern",
			},
			"test",
		);
		setLocale("de");

		const storageUi = settingsUi("modelRoleStorage");
		expect(storageUi.label).toBe("Speicherort der Modellrollen");
		expect(storageUi.description).toBe("Wo Rollenmodelle gespeichert werden");

		const storage = submenuOptions("modelRoleStorage");
		expect(storage[0].value).toBe("global");
		expect(storage[0].label).toBe("Global");
		expect(storage[0].description).toBe("Rollenmodelle in der aktiven Profilkonfiguration speichern");
		// Untranslated option keys keep their inline English fallback.
		expect(storage[1].label).toBe("Per-project");
	});

	test("environment override notes are localized and appended after the description", () => {
		const previous = Bun.env.OMP_LANG;
		Bun.env.OMP_LANG = "ru";
		try {
			registerCatalog(
				"de",
				{
					"omp.setting.language.description": "Sprache der Oberfläche.",
					"omp.setting.env.overrides": " ${name} überschreibt diese Einstellung, solange sie gesetzt ist.",
				},
				"test",
			);
			setLocale("de");

			expect(settingsUi("language").description).toBe(
				"Sprache der Oberfläche. $OMP_LANG überschreibt diese Einstellung, solange sie gesetzt ist.",
			);
		} finally {
			if (previous === undefined) delete Bun.env.OMP_LANG;
			else Bun.env.OMP_LANG = previous;
		}
	});
});

describe("bundled Russian settings catalog", () => {
	test("covers every setting label, description, warning, and option", () => {
		for (const entry of createSettingsHost().entries) {
			expect(hasTranslation(`omp.setting.${entry.path}.label`, "ru")).toBe(true);
			expect(hasTranslation(`omp.setting.${entry.path}.description`, "ru")).toBe(true);
			const ui = entry.ui;
			if (!ui) continue;
			if (ui.warning) {
				expect(hasTranslation(`omp.setting.${entry.path}.warning`, "ru")).toBe(true);
			}
			if (Array.isArray(ui.options)) {
				for (const option of ui.options) {
					expect(hasTranslation(`omp.setting.${entry.path}.option.${option.value}.label`, "ru")).toBe(true);
					if (option.description) {
						expect(hasTranslation(`omp.setting.${entry.path}.option.${option.value}.description`, "ru")).toBe(
							true,
						);
					}
				}
			}
		}
	});

	test("covers tab labels, leads, and every section heading", () => {
		for (const tab of Object.keys(TAB_METADATA) as SettingTab[]) {
			expect(hasTranslation(`tui.settings.tab.${tab}`, "ru")).toBe(true);
			expect(hasTranslation(`tui.settings.lead.${tab}`, "ru")).toBe(true);
		}
		for (const groups of Object.values(TAB_GROUPS)) {
			for (const group of groups) {
				expect(hasTranslation(settingsGroupKey(group), "ru")).toBe(true);
			}
		}

		setLocale("ru");
		expect(settingsGroupLabel("Theme")).toBe("Тема");
		expect(TAB_METADATA.appearance.label).toBe("Внешний вид");
	});
});
