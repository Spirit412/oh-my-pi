import { getLocale, intlLocale } from "./index";

/**
 * Locale-aware date formatting for the dashboard. `pi-utils/dates` is
 * English-only; the dashboard follows the omp UI locale, so these helpers
 * cover exactly the pattern surface the dashboard uses, via Intl.
 */

export type DatePattern = "HH:mm" | "MMM d" | "MMM d HH:mm" | "MMM d, HH:mm:ss";

const PATTERN_OPTIONS: Record<DatePattern, Intl.DateTimeFormatOptions> = {
	"HH:mm": { hour: "2-digit", minute: "2-digit", hour12: false },
	"MMM d": { month: "short", day: "numeric" },
	"MMM d HH:mm": { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false },
	"MMM d, HH:mm:ss": {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	},
};

/** Format a timestamp with a dashboard date pattern in the active locale. */
export function formatDate(timestamp: number, pattern: DatePattern): string {
	return new Intl.DateTimeFormat(intlLocale(), PATTERN_OPTIONS[pattern]).format(new Date(timestamp));
}

const RTF_LOCALES: Record<string, string> = { en: "en-US", ru: "ru-RU" };

/** "5 minutes ago" / "5 минут назад" relative to now. */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
	const deltaSec = Math.round((timestamp - now) / 1000);
	const abs = Math.abs(deltaSec);
	const rtf = new Intl.RelativeTimeFormat(RTF_LOCALES[getLocale()], { numeric: "auto" });
	if (abs < 45) return rtf.format(deltaSec, "second");
	if (abs < 45 * 60) return rtf.format(Math.round(deltaSec / 60), "minute");
	if (abs < 22 * 3600) return rtf.format(Math.round(deltaSec / 3600), "hour");
	return rtf.format(Math.round(deltaSec / 86400), "day");
}
