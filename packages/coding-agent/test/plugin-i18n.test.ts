import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { loadPluginTranslationCatalogs } from "@oh-my-pi/pi-coding-agent/extensibility/plugins/loader";
import { registerCoreCatalogs, resetI18nForTest, setLocale, t } from "../src/i18n";

const homes: string[] = [];

afterEach(async () => {
	resetI18nForTest();
	registerCoreCatalogs();
	for (const home of homes.splice(0)) await fs.rm(home, { recursive: true, force: true });
});

async function createHome(
	plugins: Record<string, { manifest: Record<string, unknown>; locales?: Record<string, unknown> }>,
): Promise<string> {
	const home = await fs.mkdtemp(path.join(os.tmpdir(), "omp-plugin-i18n-"));
	homes.push(home);
	const root = path.join(home, ".omp", "plugins");
	const dependencies: Record<string, string> = {};
	for (const [name, plugin] of Object.entries(plugins)) {
		dependencies[name] = "1.0.0";
		const dir = path.join(root, "node_modules", name);
		await fs.mkdir(dir, { recursive: true });
		await Bun.write(path.join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", omp: plugin.manifest }));
		if (plugin.locales) {
			await fs.mkdir(path.join(dir, "locales"), { recursive: true });
			for (const [file, content] of Object.entries(plugin.locales)) {
				await Bun.write(
					path.join(dir, "locales", file),
					typeof content === "string" ? content : JSON.stringify(content),
				);
			}
		}
	}
	await Bun.write(path.join(root, "package.json"), JSON.stringify({ dependencies }));
	return home;
}

describe("plugin translation catalogs", () => {
	test("registers prefixed keys from the manifest locale files", async () => {
		const home = await createHome({
			"acme-i18n-plugin": {
				manifest: { locales: { ru: "./locales/ru.json" } },
				locales: {
					"ru.json": {
						greeting: "Привет",
						"plugin.acme-i18n-plugin.prefixed": "Уже с префиксом",
					},
				},
			},
		});

		await loadPluginTranslationCatalogs(home, { home });
		setLocale("ru");

		expect(t("plugin.acme-i18n-plugin.greeting", "Hello")).toBe("Привет");
		// Keys that already carry the prefix are not prefixed twice.
		expect(t("plugin.acme-i18n-plugin.prefixed", "fallback")).toBe("Уже с префиксом");
	});

	test("ignores malformed, escaping, and oversized catalogs", async () => {
		const oversized: Record<string, string> = {};
		for (let index = 0; index < 5001; index += 1) oversized[`key${index}`] = `value ${index}`;
		const home = await createHome({
			"bad-plugin": {
				manifest: { locales: { ru: "./locales/ru.json" } },
				locales: { "ru.json": { greeting: 42 } },
			},
			"escape-plugin": {
				manifest: { locales: { ru: "../outside.json" } },
			},
			"huge-plugin": {
				manifest: { locales: { ru: "./locales/ru.json" } },
				locales: { "ru.json": oversized },
			},
		});

		await loadPluginTranslationCatalogs(home, { home });
		setLocale("ru");

		expect(t("plugin.bad-plugin.greeting", "Hello")).toBe("Hello");
		expect(t("plugin.escape-plugin.greeting", "Hello")).toBe("Hello");
		expect(t("plugin.huge-plugin.key0", "fallback")).toBe("fallback");
	});

	test("re-reading the installed tree picks up catalog updates", async () => {
		const home = await createHome({
			"reload-plugin": {
				manifest: { locales: { ru: "./locales/ru.json" } },
				locales: { "ru.json": { greeting: "Старое" } },
			},
		});
		await loadPluginTranslationCatalogs(home, { home });
		setLocale("ru");
		expect(t("plugin.reload-plugin.greeting", "Hello")).toBe("Старое");

		await Bun.write(
			path.join(home, ".omp", "plugins", "node_modules", "reload-plugin", "locales", "ru.json"),
			JSON.stringify({ greeting: "Новое" }),
		);
		await loadPluginTranslationCatalogs(home, { home });
		expect(t("plugin.reload-plugin.greeting", "Hello")).toBe("Новое");
	});
});
