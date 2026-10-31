import { afterEach, describe, expect, test } from "bun:test";
import { contextCategoryLabel, contextCategoryDescriptor } from "@oh-my-pi/pi-tui/chrome/context-view-model";
import { sanitizeErrorLine } from "@oh-my-pi/pi-tui/chrome/error-block";
import { hasTranslation, registerCoreCatalogs, resetI18nForTest, setLocale, t } from "../src/i18n";

afterEach(() => {
	resetI18nForTest();
	registerCoreCatalogs();
});

describe("bundled Russian TUI catalog", () => {
	test("covers status-line, context, and chrome copy", () => {
		for (const key of [
			"tui.statusLine.goal",
			"tui.statusLine.planPaused",
			"tui.statusLine.loopState.running",
			"tui.statusLine.contextUsed",
			"tui.statusLine.sessionCost",
			"tui.contextUsage.systemPrompt",
			"tui.contextView.built-in-tools.label",
			"tui.chrome.unknownError",
			"tui.chrome.warning",
		]) {
			expect(hasTranslation(key, "ru")).toBe(true);
		}
	});

	test("feeds the live status-line, context view, and error fallbacks", () => {
		setLocale("ru");

		expect(t("tui.statusLine.contextUsed", "Context {percent}% used", { percent: 42 })).toBe("Контекст занят на 42%");
		expect(t("tui.statusLine.contextTokens", "{tokens} of {window} tokens", { tokens: "1k", window: "8k" })).toBe(
			"1k из 8k токенов",
		);

		expect(contextCategoryLabel("built-in-tools")).toBe("Встроенные инструменты");
		expect(contextCategoryDescriptor("system-prompt").overviewLabel).toBe("Системный промпт (без навыков)");

		expect(sanitizeErrorLine("", 40)).toBe("Неизвестная ошибка");
	});
});
