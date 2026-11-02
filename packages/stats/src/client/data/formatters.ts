import { formatDate, formatRelativeTime as formatRelativeTimeLocalized } from "../i18n/dates";
import { intlLocale, t } from "../i18n";
import type { MessageStats } from "../types";

/**
 * Numbers follow the active UI locale (en-US / ru-RU) so a Russian dashboard
 * reads `1,4 тыс.` consistently; labels, percents and dates localize through
 * the i18n dictionaries.
 */
export function formatInteger(value: number): string {
	return value.toLocaleString(intlLocale());
}

export function formatCompact(value: number): string {
	return value.toLocaleString(intlLocale(), { notation: "compact" });
}

export function formatCost(value: number, digits?: number): string {
	if (value === 0) return "$0";
	const fractionDigits = digits !== undefined ? digits : value > 0 && value < 0.01 ? 4 : 2;
	return `$${value.toLocaleString(intlLocale(), {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	})}`;
}

/** Format an API-equivalent estimate, using N/A when all usage is unpriced. */
export function formatEstimatedCost(value: number, unpricedRequests: number, digits?: number): string {
	return value === 0 && unpricedRequests > 0 ? "N/A" : formatCost(value, digits);
}

/**
 * Whether one request's zero cost means unknown spend rather than free usage.
 * Mirrors the server's `unpricedRequestSql`: `xai-oauth` is billed through a
 * subscription, and `costUnpriced` marks a row the ingest path could not price
 * (a scheduled card with no recoverable request timestamp).
 */
export function isUnpricedMessage(message: Pick<MessageStats, "provider" | "usage" | "costUnpriced">): boolean {
	return (
		message.usage.totalTokens > 0 &&
		message.usage.cost.total === 0 &&
		(message.provider === "xai-oauth" || message.costUnpriced === true)
	);
}

/** Format one request's cost, distinguishing unpriced usage from free usage. */
export function formatMessageCost(
	message: Pick<MessageStats, "provider" | "usage" | "costUnpriced">,
	digits?: number,
): string {
	return formatEstimatedCost(message.usage.cost.total, isUnpricedMessage(message) ? 1 : 0, digits);
}

export function formatPercent(value: number, digits = 1): string {
	return `${(value * 100).toFixed(digits)}%`;
}

/** Show small nonzero failure rates without rounding them to zero. */
export function formatErrorRate(value: number): string {
	const percent = value * 100;
	if (percent > 0 && percent < 0.005) return "<0.01%";
	return formatPercent(value, percent > 0 && percent < 0.1 ? 2 : 1);
}

export function formatDurationMs(value: number | null, digits?: number): string {
	if (value === null) return "-";
	const sec = value / 1000;
	const d = digits !== undefined ? digits : sec < 1 ? 2 : 1;
	return t("format.secondsSuffix", { value: sec.toFixed(d) });
}

/** Wall-clock length: seconds below a minute, then `17m 41s` / `2h 05m`. */
export function formatElapsed(ms: number): string {
	if (ms < 60_000) return formatDurationMs(ms);
	const totalMin = Math.floor(ms / 60_000);
	if (totalMin < 60) {
		return t("format.minutesSeconds", { m: totalMin, s: String(Math.floor((ms % 60_000) / 1000)).padStart(2, "0") });
	}
	return t("format.hoursMinutes", { h: Math.floor(totalMin / 60), m: String(totalMin % 60).padStart(2, "0") });
}

export function formatTokensPerSecond(value: number | null): string {
	if (value === null) return "-";
	return value.toFixed(1);
}

export function formatRelativeTime(timestamp: number): string {
	return formatRelativeTimeLocalized(timestamp);
}

/** Absolute local date and time to the second ("Sep 28, 14:03:22"). */
export function formatTimestamp(timestamp: number): string {
	return formatDate(timestamp, "MMM d, HH:mm:ss");
}

/** Project folder as stored by ingest (`/work-pi/`), without the slashes. */
export function formatFolder(folder: string): string {
	return folder.replace(/^\/+|\/+$/g, "") || "(root)";
}

/** Payload size in kilobytes with two decimals, the unit the stats pages report. */
export function formatKb(value: number | null | undefined): string {
	if (value === null || value === undefined) return "–";
	return `${value.toLocaleString(intlLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KB`;
}

/**
 * Payload volume for aggregates, which can reach gigabytes: KB below a
 * megabyte, then MB/GB with two decimals. Callers keep the exact KB in the
 * cell's title. Fraction digits render in the active UI locale, matching
 * {@link formatKb}.
 */
export function formatPayloadKb(value: number | null | undefined): string {
	if (value === null || value === undefined) return "–";
	const fixed = (v: number) =>
		new Intl.NumberFormat(intlLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
	if (value >= 1024 * 1024) return `${fixed(value / 1024 / 1024)} GB`;
	if (value >= 1024) return `${fixed(value / 1024)} MB`;
	return `${fixed(value)} KB`;
}

export function formatBytes(value: number): string {
	const fixed = (v: number) =>
		new Intl.NumberFormat(intlLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
	if (value >= 1e9) return `${fixed(value / 1e9)} GB`;
	if (value >= 1e6) return `${fixed(value / 1e6)} MB`;
	if (value >= 1e3) return `${fixed(value / 1e3)} KB`;
	return `${value} B`;
}
