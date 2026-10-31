import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { registerCatalog, resetI18nForTest, setLocale } from "@oh-my-pi/pi-utils/i18n";
import { PluginSelectorComponent } from "../src/overlays/plugin-selector";
import { initTheme } from "../src/theme";

beforeAll(async () => {
	await initTheme();
});

afterEach(() => {
	resetI18nForTest();
});

const plugin = {
	plugin: { name: "acme-plugin", version: "1.0.0", description: "Test plugin" },
	marketplace: "main",
};

function render(): string {
	const selector = new PluginSelectorComponent(1, [plugin], new Set(), {
		onSelect: () => {},
		onCancel: () => {},
	});
	return selector
		.render(80)
		.join("\n")
		.replace(/\x1b\[[0-9;]*m/g, "");
}

describe("plugin picker localization", () => {
	it("renders the plugin catalog description when present", () => {
		registerCatalog("ru", { "plugin.acme-plugin.description": "Плагин для тестов" }, "test");
		setLocale("ru");
		const output = render();
		expect(output).toContain("Плагин для тестов");
		expect(output).not.toContain("Test plugin");
	});

	it("falls back to the manifest description without a catalog", () => {
		expect(render()).toContain("Test plugin");
	});
});
