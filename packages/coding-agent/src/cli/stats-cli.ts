/**
 * Stats CLI command handlers.
 *
 * Handles `omp stats` subcommand for viewing AI usage statistics.
 */

import { formatKeyHint } from "@oh-my-pi/pi-tui/key-hint-format";
import { truncateToWidth } from "@oh-my-pi/pi-tui/utils";
import chalk from "@oh-my-pi/pi-utils/chalk";
import { settings } from "../config/settings";
import { resolveLocale } from "../i18n/locale";
import { cfgLanguage } from "../i18n/settings";
import { openStandaloneJudge } from "../judgment/standalone";
import { openPath } from "../utils/open";

/**
 * Extract an inline `--lang=<tag>` / `--lang <tag>` value from raw argv, the
 * same scan `prepareHelpLocale` performs; the stats command parser does not
 * own this global flag.
 */
function langFromArgv(argv: readonly string[]): string | undefined {
	const inline = argv.find(arg => arg.startsWith("--lang="));
	if (inline) return inline.slice("--lang=".length);
	const index = argv.indexOf("--lang");
	return index >= 0 ? argv[index + 1] : undefined;
}

/**
 * Single-line TTY progress bar. On a non-TTY stream we just stay quiet -
 * the final "Synced ..." summary still prints either way.
 */
function createSyncProgressReporter(): {
	onProgress: (event: { current: number; total: number; sessionFile: string }) => void;
	finish: () => void;
} {
	const stream = process.stderr;
	const isTty = stream.isTTY === true;
	let lastWidth = 0;
	let lastRender = 0;
	return {
		onProgress(event) {
			if (!isTty) return;
			const now = Date.now();
			// Throttle to ~30 fps and always force a render for the last file.
			if (event.current < event.total && now - lastRender < 33) return;
			lastRender = now;
			const label = chalk.dim(shortenSessionFile(event.sessionFile));
			const pct = ((event.current / event.total) * 100).toFixed(0).padStart(3, " ");
			const counter = chalk.cyan(`[${event.current}/${event.total}]`);
			const line = `${counter} ${pct}%  ${label}`;
			const columns = stream.columns ?? 120;
			const trimmed = truncateToWidth(line, columns - 1);
			stream.write(`\r${trimmed.padEnd(lastWidth)}`);
			lastWidth = trimmed.length;
		},
		finish() {
			if (!isTty || lastWidth === 0) return;
			stream.write(`\r${" ".repeat(lastWidth)}\r`);
			lastWidth = 0;
		},
	};
}

function shortenSessionFile(p: string): string {
	const marker = "/sessions/";
	const idx = p.indexOf(marker);
	return idx >= 0 ? p.slice(idx + marker.length) : p;
}

// =============================================================================
// Types
// =============================================================================

export interface StatsCommandArgs {
	port: number;
	host: string;
	json: boolean;
	summary: boolean;
}

// =============================================================================
// Command Handler
// =============================================================================

export async function runStatsCommand(cmd: StatsCommandArgs): Promise<void> {
	// Lazy import to avoid loading stats module when not needed
	const {
		closeDb,
		formatStatsDashboardUrl,
		getDashboardStats,
		getTotalMessageCount,
		printStatsSummary,
		refreshRollups,
		startServer,
		syncAllSessions,
	} = await import("@oh-my-pi/omp-stats");

	// One-shot reports need fully ingested, fully rolled-up data before printing.
	if (cmd.json || cmd.summary) {
		const progress = createSyncProgressReporter();
		process.stderr.write("Syncing session files...\n");
		const { processed, files } = await syncAllSessions({ onProgress: progress.onProgress });
		progress.finish();
		await refreshRollups();
		const total = await getTotalMessageCount();
		process.stderr.write(`Synced ${processed} new entries from ${files} files (${total} total)\n\n`);
		if (cmd.json) {
			console.log(JSON.stringify(await getDashboardStats(), null, 2));
		} else {
			await printStatsSummary();
		}
		return;
	}

	// The dashboard starts immediately and ingests sessions in the background,
	// streaming progress to the page. The judge (settings, auth, registry)
	// resolves on the first Frustration estimate/run and lives until exit.
	// The UI locale follows omp's own resolution (layered settings, `--lang`,
	// `OMP_LANG`); the stats server falls back to reading the user-level config
	// only for standalone `omp-stats` runs.
	const cwd = process.cwd();
	const resolvedLocale = resolveLocale({ cli: langFromArgv(process.argv), configured: cfgLanguage.get(settings) });
	const locale = resolvedLocale.split("-")[0]?.toLowerCase() === "ru" ? "ru" : "en";
	const { hostname, port } = await startServer(cmd.port, cmd.host, {
		judge: async () => (await openStandaloneJudge(cwd, "stats_frustration")).judge,
		locale,
	});
	const url = formatStatsDashboardUrl(hostname, port);
	console.log(chalk.green(`Dashboard available at: ${url}`));

	// Open browser
	openPath(url);

	console.log(`Press ${formatKeyHint("ctrl+c")} to stop\n`);

	// Keep process running
	process.on("SIGINT", () => {
		console.log("\nShutting down...");
		closeDb();
		process.exit(0);
	});

	// Keep the process alive
	await new Promise(() => {});
}
