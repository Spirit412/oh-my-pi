import { describe, expect, it } from "bun:test";
import { enMessages, ruMessages, t } from "../src/client/i18n";
import type { PluralForms } from "../src/client/i18n";

function isPlural(entry: unknown): entry is PluralForms {
	return typeof entry === "object" && entry !== null;
}

describe("i18n dictionaries", () => {
	it("have identical key sets in en and ru — a missing key would render raw text in one locale", () => {
		const enKeys = Object.keys(enMessages).sort();
		const ruKeys = Object.keys(ruMessages).sort();
		expect(ruKeys).toEqual(enKeys);
	});

	it("give every plural entry the forms its locale's CLDR rule selects — ru needs few/many, en never does", () => {
		for (const [key, enEntry] of Object.entries(enMessages)) {
			const ruEntry = ruMessages[key];
			if (!isPlural(enEntry)) {
				expect(isPlural(ruEntry), `key ${key}: pluralness differs between locales`).toBe(false);
				continue;
			}
			expect(enEntry.one, `key ${key}: en one`).toBeTruthy();
			expect(enEntry.other, `key ${key}: en other`).toBeTruthy();
			expect(enEntry.few, `key ${key}: en must not carry few`).toBeUndefined();
			expect(enEntry.many, `key ${key}: en must not carry many`).toBeUndefined();
			expect(isPlural(ruEntry), `key ${key}: ru must be plural too`).toBe(true);
			if (isPlural(ruEntry)) {
				expect(ruEntry.few, `key ${key}: ru few`).toBeTruthy();
				expect(ruEntry.many, `key ${key}: ru many`).toBeTruthy();
			}
		}
	});

	it("keep the Russian tool-failure counter in sync with its English twin", () => {
		// Regression contract: the failures stat tile renders these forms verbatim;
		// if the en/ru plural shapes drift, one locale shows a raw key.
		const en = enMessages["tools.stat.callsFailed"];
		const ru = ruMessages["tools.stat.callsFailed"];
		expect(isPlural(en) && isPlural(ru)).toBe(true);
		if (isPlural(en) && isPlural(ru)) {
			expect(en.one).toBe("{count} failed");
			expect(ru.one).toBe("{count} сбой");
			expect(ru.few).toBe("{count} сбоя");
			expect(ru.many).toBe("{count} сбоев");
		}
	});

	it("interpolates {count} in plain-string entries (test env boots as en)", () => {
		// No window in bun test, so bootLocale() is en and this is deterministic.
		expect(t("live.hoursLeft", { count: 3 })).toBe("3h left");
		expect(t("live.hoursLeft")).toBe("{count}h left");
	});

	it("keeps tool-call source labels present in both locales — RequestDrawer/Tools render them per row", () => {
		for (const key of ["source.mcp", "source.skill", "source.script", "source.builtin", "source.unknownServer", "source.unnamed", "source.inline"]) {
			expect(typeof enMessages[key]).toBe("string");
			expect(typeof ruMessages[key]).toBe("string");
		}
	});
});

