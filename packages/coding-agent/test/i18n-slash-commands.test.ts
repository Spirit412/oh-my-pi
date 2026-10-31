import { afterEach, describe, expect, test } from "bun:test";
import { hasTranslation, registerCatalog, registerCoreCatalogs, resetI18nForTest, setLocale } from "../src/i18n";
import { buildAvailableSlashCommands } from "../src/slash-commands/available-commands";
import { BUILTIN_SLASH_COMMANDS_INTERNAL, BUILTIN_SLASH_COMMAND_DEFS } from "../src/slash-commands/builtin-registry";
import {
	acpCommandDescriptionKey,
	commandDescriptionKey,
	subcommandDescriptionKey,
} from "../src/slash-commands/i18n";

function commandDef(name: string) {
	const def = BUILTIN_SLASH_COMMAND_DEFS.find(command => command.name === name);
	if (!def) throw new Error(`missing builtin command: ${name}`);
	return def;
}

function subcommandDef(commandName: string, subcommandName: string) {
	const subcommand = commandDef(commandName).subcommands?.find(entry => entry.name === subcommandName);
	if (!subcommand) throw new Error(`missing subcommand: ${commandName} ${subcommandName}`);
	return subcommand;
}

afterEach(() => {
	resetI18nForTest();
	registerCoreCatalogs();
});

describe("builtin slash-command descriptions", () => {
	test("English fallbacks are unchanged when no catalog covers the key", () => {
		expect(commandDef("model").description).toBe("Switch model for this session");
		expect(subcommandDef("goal", "set").description).toBe("Set or replace the goal");
	});

	test("descriptions resolve through the ambient locale at read time", () => {
		registerCatalog(
			"de",
			{
				"omp.slash.model.description": "Modell für diese Sitzung wechseln",
				"omp.slash.goal.sub.set.description": "Ziel setzen oder ersetzen",
			},
			"test",
		);
		setLocale("de");

		expect(commandDef("model").description).toBe("Modell für diese Sitzung wechseln");
		expect(subcommandDef("goal", "set").description).toBe("Ziel setzen oder ersetzen");

		setLocale("en");
		expect(commandDef("model").description).toBe("Switch model for this session");
	});

	test("ACP metadata localizes copy while keeping ids, usage, and hints", async () => {
		registerCatalog(
			"de",
			{
				"omp.slash.model.acpDescription": "Aktuelle Modellauswahl anzeigen",
				"omp.slash.usage.sub.show.description": "Nutzungslimits des Anbieters anzeigen",
			},
			"test",
		);
		setLocale("de");

		const commands = await buildAvailableSlashCommands(
			{
				customCommands: [],
				skills: [],
				sessionManager: { getCwd: () => process.cwd() },
				setSlashCommands() {},
			} as never,
			async () => [],
		);
		const byName = Object.fromEntries(commands.map(command => [command.name, command]));

		expect(byName.model.description).toBe("Aktuelle Modellauswahl anzeigen");
		expect(byName.usage.subcommands).toContainEqual({
			name: "show",
			description: "Nutzungslimits des Anbieters anzeigen",
		});
		// Untranslated keys keep their inline English fallback and usage syntax.
		expect(byName.usage.subcommands).toContainEqual({
			name: "reset",
			description: "Spend a saved provider rate-limit reset",
			usage: "[provider/credential-id|provider/active]",
		});
	});
});

describe("bundled Russian catalog", () => {
	test("covers every builtin command, subcommand, and ACP override", () => {
		for (const command of BUILTIN_SLASH_COMMAND_DEFS) {
			expect(hasTranslation(commandDescriptionKey(command.name), "ru")).toBe(true);
			for (const subcommand of command.subcommands ?? []) {
				expect(hasTranslation(subcommandDescriptionKey(command.name, subcommand.name), "ru")).toBe(true);
			}
		}
		for (const command of BUILTIN_SLASH_COMMANDS_INTERNAL) {
			if (!command.acpDescription) continue;
			expect(hasTranslation(acpCommandDescriptionKey(command.name), "ru")).toBe(true);
		}
	});

	test("feeds the live registry and the ACP palette", async () => {
		setLocale("ru");
		expect(commandDef("settings").description).toBe("Открыть меню настроек");

		const commands = await buildAvailableSlashCommands(
			{
				customCommands: [],
				skills: [],
				sessionManager: { getCwd: () => process.cwd() },
				setSlashCommands() {},
			} as never,
			async () => [],
		);
		const byName = Object.fromEntries(commands.map(command => [command.name, command]));
		expect(byName.model.description).toBe("Показать текущий выбор модели");
	});
});

describe("dynamic autocomplete copy", () => {
	function liveDescription(name: string, runtime: unknown): string | undefined {
		const command = BUILTIN_SLASH_COMMANDS_INTERNAL.find(entry => entry.name === name);
		return command?.getTuiAutocompleteDescription?.(runtime as never);
	}

	const forceRuntime = { ctx: { session: { getActiveToolNames: () => ["read", "edit"] } } };
	const todoRuntime = {
		ctx: {
			todoPhases: [
				{
					tasks: [
						{ status: "pending" },
						{ status: "in_progress" },
						{ status: "completed" },
					],
				},
			],
		},
	};

	test("English output is unchanged by default", () => {
		expect(liveDescription("force", forceRuntime)).toBe("Force: 2 active tools");
		expect(liveDescription("todo", todoRuntime)).toBe("Todos: 2 open (1 in progress, 1 done)");
	});

	test("Russian catalog drives plural state labels", () => {
		setLocale("ru");
		expect(liveDescription("force", forceRuntime)).toBe("Принудительно: 2 активных инструмента");
		expect(liveDescription("todo", todoRuntime)).toBe("Задачи: открыты 2 (1 в работе, 1 выполнено)");
		expect(
			liveDescription("model", {
				ctx: { viewSession: { model: undefined } },
			}),
		).toBe("Модель: не выбрана");
	});

	test("missing runtime state falls back to localized empty labels", () => {
		setLocale("ru");
		expect(
			liveDescription("jobs", {
				ctx: { session: { getAsyncJobSnapshot: () => undefined } },
			}),
		).toBe("Фоновые задачи: нет");
	});
});
