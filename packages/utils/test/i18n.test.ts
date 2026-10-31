import { afterEach, describe, expect, test } from "bun:test";

import {
	formatMessage,
	getLocale,
	hasTranslation,
	normalizeLocale,
	registerCatalog,
	resetI18nForTest,
	setLocale,
	t,
} from "../src/i18n";

afterEach(() => resetI18nForTest());

describe("normalizeLocale", () => {
	test("normalizes POSIX spellings and canonicalizes tags", () => {
		expect(normalizeLocale("ru_RU.UTF-8")).toBe("ru-ru");
		expect(normalizeLocale("EN")).toBe("en");
		expect(normalizeLocale("C")).toBe("en");
		expect(normalizeLocale(undefined)).toBe("en");
	});
});

describe("t", () => {
	test("uses the English fallback and fills placeholders", () => {
		expect(t("greeting", "Hello, {name}!", { name: "Ada" })).toBe("Hello, Ada!");
	});

	test("prefers the active locale and falls back per key", () => {
		registerCatalog("ru", { greeting: "Привет, {name}!" }, "test");
		setLocale("ru");
		expect(t("greeting", "Hello, {name}!", { name: "Ada" })).toBe("Привет, Ada!");
		expect(t("missing", "Hello")).toBe("Hello");
	});

	test("selects Russian plural categories", () => {
		const message = {
			one: "{count} файл",
			few: "{count} файла",
			many: "{count} файлов",
			other: "{count} файла",
		};
		registerCatalog("ru", { files: message }, "test");
		setLocale("ru");
		expect(t("files", message, { count: 1 })).toBe("1 файл");
		expect(t("files", message, { count: 2 })).toBe("2 файла");
		expect(t("files", message, { count: 5 })).toBe("5 файлов");
		expect(t("files", message, { count: 21 })).toBe("21 файл");
	});

	test("formats a message without a lookup", () => {
		expect(formatMessage({ one: "{count} item", other: "{count} items" }, { count: 1 }, "en")).toBe("1 item");
		expect(formatMessage({ one: "{count} item", other: "{count} items" }, { count: 3 }, "en")).toBe("3 items");
	});
});

describe("registration", () => {
	test("later sources win and a disposer restores the previous source", () => {
		registerCatalog("ru", { key: "база" }, "base");
		setLocale("ru");
		expect(t("key", "fallback")).toBe("база");
		const disposeOverride = registerCatalog("ru", { key: "переопределение" }, "plugin");
		expect(t("key", "fallback")).toBe("переопределение");
		disposeOverride();
		expect(t("key", "fallback")).toBe("база");
		resetI18nForTest();
		expect(t("key", "fallback")).toBe("fallback");
	});

	test("hasTranslation and available locales reflect registration", () => {
		registerCatalog("ru", { key: "значение" }, "test");
		expect(hasTranslation("key", "ru")).toBe(true);
		expect(hasTranslation("missing", "ru")).toBe(false);
		expect(getLocale()).toBe("en");
	});
});
