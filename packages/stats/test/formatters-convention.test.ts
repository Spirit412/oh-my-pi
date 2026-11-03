import { describe, expect, it } from "bun:test";
import {
	formatBytes,
	formatCompact,
	formatDurationMs,
	formatElapsed,
	formatErrorRate,
	formatFolder,
	formatInteger,
	formatPayloadKb,
} from "../src/client/data/formatters";

// The bun-test process has no window, so the dashboard boots as locale "en"
// and every number below must use the en-US convention (comma thousands,
// dot decimals). These tests pin the externally visible formatting each stats
// table cell and axis label renders.

describe("formatter conventions (en boot)", () => {
	it("groups thousands with commas and compacts large values", () => {
		expect(formatInteger(1234567)).toBe("1,234,567");
		expect(formatCompact(1234567)).toBe("1.2M");
	});

	it("scales payload volume KB → MB → GB with two decimals and a dot", () => {
		expect(formatPayloadKb(512)).toBe("512.00 KB");
		expect(formatPayloadKb(2048)).toBe("2.00 MB");
		expect(formatPayloadKb(2 * 1024 * 1024)).toBe("2.00 GB");
		expect(formatPayloadKb(null)).toBe("–");
	});

	it("renders byte counts with one decimal", () => {
		expect(formatBytes(999)).toBe("999 B");
		expect(formatBytes(1536)).toBe("1.5 KB");
	});

	it("formats durations below a second with two decimals, null as a dash", () => {
		expect(formatDurationMs(500)).toBe("0.50s");
		expect(formatDurationMs(1500)).toBe("1.5s");
		expect(formatDurationMs(null)).toBe("-");
	});

	it("renders wall-clock lengths as minutes:seconds and hours:minutes with padded units", () => {
		expect(formatElapsed(41_000)).toBe("41.0s");
		expect(formatElapsed(17 * 60_000 + 41_000)).toBe("17m 41s");
		expect(formatElapsed(2 * 3_600_000 + 5 * 60_000)).toBe("2h 05m");
	});

	it("clips near-zero error rates and keeps the percent convention", () => {
		expect(formatErrorRate(0.00001)).toBe("<0.01%");
		expect(formatErrorRate(0)).toBe("0.0%");
		expect(formatErrorRate(0.001)).toBe("0.1%");
		expect(formatErrorRate(0.1234)).toBe("12.3%");
	});

	it("strips folder slashes and labels the workspace root via the dictionary", () => {
		expect(formatFolder("/work-pi/")).toBe("work-pi");
		expect(formatFolder("/")).toBe("(root)");
	});
});
