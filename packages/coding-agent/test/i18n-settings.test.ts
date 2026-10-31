import { afterEach, describe, expect, test } from "bun:test";
import type { SubmenuOption } from "@oh-my-pi/pi-tui/overlays/settings-defs";
import { createSettingsHost } from "../src/config/settings-ui";
import { registerCatalog, registerCoreCatalogs, resetI18nForTest, setLocale } from "../src/i18n";

afterEach(() => {
	resetI18nForTest();
	registerCoreCatalogs();
});

function settingsEntry(path: string) {
	const found = createSettingsHost().entries.find(entry => entry.path === path);
	if (!found) throw new Error(`missing setting: ${path}`);
	return found;
}

function submenuOptions(path: string): SubmenuOption[] {
	const options = settingsEntry(path).ui.options;
	if (options === "runtime" || options === undefined) throw new Error(`no static options for: ${path}`);
	return [...options];
}

describe("settings UI i18n", () => {
	test("English labels, descriptions, and option copy are unchanged", () => {
		const language = settingsEntry("language");
		expect(language.ui.label).toBe("Language");
		expect(language.ui.description).toBe(
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

		const storageEntry = settingsEntry("modelRoleStorage");
		expect(storageEntry.ui.label).toBe("Speicherort der Modellrollen");
		expect(storageEntry.ui.description).toBe("Wo Rollenmodelle gespeichert werden");

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

			expect(settingsEntry("language").ui.description).toBe(
				"Sprache der Oberfläche. $OMP_LANG überschreibt diese Einstellung, solange sie gesetzt ist.",
			);
		} finally {
			if (previous === undefined) delete Bun.env.OMP_LANG;
			else Bun.env.OMP_LANG = previous;
		}
	});
});
