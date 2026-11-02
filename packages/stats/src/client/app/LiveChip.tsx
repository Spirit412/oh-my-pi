import { Button, theme as antdTheme } from "antd";
import { RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { formatInteger } from "../data/formatters";
import { useLiveStatus } from "../data/live";
import { t, useT } from "../i18n";

const CHIP_KEYFRAMES = `@keyframes omp-chip-spin { to { transform: rotate(360deg); } }
@keyframes omp-chip-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`;

const COUNT_STYLE = { fontSize: 11, opacity: 0.6, fontVariantNumeric: "tabular-nums" } as const;

/** Topbar ingest status; click to sync now. */
export function LiveChip() {
	const translate = useT();
	const { token } = antdTheme.useToken();
	const { sync, indexingHours, connected, requestSync } = useLiveStatus();
	const now = useNow(sync.phase === "idle" ? 15_000 : null);

	let body: ReactNode;
	let title: string;
	if (!connected) {
		body = (
			<>
				<StatusDot color={token.colorWarning} />
				<span>{translate("live.reconnecting")}</span>
			</>
		);
		title = translate("live.reconnectingTitle");
	} else if (sync.phase === "syncing") {
		body = (
			<>
				<RefreshCw size={13} style={{ animation: "omp-chip-spin 1s linear infinite" }} />
				<span>{translate("live.syncing")}</span>
				{sync.total > 0 && (
					<span style={COUNT_STYLE}>
						{formatInteger(sync.current)}/{formatInteger(sync.total)}
					</span>
				)}
			</>
		);
		title = translate("live.syncingTitle");
	} else if (sync.phase === "error") {
		body = (
			<>
				<StatusDot color={token.colorError} />
				<span>{translate("live.syncFailed")}</span>
			</>
		);
		title = sync.error ?? translate("live.syncFailed");
	} else if (indexingHours > INDEXING_VISIBLE_HOURS) {
		body = (
			<>
				<RefreshCw size={13} style={{ animation: "omp-chip-spin 1s linear infinite" }} />
				<span>{translate("live.indexing")}</span>
				<span style={COUNT_STYLE}>{translate("live.hoursLeft", { count: formatInteger(indexingHours) })}</span>
			</>
		);
		title = translate("live.indexingTitle");
	} else {
		body = (
			<>
				<StatusDot color={token.colorSuccess} pulse />
				<span>{translate("live.live")}</span>
				{sync.lastSyncedAt !== null && <span style={COUNT_STYLE}>{ago(now - sync.lastSyncedAt)}</span>}
			</>
		);
		title = translate("live.liveTitle");
	}

	return (
		<Button
			type="text"
			size="small"
			onClick={requestSync}
			disabled={sync.phase === "syncing"}
			title={title}
			style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
		>
			<style>{CHIP_KEYFRAMES}</style>
			{body}
		</Button>
	);
}

/** A handful of dirty hours is normal live churn; only a real backlog is worth showing. */
const INDEXING_VISIBLE_HOURS = 24;

function StatusDot({ color, pulse }: { color: string; pulse?: boolean }) {
	return (
		<span
			aria-hidden="true"
			style={{
				width: 8,
				height: 8,
				borderRadius: "50%",
				background: color,
				flexShrink: 0,
				animation: pulse ? "omp-chip-pulse 2s ease-in-out infinite" : undefined,
			}}
		/>
	);
}

function useNow(intervalMs: number | null): number {
	const [now, setNow] = useState(Date.now);
	useEffect(() => {
		if (intervalMs === null) return;
		setNow(Date.now());
		const timer = setInterval(() => setNow(Date.now()), intervalMs);
		return () => clearInterval(timer);
	}, [intervalMs]);
	return now;
}

function ago(ms: number): string {
	const s = Math.max(0, Math.round(ms / 1000));
	if (s < 45) return t("live.justNow");
	const m = Math.round(s / 60);
	if (m < 60) return t("live.minutesAgo", { count: m });
	const h = Math.round(m / 60);
	if (h < 24) return t("live.hoursAgo", { count: h });
	return t("live.daysAgo", { count: Math.round(h / 24) });
}
