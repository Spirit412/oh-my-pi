/**
 * Detail drawer for a selected trace span. Loads the full journal entry on
 * demand (live API or embedded snapshot) and renders per-kind detail: model usage grid
 * + text blocks, tool args/result, user text, subagent task text.
 */

import { Check, Copy, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button, theme } from "antd";
import { getSessionEntryDetail } from "../api";
import { formatDurationMs, formatInteger, formatKb, formatTimestamp } from "../data/formatters";
import { useT } from "../i18n";
import type { TraceSpan, TraceTrack } from "../types";
import { Badge, Drawer, type DrawerProps, ErrorState, JsonBlock, KeyValues, Skeleton } from "../ui";

export type TraceEntryLoader = (file: string, entryId: string, signal: AbortSignal) => Promise<{ entry: unknown }>;

export interface SpanDrawerProps {
	span: TraceSpan | null;
	track: TraceTrack | null;
	onClose: () => void;
	/** Selects the first span of the given child track ("open child track"). */
	onOpenChildTrack?: (childTrackId: string) => void;
	loadEntry?: TraceEntryLoader;
	inline?: boolean;
	onNavigate?: (trackId: string, entryId: string) => void;
}

/** Loose structural view of a fetched journal entry (validated field-by-field). */
interface EntryDetailView {
	message?: {
		role?: string;
		content?: unknown;
		usage?: {
			input?: number;
			output?: number;
			cacheRead?: number;
			cacheWrite?: number;
			totalTokens?: number;
			cost?: { total?: number };
		};
		model?: string;
		provider?: string;
		stopReason?: string;
		errorMessage?: string;
		duration?: number;
		ttft?: number;
		toolName?: string;
		isError?: boolean;
		details?: unknown;
	};
}

function textBlocks(content: unknown): Array<{ kind: string; text: string }> {
	const blocks: Array<{ kind: string; text: string }> = [];
	if (typeof content === "string") {
		if (content.trim()) blocks.push({ kind: "text", text: content });
		return blocks;
	}
	if (!Array.isArray(content)) return blocks;
	for (const block of content) {
		if (!block || typeof block !== "object" || !("type" in block)) continue;
		if ((block.type === "text" || block.type === "thinking") && "text" in block && typeof block.text === "string") {
			blocks.push({ kind: String(block.type), text: block.text });
		}
	}
	return blocks;
}

/** Embedded variant of the detail sheet, rendered inline instead of as a modal. */
function InlineSpanDetail({ title, subtitle, actions, onClose, children }: DrawerProps) {
	const t = useT();
	const { token } = theme.useToken();
	return (
		<section
			aria-label={t("traces.drawer.detailsAria")}
			style={{
				display: "flex",
				flexDirection: "column",
				border: `1px solid ${token.colorBorderSecondary}`,
				borderRadius: token.borderRadiusLG,
				background: token.colorBgContainer,
				minWidth: 0,
			}}
		>
			<header
				style={{
					display: "flex",
					alignItems: "flex-start",
					gap: 12,
					padding: "16px 16px 12px 20px",
					borderBottom: `1px solid ${token.colorBorderSecondary}`,
				}}
			>
				<div style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
					<div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
					{subtitle !== undefined && (
						<div style={{ fontSize: 12.5, color: token.colorTextTertiary, marginTop: 2 }}>{subtitle}</div>
					)}
				</div>
				{actions}
				<Button
					type="text"
					size="small"
					icon={<X size={16} />}
					onClick={onClose}
					aria-label={t("traces.drawer.close")}
				/>
			</header>
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "16px 20px 24px",
					display: "flex",
					flexDirection: "column",
					gap: 18,
				}}
			>
				{children}
			</div>
		</section>
	);
}

export function SpanDrawer({
	span,
	track,
	onClose,
	onOpenChildTrack,
	loadEntry = getSessionEntryDetail,
	inline = false,
	onNavigate,
}: SpanDrawerProps) {
	const t = useT();
	const { token } = theme.useToken();
	const [entry, setEntry] = useState<unknown>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [copied, setCopied] = useState(false);
	const copyResetRef = useRef<number>(0);

	useEffect(() => {
		setEntry(null);
		setError(null);
		setCopied(false);
		setLoading(false);
		if (!span || !track || !span.entryId) return;
		setLoading(true);
		const controller = new AbortController();
		loadEntry(track.file, span.entryId, controller.signal)
			.then(data => {
				if (!controller.signal.aborted) setEntry(data.entry);
			})
			.catch(err => {
				if (controller.signal.aborted) return;
				setError(err instanceof Error ? err : new Error(String(err)));
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [span, track, loadEntry]);

	useEffect(() => () => window.clearTimeout(copyResetRef.current), []);

	if (!span) return null;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify(entry ?? span, null, 2));
			setCopied(true);
			window.clearTimeout(copyResetRef.current);
			copyResetRef.current = window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard unavailable (permissions); leave the button state as-is.
		}
	};

	// Boundary view: server returns opaque journal JSON, fields re-checked below.
	const view: EntryDetailView = entry && typeof entry === "object" ? (entry as EntryDetailView) : {};
	const msg = view.message;
	const usage = msg?.usage;

	const numStyle: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };
	const monoStyle: React.CSSProperties = { fontFamily: "var(--font-mono, ui-monospace, monospace)" };
	const secondaryStyle: React.CSSProperties = { color: token.colorTextSecondary };

	const metrics: Array<{ key: string; label: ReactNode; value: ReactNode }> = [
		{
			key: "duration",
			label: t("traces.metric.duration"),
			value: (
				<span style={numStyle}>
					{formatDurationMs(span.end - span.start)}
					{span.unterminated && <span style={secondaryStyle}> · {t("traces.kind.unterminated")}</span>}
				</span>
			),
		},
		{
			key: "start",
			label: t("traces.metric.start"),
			value: <span style={numStyle}>{formatTimestamp(span.start)}</span>,
		},
		{
			key: "track",
			label: t("traces.metric.track"),
			value: <span style={monoStyle}>{track?.label ?? "-"}</span>,
		},
	];
	if (span.kind === "model") {
		metrics.push(
			{
				key: "tokens",
				label: t("traces.metric.tokens"),
				value: <span style={numStyle}>{formatInteger(span.tokens ?? 0)}</span>,
			},
			{
				key: "cost",
				label: t("traces.metric.cost"),
				value: <span style={numStyle}>${(span.cost ?? 0).toFixed(4)}</span>,
			},
			{
				key: "ttft",
				label: t("traces.metric.ttft"),
				value: <span style={numStyle}>{formatDurationMs(span.ttft ?? null)}</span>,
			},
			{
				key: "model",
				label: t("traces.metric.model"),
				value: <span style={monoStyle}>{msg?.model ?? span.model ?? "-"}</span>,
			},
		);
		if (usage)
			metrics.push({
				key: "split",
				label: t("traces.metric.split"),
				value: (
					<span style={numStyle}>
						{formatInteger(usage.input ?? 0)} / {formatInteger(usage.output ?? 0)} /{" "}
						{formatInteger(usage.cacheRead ?? 0)}
					</span>
				),
			});
		if (msg?.provider)
			metrics.push({
				key: "provider",
				label: t("traces.metric.provider"),
				value: <span style={monoStyle}>{msg.provider}</span>,
			});
		if (msg?.stopReason)
			metrics.push({
				key: "stop",
				label: t("traces.metric.stopReason"),
				value: <span style={monoStyle}>{msg.stopReason}</span>,
			});
	}
	// Payload volume on both sides of the exchange for every span kind: model
	// spans carry transport bytes, turns sum their model calls, tools their
	// arguments and result, subagents their child transcript, background jobs
	// their originating call and delivery. Older sessions read as "not measured".
	{
		metrics.push(
			{
				key: "requestSize",
				label: t("traces.metric.requestSize"),
				value: (
					<span
						style={numStyle}
						title={
							span.requestBytes === undefined
								? t("traces.drawer.notMeasured")
								: `${formatInteger(span.requestBytes)} ${t(`traces.payload.${span.kind}.request`)}`
						}
					>
						{formatKb(span.requestBytes === undefined ? null : span.requestBytes / 1024)}
					</span>
				),
			},
			{
				key: "responseSize",
				label: t("traces.metric.responseSize"),
				value: (
					<span
						style={numStyle}
						title={
							span.responseBytes === undefined
								? t("traces.drawer.notMeasured")
								: `${formatInteger(span.responseBytes)} ${t(`traces.payload.${span.kind}.response`)}`
						}
					>
						{formatKb(span.responseBytes === undefined ? null : span.responseBytes / 1024)}
					</span>
				),
			},
		);
	}

	const DetailShell = inline ? InlineSpanDetail : Drawer;
	const sectionLabel = (color?: string): React.CSSProperties => ({
		fontSize: 12,
		fontWeight: 500,
		color: color ?? token.colorTextTertiary,
		marginBottom: 8,
	});
	const preStyle = (scroll?: boolean): React.CSSProperties => ({
		margin: 0,
		padding: "12px 14px",
		borderRadius: token.borderRadius,
		border: `1px solid ${token.colorBorderSecondary}`,
		background: token.colorBgContainer,
		fontFamily: "var(--font-mono, ui-monospace, monospace)",
		fontSize: 12,
		lineHeight: 1.55,
		color: token.colorTextSecondary,
		overflow: "auto",
		maxHeight: scroll ? 360 : 480,
		whiteSpace: "pre-wrap",
		overflowWrap: "anywhere",
	});

	return (
		<DetailShell
			open
			onClose={onClose}
			title={span.label}
			subtitle={
				<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
					<Badge tone={span.isError ? "bad" : "neutral"}>
						{span.isError ? t("traces.drawer.kindError", { kind: span.kind }) : span.kind}
					</Badge>
				</span>
			}
			actions={
				<Button
					type="text"
					size="small"
					icon={copied ? <Check size={15} /> : <Copy size={15} />}
					onClick={handleCopy}
					aria-label={t("traces.drawer.copy")}
					title={t("traces.drawer.copy")}
				/>
			}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
				<KeyValues items={metrics} />
				{onNavigate && track && span.entryId && (
					<div>
						<Button
							size="small"
							onClick={() => {
								if (span.entryId) onNavigate(track.id, span.entryId);
							}}
						>
							{t("traces.drawer.jumpToTranscript")}
						</Button>
					</div>
				)}

				{msg?.errorMessage && (
					<div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
						<div style={sectionLabel(token.colorError)}>{t("traces.drawer.errorMessage")}</div>
						<pre style={preStyle()}>{msg.errorMessage}</pre>
					</div>
				)}

				{span.kind === "subagent" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
						{span.detail && (
							<>
								<div style={sectionLabel()}>{t("traces.drawer.task")}</div>
								<pre style={preStyle()}>{span.detail}</pre>
							</>
						)}
						{span.childTrackId && onOpenChildTrack && (
							<div>
								<Button size="small" onClick={() => onOpenChildTrack(span.childTrackId ?? "")}>
									{t("traces.drawer.openChildTrack")} <span style={monoStyle}>{span.childTrackId}</span>
								</Button>
							</div>
						)}
					</div>
				)}

				{span.kind === "tool" && span.detail && (
					<div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
						<div style={sectionLabel()}>{t("traces.drawer.args")}</div>
						<pre style={preStyle()}>{span.detail}</pre>
					</div>
				)}

				{loading && (
					<div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
						<Skeleton height={80} />
						<Skeleton height={160} />
					</div>
				)}
				{error && <ErrorState error={t("traces.drawer.loadError", { message: error.message })} />}

				{!loading &&
					entry !== null &&
					textBlocks(msg?.content).map((block, index) => (
						<div key={`${block.kind}-${index}`} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
							<div style={sectionLabel()}>
								{block.kind === "thinking" ? t("traces.drawer.thinking") : t("traces.drawer.text")}
							</div>
							<pre style={preStyle(true)}>{block.text}</pre>
						</div>
					))}

				{!loading && entry !== null && <JsonBlock data={entry} title={t("traces.drawer.rawEntry")} initialCollapsed={true} />}
			</div>
		</DetailShell>
	);
}
