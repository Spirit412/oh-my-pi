import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { findSourceCheckoutRoot, resolveInstallerCheckout } from "../src/cli/update-cli";

const roots: string[] = [];
const previousSourceDir = Bun.env.PI_SOURCE_DIR;

afterEach(async () => {
	if (previousSourceDir === undefined) delete Bun.env.PI_SOURCE_DIR;
	else Bun.env.PI_SOURCE_DIR = previousSourceDir;
	for (const root of roots.splice(0)) await fs.rm(root, { recursive: true, force: true });
});

async function makeCheckout(): Promise<string> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "omp-update-source-"));
	roots.push(root);
	await fs.mkdir(path.join(root, ".git"), { recursive: true });
	await fs.mkdir(path.join(root, "packages", "coding-agent"), { recursive: true });
	await Bun.write(path.join(root, "packages", "coding-agent", "package.json"), JSON.stringify({ name: "x" }));
	return root;
}

describe("source checkout detection", () => {
	test("walks up from the running script to the repository root", async () => {
		const root = await makeCheckout();
		expect(findSourceCheckoutRoot(path.join(root, "packages", "coding-agent", "src", "cli"))).toBe(root);
		expect(findSourceCheckoutRoot(path.join(root, "packages"))).toBe(root);
	});

	test("rejects a directory tree without the coding-agent checkout", async () => {
		const empty = await fs.mkdtemp(path.join(os.tmpdir(), "omp-update-empty-"));
		roots.push(empty);
		expect(findSourceCheckoutRoot(empty)).toBeUndefined();
	});

	test("only the installer checkout updates in place", async () => {
		const root = await makeCheckout();
		const nested = path.join(root, "packages", "coding-agent");

		Bun.env.PI_SOURCE_DIR = path.join(root, "elsewhere");
		expect(resolveInstallerCheckout(nested)).toBeUndefined();

		Bun.env.PI_SOURCE_DIR = root;
		expect(resolveInstallerCheckout(nested)).toBe(root);
	});
});
