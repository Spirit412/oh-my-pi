import { afterEach, describe, expect, test } from "bun:test";
import { renderCommandHelp } from "@oh-my-pi/pi-utils/cli";
import { commands } from "../src/cli-commands";
import { launchHelp } from "../src/commands/launch-help";
import { hasTranslation, registerCoreCatalogs, resetI18nForTest, setLocale, t } from "../src/i18n";

afterEach(() => {
	resetI18nForTest();
	registerCoreCatalogs();
});

function renderHelp(id: string, command: unknown): string {
	const chunks: string[] = [];
	const original = process.stdout.write.bind(process.stdout);
	process.stdout.write = ((chunk: string | Uint8Array) => {
		chunks.push(String(chunk));
		return true;
	}) as typeof process.stdout.write;
	try {
		renderCommandHelp("omp", id, command as never);
	} finally {
		process.stdout.write = original;
	}
	return chunks.join("");
}

describe("bundled Russian CLI catalog", () => {
	test("covers subcommand descriptions and launch flag/argument copy", () => {
		for (const entry of commands) {
			if (entry.help?.description) {
				expect(hasTranslation(`omp.cli.command.${entry.name}.description`, "ru")).toBe(true);
			}
		}
		for (const [name, flag] of Object.entries(launchHelp.flags ?? {})) {
			if (flag.description) {
				expect(hasTranslation(`omp.cli.command.default.flag.${name}.description`, "ru")).toBe(true);
			}
		}
		for (const [name, arg] of Object.entries(launchHelp.args ?? {})) {
			if (arg.description) {
				expect(hasTranslation(`omp.cli.command.default.arg.${name}.description`, "ru")).toBe(true);
			}
		}
	});

	test("covers every subcommand flag and argument description", async () => {
		for (const entry of commands) {
			if (entry.name === "launch") continue;
			const Cmd = await entry.load();
			for (const [name, flag] of Object.entries(Cmd.flags ?? {})) {
				if (flag.description) {
					expect(hasTranslation(`omp.cli.command.${entry.name}.flag.${name}.description`, "ru")).toBe(true);
				}
			}
			for (const [name, arg] of Object.entries(Cmd.args ?? {})) {
				if (arg.description) {
					expect(hasTranslation(`omp.cli.command.${entry.name}.arg.${name}.description`, "ru")).toBe(true);
				}
			}
		}
	});

	test("renderCommandHelp localizes headers, command copy, and fallbacks", () => {
		setLocale("ru");
		const output = renderHelp("acp", {
			description: "Run omp as an ACP (Agent Client Protocol) server over stdio",
			args: {},
			flags: { verbose: { kind: "boolean", description: "Verbose output" } },
		});

		expect(output).toContain(t("omp.cli.section.usage", "USAGE"));
		expect(output).toContain("ИСПОЛЬЗОВАНИЕ");
		expect(output).toContain("ФЛАГИ");
		expect(output).toContain(t("omp.cli.command.acp.description", ""));
		expect(output).not.toContain("Run omp as an ACP (Agent Client Protocol) server over stdio");
		// Unknown keys keep the inline English fallback.
		expect(output).toContain("Verbose output");
	});
});
