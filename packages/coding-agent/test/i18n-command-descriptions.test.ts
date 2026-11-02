import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import type { SkillsSettings } from "../src/extensibility/settings";
import { registerCatalog, registerCoreCatalogs, resetI18nForTest, setLocale, t } from "../src/i18n";
import { loadUserTranslationCatalogs } from "../src/i18n/user-catalogs";
import { type AvailableCommandsSession, buildAvailableSlashCommands } from "../src/slash-commands/available-commands";
import { resolveDynamicCommandDescription } from "../src/slash-commands/i18n";

afterEach(() => {
	resetI18nForTest();
	registerCoreCatalogs();
});

describe("dynamic command descriptions", () => {
	test("fall back to the inline English copy when no catalog entry exists", () => {
		setLocale("ru");
		expect(resolveDynamicCommandDescription("skill", "demo", "English skill")).toBe("English skill");
		expect(resolveDynamicCommandDescription("command", "demo", "English command")).toBe("English command");
		expect(resolveDynamicCommandDescription("extension", "demo", "English extension")).toBe("English extension");
	});

	test("resolve per source and command name", () => {
		registerCatalog(
			"ru",
			{
				"omp.dynamic.skill.demo.description": "Навык",
				"omp.dynamic.command.demo.description": "Команда",
				"omp.dynamic.extension.demo.description": "Расширение",
			},
			"test",
		);
		setLocale("ru");

		expect(resolveDynamicCommandDescription("skill", "demo", "English")).toBe("Навык");
		expect(resolveDynamicCommandDescription("command", "demo", "English")).toBe("Команда");
		expect(resolveDynamicCommandDescription("extension", "demo", "English")).toBe("Расширение");
		// An unrelated name keeps its fallback.
		expect(resolveDynamicCommandDescription("skill", "other", "English")).toBe("English");
	});

	test("the ACP command list localizes extension, custom, file, and skill descriptions", async () => {
		registerCatalog(
			"ru",
			{
				"omp.dynamic.extension.demo-ext.description": "Расширение",
				"omp.dynamic.command.demo-command.description": "Команда",
				"omp.dynamic.command.file-command.description": "Файловая команда",
				"omp.dynamic.skill.demo-skill.description": "Навык",
			},
			"test",
		);
		setLocale("ru");

		const session = {
			skills: [
				{
					name: "demo-skill",
					description: "English skill",
					filePath: "/tmp/SKILL.md",
					baseDir: "/tmp",
					source: "user",
				},
			],
			skillsSettings: { enableSkillCommands: true } satisfies SkillsSettings,
			customCommands: [
				{
					path: "custom",
					resolvedPath: "/tmp/custom.ts",
					source: "user",
					command: { name: "demo-command", description: "English command", execute: () => undefined },
				},
			],
			extensionRunner: {
				getRegisteredCommands: () => [
					{ name: "demo-ext", description: "English extension", handler: async () => {} },
				],
			},
			sessionManager: { getCwd: () => process.cwd() },
			setSlashCommands: () => {},
		} as unknown as AvailableCommandsSession;

		const commands = await buildAvailableSlashCommands(session, async () => [
			{ name: "file-command", description: "English file", content: "", source: "via test" },
		]);
		const descriptions = new Map(commands.map(command => [command.name, command.description]));

		expect(descriptions.get("demo-ext")).toBe("Расширение");
		expect(descriptions.get("demo-command")).toBe("Команда");
		expect(descriptions.get("file-command")).toBe("Файловая команда");
		expect(descriptions.get("skill:demo-skill")).toBe("Навык");
	});
});

describe("user and project locale catalogs", () => {
	test("load user catalogs, let project entries win, and ignore malformed files", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "omp-user-locales-"));
		const agentDir = path.join(root, "agent");
		const cwd = path.join(root, "project");
		try {
			await Bun.write(
				path.join(agentDir, "locales", "ru.json"),
				JSON.stringify({
					"omp.dynamic.skill.user-skill.description": "Пользовательский навык",
					"omp.dynamic.command.shared.description": "Из пользовательского каталога",
				}),
			);
			await Bun.write(
				path.join(cwd, ".omp", "locales", "ru.json"),
				JSON.stringify({
					"omp.dynamic.command.shared.description": "Из проектного каталога",
					"omp.dynamic.command.project-only.description": "Только проект",
					// Project catalogs must not be able to relabel core UI copy.
					"omp.core.spoofed": "Подмена",
				}),
			);
			await Bun.write(path.join(cwd, ".omp", "locales", "broken.json"), "{not json");

			await loadUserTranslationCatalogs({ agentDir, cwd });
			setLocale("ru");

			expect(t("omp.dynamic.skill.user-skill.description", "fallback")).toBe("Пользовательский навык");
			expect(t("omp.dynamic.command.shared.description", "fallback")).toBe("Из проектного каталога");
			expect(t("omp.dynamic.command.project-only.description", "fallback")).toBe("Только проект");
			expect(t("omp.core.spoofed", "fallback")).toBe("fallback");
			expect(t("omp.dynamic.command.broken.description", "fallback")).toBe("fallback");
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});
