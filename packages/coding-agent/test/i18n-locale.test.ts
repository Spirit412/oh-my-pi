import { describe, expect, test } from "bun:test";

import { parseArgs } from "../src/cli/args";
import { resolveLocale, validateLocaleTag } from "../src/i18n/locale";

describe("resolveLocale", () => {
	test("CLI wins over every other source", () => {
		expect(resolveLocale({ cli: "RU", configured: "en", test: true })).toBe("ru");
	});

	test("an explicit setting wins over the system locale", () => {
		expect(resolveLocale({ configured: "ru", env: { LANG: "en_US.UTF-8" }, test: false })).toBe("ru");
	});

	test("auto uses the system locale outside tests", () => {
		expect(resolveLocale({ configured: "auto", env: { LANG: "ru_RU.UTF-8" }, test: false })).toBe("ru-ru");
	});

	test("auto is deterministic English in tests", () => {
		expect(resolveLocale({ configured: "auto", env: { LANG: "ru_RU.UTF-8" }, test: true })).toBe("en");
	});

	test("an explicit setting still wins in tests", () => {
		expect(resolveLocale({ configured: "ru", test: true })).toBe("ru");
	});
});

describe("validateLocaleTag", () => {
	test("accepts auto and normalizes tags", () => {
		expect(validateLocaleTag("auto")).toBe("auto");
		expect(validateLocaleTag("ru_RU")).toBe("ru-ru");
		expect(validateLocaleTag("EN")).toBe("en");
	});

	test("rejects empty and malformed tags", () => {
		expect(() => validateLocaleTag("")).toThrow();
		expect(() => validateLocaleTag("not a locale!")).toThrow();
	});
});

describe("--lang", () => {
	test("parses and normalizes a locale tag", () => {
		expect(parseArgs(["--lang", "RU"]).lang).toBe("ru");
		expect(parseArgs(["--lang=ru_RU"]).lang).toBe("ru-ru");
	});

	test("rejects malformed tags", () => {
		expect(() => parseArgs(["--lang", "not a locale!"])).toThrow();
	});
});
