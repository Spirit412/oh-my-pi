import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

// install.sh binary mode against a fake build service. The host is faked as
// musl Linux x64 by shadowing uname/ldd via PATH; MSYS sh on Windows prepends
// /usr/bin, so the stubs never win there.

const repoRoot = path.join(import.meta.dir, "..");
const BINARY = '#!/bin/sh\necho "omp/1.0.0"\n';
const cleanups: (() => Promise<void> | void)[] = [];

afterEach(async () => {
	for (const cleanup of cleanups.splice(0)) await cleanup();
});

function sha256(text: string): string {
	return new Bun.CryptoHasher("sha256").update(text).digest("hex");
}

/**
 * A build service answering every update check with version 1.0.0 of
 * `omp-linux-musl-x64`, whose `file` object carries `fileSha256`. Every other
 * sha256 in the answer (other targets in `build.files[]`, the patch, a JSON
 * snippet in the notes) is wrong, and the `download` URL holds a `\u0026`
 * escape the way Go's encoder writes presigned URLs.
 */
function startService(fileSha256: string): { url: string; requests: string[] } {
	const requests: string[] = [];
	const server = Bun.serve({
		port: 0,
		fetch(request) {
			const url = new URL(request.url);
			requests.push(url.pathname + url.search);
			if (url.pathname === "/dl/omp-linux-musl-x64") {
				return url.searchParams.get("b") === "2"
					? new Response(BINARY)
					: new Response("bad query", { status: 403 });
			}
			if (!url.pathname.startsWith("/api/products/omp/"))
				return Response.json({ error: "no_build" }, { status: 404 });
			const decoy = "0".repeat(64);
			const answer = {
				build: {
					id: "20261010-171748-fa5ff4a",
					product: "omp",
					version: "1.0.0",
					channel: "stable",
					notes: `Answers look like {"file":{"sha256":"${decoy}"},"version":"9.9.9"}`,
					files: [
						{
							name: "omp-linux-x64",
							platform: "linux",
							arch: "x86_64",
							sha256: decoy,
						},
						{
							name: "omp-linux-musl-x64",
							platform: "linux-musl",
							arch: "x86_64",
							sha256: decoy,
						},
					],
				},
				file: {
					name: "omp-linux-musl-x64",
					platform: "linux-musl",
					arch: "x86_64",
					kind: "archive",
					size: BINARY.length,
					sha256: fileSha256,
					url: "/d/omp/20261010-171748-fa5ff4a/omp-linux-musl-x64",
				},
				download: `${server.url.origin}/dl/omp-linux-musl-x64?a=1&b=2`,
				patch: {
					format: "file",
					from: "20261009-000000-0000000",
					from_sha256: decoy,
					size: 1,
					sha256: "f".repeat(64),
					url: `${server.url.origin}/patch`,
				},
			};
			return new Response(JSON.stringify(answer).replaceAll("&", "\\u0026"), {
				headers: { "Content-Type": "application/json" },
			});
		},
	});
	cleanups.push(() => server.stop(true));
	// Trailing slashes on PI_BUILD_URL are trimmed.
	return { url: `${server.url.origin}/`, requests };
}

async function writeExecutable(file: string, content: string): Promise<void> {
	await Bun.write(file, content);
	await fs.chmod(file, 0o755);
}

async function runInstall(
	buildUrl: string,
	args: string[],
): Promise<{
	exitCode: number;
	stdout: string;
	stderr: string;
	installDir: string;
}> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omp-install-"));
	cleanups.push(() => fs.rm(dir, { recursive: true, force: true }));
	const binDir = path.join(dir, "bin");
	const installDir = path.join(dir, "install");
	await writeExecutable(path.join(binDir, "uname"), '#!/bin/sh\n[ "$1" = "-s" ] && echo Linux || echo x86_64\n');
	await writeExecutable(path.join(binDir, "ldd"), "#!/bin/sh\necho 'musl libc (x86_64)'\n");
	const proc = Bun.spawn(["sh", "scripts/install.sh", ...args], {
		cwd: repoRoot,
		env: {
			...process.env,
			PATH: `${binDir}:${process.env.PATH ?? ""}`,
			HOME: dir,
			PI_INSTALL_DIR: installDir,
			PI_BUILD_URL: buildUrl,
		},
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		proc.exited,
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	return { exitCode, stdout, stderr, installDir };
}

/**
 * A source install with stubbed tooling: `bun` answers the installer's probes
 * and creates the global shim on `link`, `git clone` lays down the checkout
 * layout, and `cargo` only has to exist. Nothing is built, so the assertions
 * cover the installer's own linking and PATH handling. PATH holds only the
 * stubs and /usr/bin:/bin, never the host's real omp, so the resolution checks
 * cannot see an unrelated install.
 */
async function runSourceInstall(options: {
	installDirOnPath: boolean;
	bunBinOnPath?: boolean;
	staleBinary?: boolean;
}): Promise<{
	exitCode: number;
	stdout: string;
	stderr: string;
	installDir: string;
	env: NodeJS.ProcessEnv;
}> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omp-source-install-"));
	cleanups.push(() => fs.rm(dir, { recursive: true, force: true }));
	const binDir = path.join(dir, "bin");
	const bunBinDir = path.join(dir, "bun-bin");
	const installDir = path.join(dir, "install");
	const home = path.join(dir, "home");
	await Promise.all([fs.mkdir(binDir), fs.mkdir(bunBinDir), fs.mkdir(installDir), fs.mkdir(home)]);
	await writeExecutable(
		path.join(binDir, "bun"),
		`#!/bin/sh
case "$1" in
	--version) echo "1.4.4" ;;
	-e) printf '%s' "${process.arch}" ;;
	pm) echo "${bunBinDir}" ;;
	link) printf '#!/bin/sh\\necho "omp/18.14.3"\\n' > "${bunBinDir}/omp"; chmod +x "${bunBinDir}/omp" ;;
esac
exit 0
`,
	);
	await writeExecutable(
		path.join(binDir, "git"),
		`#!/bin/sh
if [ "$1" = "clone" ]; then
	for last; do :; done
	mkdir -p "$last/packages/coding-agent"
fi
exit 0
`,
	);
	await writeExecutable(path.join(binDir, "cargo"), "#!/bin/sh\nexit 0\n");
	if (options.staleBinary) {
		await writeExecutable(path.join(installDir, "omp"), '#!/bin/sh\necho "omp/17.1.3"\n');
	}
	const pathParts = [
		...(options.installDirOnPath ? [installDir] : []),
		...(options.bunBinOnPath ? [bunBinDir] : []),
		binDir,
		"/usr/bin",
		"/bin",
	];
	const env = {
		...process.env,
		HOME: home,
		PATH: pathParts.join(":"),
		PI_INSTALL_DIR: installDir,
		PI_SOURCE_DIR: path.join(dir, "source"),
	};
	const proc = Bun.spawn(["sh", "scripts/install.sh", "--source"], {
		cwd: repoRoot,
		env,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		proc.exited,
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	return { exitCode, stdout, stderr, installDir, env };
}

describe.skipIf(process.platform === "win32")("install.sh source mode", () => {
	test("exposes omp through PI_INSTALL_DIR when bun's global bin is off PATH", async () => {
		const result = await runSourceInstall({ installDirOnPath: true });

		expect(result.exitCode, result.stdout + result.stderr).toBe(0);
		expect((await fs.lstat(path.join(result.installDir, "omp"))).isSymbolicLink()).toBe(true);
		const probe = Bun.spawnSync(["sh", "-c", "command -v omp && omp --version"], { env: result.env });
		expect(probe.stdout.toString().trim().split("\n")).toEqual([path.join(result.installDir, "omp"), "omp/18.14.3"]);
	});

	test("replaces a prebuilt omp in PI_INSTALL_DIR instead of letting it shadow the new link", async () => {
		const result = await runSourceInstall({ installDirOnPath: true, staleBinary: true });

		expect(result.exitCode, result.stdout + result.stderr).toBe(0);
		expect((await fs.lstat(path.join(result.installDir, "omp"))).isSymbolicLink()).toBe(true);
		const probe = Bun.spawnSync(["sh", "-c", "omp --version"], { env: result.env });
		expect(probe.stdout.toString().trim()).toBe("omp/18.14.3");
	});

	test("leaves PI_INSTALL_DIR alone when bun's global bin is already on PATH", async () => {
		const result = await runSourceInstall({ installDirOnPath: false, bunBinOnPath: true });

		expect(result.exitCode, result.stdout + result.stderr).toBe(0);
		await expect(fs.lstat(path.join(result.installDir, "omp"))).rejects.toThrow();
	});
});

describe.skipIf(process.platform === "win32")("install.sh binary mode", () => {
	test("installs the host target's build, verified against the answer's file sha256", async () => {
		const service = startService(sha256(BINARY));
		const result = await runInstall(service.url, ["--binary"]);

		expect(result.exitCode, result.stdout + result.stderr).toBe(0);
		expect(service.requests[0]).toBe("/api/products/omp/latest/linux-musl-x86_64?channel=stable");
		expect(result.stdout).toContain("Using version: 1.0.0");
		expect(await fs.readdir(result.installDir)).toEqual(["omp"]);
		expect(await Bun.file(path.join(result.installDir, "omp")).text()).toBe(BINARY);
	});

	test("refuses a download whose sha256 differs from the answer's file object", async () => {
		const service = startService(sha256("something else"));
		const result = await runInstall(service.url, ["--binary"]);

		expect(result.exitCode).not.toBe(0);
		expect(result.stdout).toContain("Checksum mismatch for omp-linux-musl-x64");
		expect(await fs.readdir(result.installDir)).toEqual([]);
	});

	test("--ref resolves a release tag through the versions endpoint and rejects other refs", async () => {
		const service = startService(sha256(BINARY));
		const tagged = await runInstall(service.url, ["--binary", "--ref", "v1.0.0"]);
		expect(tagged.exitCode, tagged.stdout + tagged.stderr).toBe(0);
		expect(service.requests[0]).toBe("/api/products/omp/versions/1.0.0/linux-musl-x86_64");

		const branch = await runInstall(service.url, ["--binary", "--ref", "main"]);
		expect(branch.exitCode).toBe(1);
		expect(branch.stdout).toContain("use --source with --ref");
		expect(service.requests).toHaveLength(2);
	});
});
