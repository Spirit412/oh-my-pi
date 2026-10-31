import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { approvalChoiceLabels, approvalOnceLabel, truncateForPrompt } from "../src/tools/approval";
import { registerCoreCatalogs, resetI18nForTest, setLocale } from "../src/i18n";

beforeEach(() => {
	registerCoreCatalogs();
	setLocale("ru");
});

afterEach(() => resetI18nForTest());

describe("Russian approval labels", () => {
	test("approve labels switch with the active locale", () => {
		expect(approvalOnceLabel({})).toBe("Разрешить");
		expect(approvalOnceLabel({ grants: [{ scope: "target", label: "x", alwaysLabel: "y" }] })).toBe(
			"Разрешить один раз",
		);
	});

	test("choice labels keep the deny and session entries translated", () => {
		expect(approvalChoiceLabels({ grants: [], session: "Разрешить bash на эту сессию" })).toEqual([
			"Разрешить",
			"Разрешить bash на эту сессию",
			"Отклонить",
		]);
	});

	test("the elision marker is translated", () => {
		expect(truncateForPrompt("abcdef", 3)).toBe("abc[…3 симв. скрыто…]");
	});
});
