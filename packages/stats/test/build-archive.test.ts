import { afterAll, describe, expect, it } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { buildArchiveBase64 } from "../scripts/generate-client-bundle";

// Contract: the embedded dashboard archive (src/embedded-client.generated.txt)
// must be byte-stable so it is committable — `normalizeTarMetadata` zeroes
// mtimes and fixes checksums. Without it every rebuild produces a diff even
// when nothing changed.

const FIXTURE_FILES: Record<string, string> = {
	"index.html": "<!DOCTYPE html><html><body>omp stats</body></html>\n",
	"assets/app.js": "console.log('fixture');\n",
};

const fixtureDirs: string[] = [];

async function makeFixtureDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "omp-stats-archive-"));
	fixtureDirs.push(dir);
	for (const [name, contents] of Object.entries(FIXTURE_FILES)) {
		const filePath = path.join(dir, name);
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, contents);
	}
	return dir;
}

describe("buildArchiveBase64", () => {
	it("produces identical base64 for identical directory contents in different dirs", async () => {
		const dirA = await makeFixtureDir();
		const dirB = await makeFixtureDir();
		const first = await buildArchiveBase64(dirA);
		const second = await buildArchiveBase64(dirB);
		expect(second).toBe(first);
	});

	it("emits a gzip stream whose payload round-trips", async () => {
		const base64 = await buildArchiveBase64(fixtureDirs[0]!);
		const gzipped = Buffer.from(base64, "base64");
		const tarBytes = Bun.gunzipSync(gzipped);
		// A POSIX ustar archive carries the magic at offset 257 in every header.
		expect(Buffer.from(tarBytes.subarray(257, 262)).toString("ascii")).toBe("ustar");
	});
});

afterAll(async () => {
	for (const dir of fixtureDirs) {
		await fs.rm(dir, { recursive: true, force: true });
	}
});
