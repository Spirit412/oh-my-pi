import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as vcs from "@oh-my-pi/pi-natives/vcs";
import { restoreSourceBuildArtifacts } from "../src/cli/update-cli";

const roots: string[] = [];

afterEach(async () => {
	await Promise.all(roots.splice(0).map(root => fs.rm(root, { force: true, recursive: true })));
});

async function git(cwd: string, ...args: string[]): Promise<string> {
	const process = Bun.spawn(["git", ...args], { cwd, stderr: "pipe", stdout: "pipe" });
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process.stdout).text(),
		new Response(process.stderr).text(),
		process.exited,
	]);
	if (exitCode !== 0) throw new Error(stderr);
	return stdout.trimEnd();
}

async function repository(): Promise<string> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "omp-update-artifacts-"));
	roots.push(root);
	await git(root, "init", "-b", "main");
	await git(root, "config", "user.name", "Update Test");
	await git(root, "config", "user.email", "update@example.test");
	const artifactDir = path.join(root, "packages", "coding-agent", "src", "export", "html");
	await fs.mkdir(artifactDir, { recursive: true });
	await Bun.write(path.join(artifactDir, "viewer.generated.json"), '{"version":1}\n');
	await Bun.write(path.join(root, "user.txt"), "one\n");
	await git(root, "add", "-A");
	await git(root, "commit", "-m", "initial");
	return root;
}

describe("source update build artifacts", () => {
	test("restores generated artifacts and keeps user edits dirty", async () => {
		const root = await repository();
		const artifact = path.join(root, "packages", "coding-agent", "src", "export", "html", "viewer.generated.json");
		await Bun.write(artifact, '{"version":2}\n');
		await Bun.write(path.join(root, "user.txt"), "two\n");

		const repo = vcs.git(root);
		if (!repo) throw new Error("git repository not found");

		expect(await restoreSourceBuildArtifacts(repo)).toBe(true);
		expect(await Bun.file(artifact).text()).toBe('{"version":1}\n');
		// The user's edit still blocks a non-forced update.
		expect(await repo.isDirty()).toBe(true);

		await git(root, "restore", "user.txt");
		expect(await restoreSourceBuildArtifacts(repo)).toBe(false);
		expect(await repo.isDirty()).toBe(false);
	});
});
