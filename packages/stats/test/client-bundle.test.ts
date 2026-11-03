import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { ruMessages } from "../src/client/i18n";

// Contract: the dashboard the stats server ships (embedded archive or dist/)
// is a complete localized app. This rebuilds the client bundle into a temp
// dir (never touching dist/) and asserts what a browser would observe.

let outdir: string;
let bundle: string;
let css: string;

/** The minifier may emit non-ASCII raw or as \uXXXX escapes — accept either. */
function rawOrEscaped(value: string): RegExp {
	const escaped = value.replace(/[\u0080-\uffff]/g, ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);
	const quoted = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`(?:${quoted(value)}|${quoted(escaped)})`);
}

beforeAll(async () => {
	outdir = await fs.mkdtemp(path.join(os.tmpdir(), "omp-stats-bundle-"));
	const result = await Bun.build({
		entrypoints: [path.join(import.meta.dir, "../src/client/index.tsx")],
		outdir,
		minify: true,
		naming: "[dir]/[name].[ext]",
	});
	if (!result.success) {
		throw new Error(`client bundle failed: ${result.logs.map(String).join("; ")}`);
	}
	bundle = await Bun.file(path.join(outdir, "index.js")).text();
	css = await Bun.file(path.join(outdir, "index.css")).text();
}, 120_000);

afterAll(async () => {
	await fs.rm(outdir, { recursive: true, force: true });
});

describe("client bundle contract", () => {
	it("inlines route dictionaries — a missing glob/module drops every route string from production", () => {
		// Regression: import.meta.glob silently resolved empty under Bun.build,
		// so only directly-imported common.ts survived; route keys rendered raw.
		// chart.otherSeries lives in routes/charts.ts — a common.ts key would
		// pass even with the route modules missing.
		const other = ruMessages["chart.otherSeries"];
		expect(typeof other).toBe("object");
		const label = typeof other === "object" ? other.other : other;
		expect(rawOrEscaped(label).test(bundle)).toBe(true);
	});

	it("keeps the locale boot hook — without it the dashboard would always boot in English", () => {
		expect(bundle).toContain("__OMP_DASHBOARD_CONFIG__");
	});

	it("keeps the emitted CSS free of removed design-system selectors", () => {
		// Regression: stage-2 pruned the hand-written design system; if a route
		// regrows a topbar/sidebar class, its styles are gone and layout breaks.
		for (const dead of [".topbar", ".sidebar", ".live-chip", ".segmented", ".skeleton"]) {
			expect(css).not.toContain(dead);
		}
	});
});
