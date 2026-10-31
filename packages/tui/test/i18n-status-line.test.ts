import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { registerCatalog, resetI18nForTest, setLocale } from "@oh-my-pi/pi-utils/i18n";
import { visibleWidth } from "../src/index";
import { renderSegment, type SegmentContext } from "../src/status-line/segments";
import { initTheme } from "../src/theme";

beforeAll(async () => {
	await initTheme();
});

afterEach(() => {
	resetI18nForTest();
});

const ru = {
	"tui.statusLine.plan": "План",
	"tui.statusLine.planPaused": "План (пауза)",
	"tui.statusLine.pausedSuffix": " (пауза)",
	"tui.statusLine.loop": "Цикл",
	"tui.statusLine.loopWaiting": "повтор следующего запроса",
	"tui.statusLine.loopState.running": "выполняется",
	"tui.statusLine.sessionNew": "новая",
};

function context(extra: Partial<SegmentContext>): SegmentContext {
	return { width: 80, options: {}, ...extra } as unknown as SegmentContext;
}

function plain(content: string): string {
	return content.replace(/\x1b\[[0-9;]*m/g, "");
}

describe("status-line locale seam", () => {
	it("renders Russian mode labels and keeps them within the line width", () => {
		registerCatalog("ru", ru, "test");
		setLocale("ru");

		const paused = renderSegment("mode", context({ planMode: { enabled: true, paused: true } }));
		expect(plain(paused.content)).toContain("План");
		expect(plain(paused.content)).not.toContain("Plan");
		expect(visibleWidth(plain(paused.content))).toBeLessThanOrEqual(80);

		const loop = renderSegment("mode", context({ loopMode: { state: "waiting" } }));
		expect(plain(loop.content)).toContain("Цикл");
		expect(plain(loop.content)).toContain("повтор следующего запроса");

		const running = renderSegment("mode", context({ loopMode: { state: "running" } }));
		expect(plain(running.content)).toContain("выполняется");
	});

	it("renders a localized empty-session label", () => {
		registerCatalog("ru", ru, "test");
		setLocale("ru");
		const session = renderSegment("session", context({ session: { sessionManager: {} } as never }));
		expect(plain(session.content)).toContain("новая");
	});

	it("keeps English output when no catalog is active", () => {
		const plan = renderSegment("mode", context({ planMode: { enabled: true, paused: false } }));
		expect(plain(plan.content)).toContain("Plan");
		expect(plain(plan.content)).not.toContain("План");
	});

	it("pseudo-locale expands labels so width regressions surface", () => {
		setLocale("en-XA");
		const pseudo = renderSegment("mode", context({ planMode: { enabled: true, paused: false } }));
		setLocale("en");
		const english = renderSegment("mode", context({ planMode: { enabled: true, paused: false } }));

		expect(plain(pseudo.content)).toContain("⟦");
		expect(visibleWidth(plain(pseudo.content))).toBeGreaterThan(visibleWidth(plain(english.content)));
	});
});
