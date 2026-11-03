/**
 * Windowed transcript list under the timeline: all spans + markers flattened
 * chronologically across tracks, bidirectionally synced with the canvas
 * selection. Hand-rolled fixed-row virtualization (28px rows, spacer divs).
 */

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { theme } from "antd";
import { formatDurationMs } from "../data/formatters";
import { useT } from "../i18n";
import { EmptyState } from "../ui";
import type { TraceMarker, TraceSpan, TraceTrack } from "../types";
import { formatOffset } from "./time-scale";
import { useTraceTheme } from "./trace-colors";

export interface TranscriptRow {
	key: string;
	time: number;
	span?: TraceSpan;
	marker?: TraceMarker;
	track: TraceTrack;
	depth: number;
}

export interface TranscriptListProps {
	tracks: TraceTrack[];
	selection: string | null;
	onSelect: (spanId: string) => void;
	search: string;
	/** Spans matching `search` (from the trace view); `null` when not searching. */
	matchIds: ReadonlySet<string> | null;
	traceStart: number;
}

const ROW_H = 28;
const OVERSCAN = 20;
const LIST_H = 340;

/** Flatten all spans and markers across tracks into chronological rows. */
export function buildTranscriptRows(tracks: TraceTrack[]): TranscriptRow[] {
	const rows: TranscriptRow[] = [];
	for (const track of tracks) {
		const depth = track.id === "main" ? 0 : track.id.split("/").length;
		for (const span of track.spans) {
			rows.push({ key: span.id, time: span.start, span, track, depth });
		}
		for (let i = 0; i < track.markers.length; i++) {
			const marker = track.markers[i];
			rows.push({ key: `${track.id}:marker:${i}`, time: marker.time, marker, track, depth });
		}
	}
	rows.sort((a, b) => a.time - b.time);
	return rows;
}

export const TranscriptList = memo(function TranscriptList({
	tracks,
	selection,
	onSelect,
	search,
	matchIds,
	traceStart,
}: TranscriptListProps) {
	const t = useT();
	const { token } = theme.useToken();
	const colors = useTraceTheme();
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [hoverKey, setHoverKey] = useState<string | null>(null);

	const allRows = useMemo(() => buildTranscriptRows(tracks), [tracks]);
	const rows = useMemo(() => {
		if (!matchIds) return allRows;
		const needle = search.trim().toLowerCase();
		return allRows.filter(row =>
			row.span ? matchIds.has(row.span.id) : (row.marker?.label ?? "").toLowerCase().includes(needle),
		);
	}, [allRows, search, matchIds]);

	// Scroll the selected row into view when selection changes externally.
	useEffect(() => {
		if (!selection) return;
		const container = containerRef.current;
		if (!container) return;
		const index = rows.findIndex(row => row.span?.id === selection);
		if (index === -1) return;
		const rowTop = index * ROW_H;
		if (rowTop < container.scrollTop || rowTop + ROW_H > container.scrollTop + container.clientHeight) {
			container.scrollTop = Math.max(0, rowTop - container.clientHeight / 2);
		}
	}, [selection, rows]);

	const firstVisible = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
	const lastVisible = Math.min(rows.length, Math.ceil((scrollTop + LIST_H) / ROW_H) + OVERSCAN);
	const visible = rows.slice(firstVisible, lastVisible);

	const truncate: CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 };

	return (
		<div
			ref={containerRef}
			onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
			style={{ height: LIST_H, overflowY: "auto" }}
		>
			<div style={{ height: rows.length * ROW_H, position: "relative" }}>
				<div style={{ position: "absolute", top: firstVisible * ROW_H, left: 0, right: 0 }}>
					{visible.map(row => {
						const span = row.span;
						const isSelected = span !== undefined && span.id === selection;
						const color = row.span ? colors.category[row.span.kind] : colors.marker;
						const label = row.span?.label ?? row.marker?.label ?? "";
						const detail = row.span?.detail;
						const duration = row.span ? formatDurationMs(row.span.end - row.span.start) : "";
						const chipText = row.span ? t(`traces.kind.${row.span.kind}`) : (row.marker?.kind ?? "");
						const isStatic = span === undefined;
						const rowStyle: CSSProperties = {
							display: "flex",
							alignItems: "center",
							gap: 10,
							height: ROW_H,
							width: "100%",
							padding: "0 16px",
							paddingLeft: 12 + row.depth * 12,
							background: isSelected
								? token.controlItemBgActive
								: hoverKey === row.key && !isStatic
									? token.colorFillTertiary
									: "transparent",
							border: "none",
							borderBottom: `1px solid ${token.colorBorderSecondary}`,
							color: "inherit",
							font: "inherit",
							textAlign: "left",
							cursor: isStatic ? "default" : "pointer",
							boxShadow: isSelected ? "inset 2px 0 0 var(--accent)" : undefined,
						};
						const rowContent = (
							<>
								<span
									style={{
										flexShrink: 0,
										width: 72,
										fontSize: 11,
										fontWeight: 500,
										borderRadius: token.borderRadiusSM,
										padding: "1px 0",
										textAlign: "center",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										color: token.colorText,
										background: `color-mix(in srgb, ${color} 18%, transparent)`,
										boxShadow: `inset 2px 0 0 ${color}`,
									}}
								>
									{chipText}
								</span>
								{row.depth > 0 && (
									<span
										title={row.track.label}
										style={{
											...truncate,
											flexShrink: 0,
											maxWidth: 110,
											fontSize: 11,
											color: token.colorTextTertiary,
											fontFamily: "var(--font-mono, ui-monospace, monospace)",
										}}
									>
										{row.track.id}
									</span>
								)}
								<span style={{ ...truncate, fontSize: 12.5, color: token.colorText, flexShrink: 1 }}>
									{label}
								</span>
								{detail && (
									<span style={{ ...truncate, fontSize: 12, color: token.colorTextTertiary, flex: 1 }}>
										{detail}
									</span>
								)}
								<span
									style={{
										marginLeft: "auto",
										flexShrink: 0,
										display: "inline-flex",
										gap: 12,
										fontSize: 11.5,
										color: token.colorTextTertiary,
										fontVariantNumeric: "tabular-nums",
									}}
								>
									{row.span?.isError && <span style={{ color: token.colorError }}>{t("traces.kind.error")}</span>}
									<span>{duration}</span>
									<span>{formatOffset(row.time - traceStart)}</span>
								</span>
							</>
						);
						return isStatic ? (
							<div
								key={row.key}
								style={rowStyle}
								onMouseEnter={() => setHoverKey(row.key)}
								onMouseLeave={() => setHoverKey(null)}
							>
								{rowContent}
							</div>
						) : (
							<button
								key={row.key}
								type="button"
								onClick={() => span && onSelect(span.id)}
								style={rowStyle}
								onMouseEnter={() => setHoverKey(row.key)}
								onMouseLeave={() => setHoverKey(null)}
							>
								{rowContent}
							</button>
						);
					})}
				</div>
			</div>
			{rows.length === 0 && <EmptyState title={t("traces.transcript.empty")} />}
		</div>
	);
});
