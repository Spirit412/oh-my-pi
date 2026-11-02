import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { normalizeDashboardLocale, resolveDashboardLocale } from "../src/locale";

const tempDirs: string[] = [];

async function makeConfigDir(contents: string, filename = "config.yml"): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omp-stats-locale-"));
	tempDirs.push(dir);
	await fs.writeFile(path.join(dir, filename), contents);
	return dir;
}

/** Env without any locale variables, so host settings never leak in. */
function cleanEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = { ...overrides };
	delete env.LC_ALL;
	delete env.LC_MESSAGES;
	delete env.LANG;
	delete env.OMP_LANG;
	return env;
}

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true })));
});

describe("resolveDashboardLocale", () => {
	it("prefers OMP_LANG over the config file", async () => {
		const dir = await makeConfigDir("language: en\n");
		expect(await resolveDashboardLocale(cleanEnv({ OMP_LANG: "ru" }), dir)).toBe("ru");
	});

	it("reads a regional/encoded tag from config.yml", async () => {
		const dir = await makeConfigDir("language: ru_RU.UTF-8\n");
		expect(await resolveDashboardLocale(cleanEnv(), dir)).toBe("ru");
	});

	it("reads the legacy config.yaml filename too", async () => {
		const dir = await makeConfigDir("language: ru\n", "config.yaml");
		expect(await resolveDashboardLocale(cleanEnv(), dir)).toBe("ru");
	});

	it("treats auto and missing keys as unset and falls back to English", async () => {
		const autoDir = await makeConfigDir("language: auto\n");
		expect(await resolveDashboardLocale(cleanEnv(), autoDir)).toBe("en");
		const emptyDir = await makeConfigDir("other: 1\n");
		expect(await resolveDashboardLocale(cleanEnv(), emptyDir)).toBe("en");
	});

	it("falls back to the system locale when the setting is auto", async () => {
		const dir = await makeConfigDir("language: auto\n");
		expect(await resolveDashboardLocale(cleanEnv({ LC_ALL: "ru_RU.UTF-8" }), dir)).toBe("ru");
	});

	it("maps unsupported tags to English", async () => {
		const dir = await makeConfigDir("language: fr\n");
		expect(await resolveDashboardLocale(cleanEnv(), dir)).toBe("en");
	});

	it("returns English when no config file exists", async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omp-stats-locale-empty-"));
		tempDirs.push(dir);
		expect(await resolveDashboardLocale(cleanEnv(), dir)).toBe("en");
	});
});

describe("normalizeDashboardLocale", () => {
	it("keeps Russian and defaults everything else to English", () => {
		expect(normalizeDashboardLocale("ru")).toBe("ru");
		expect(normalizeDashboardLocale("ru-RU")).toBe("ru");
		expect(normalizeDashboardLocale("en")).toBe("en");
		expect(normalizeDashboardLocale("pt-BR")).toBe("en");
		expect(normalizeDashboardLocale(undefined)).toBe("en");
	});
});
