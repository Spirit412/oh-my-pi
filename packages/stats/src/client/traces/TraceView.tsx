/**
 * Single-session trace viewer: summary strip, axis-mode toolbar, minimap,
 * flamegraph canvas, transcript list, tool aggregates, and the span drawer.
 * Owns the shared viewport/selection state so all pieces stay in sync.
 */

import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Empty, theme } from "antd";
import { getSessionTrace } from "../api";
import { useQuery } from "../data/query";
import { useT } from "../i18n";
import type { SessionTrace, TraceSpan, TraceSpanKind, TraceTrack } from "../types";
import { Card, ChartSkeleton, PageHeader, QueryView, SearchInput, Segmented } from "../ui";
import { AggregatesPanel } from "./AggregatesPanel";
import { Minimap } from "./Minimap";
import { SpanDrawer, type TraceEntryLoader } from "./SpanDrawer";
import { SummaryStrip } from "./SummaryStrip";
import { TimelineCanvas, type TimelineViewport } from "./TimelineCanvas";
import { TranscriptList } from "./TranscriptList";
import { CATEGORY_VARS } from "./trace-colors";
import { type AxisMode, buildScale } from "./time-scale";

export interface TraceViewProps {
	file: string;
	active: boolean;
	onBack: () => void;
}

const LEGEND_KINDS: TraceSpanKind[] = ["turn", "model", "tool", "subagent", "background"];

export function TraceView({ file, active, onBack }: TraceViewProps) {
	const t = useT();
	const query = useQuery<SessionTrace>(
		["trace", file],
		({ signal }, previous) => getSessionTrace(file, signal, previous),
		{ pollMs: 15000, enabled: active },
	);
	// A previous session's trace must never render under this file's header.
	const trace = query.stale ? null : query.data;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
			<div>
				<Button type="text" size="small" icon={<ArrowLeft size={14} aria-hidden="true" />} onClick={onBack}>
					{t("traces.backToSessions")}
				</Button>
			</div>
			<PageHeader
				title={
					<span
						style={{
							display: "block",
							maxWidth: 720,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{trace?.title ?? file.split("/").pop()}
					</span>
				}
				description={
					trace?.cwd ? (
						<span style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>{trace.cwd}</span>
					) : undefined
				}
				actions={
					<Button
						type="text"
						size="small"
						icon={<RefreshCw size={14} />}
						onClick={query.refetch}
						loading={query.refreshing}
						aria-label={t("traces.refresh")}
						title={t("traces.refresh")}
					/>
				}
			/>
			<QueryView query={{ ...query, data: trace }} skeleton={<ChartSkeleton height={420} />}>
				{loaded => <SessionTraceView trace={loaded} />}
			</QueryView>
		</div>
	);
}

/** Data and host integration supplied to the shared live/offline trace viewer. */
export interface SessionTraceViewProps {
	trace: SessionTrace;
	view?: "timeline" | "full";
	loadEntry?: TraceEntryLoader;
	/** Embedded viewers keep details inside their own layout, without a modal. */
	embedded?: boolean;
	onNavigate?: (trackId: string, entryId: string) => void;
}

/** Data-driven viewer shared by the live route and self-contained HTML exports. */
export function SessionTraceView({
	trace,
	view = "full",
	loadEntry,
	embedded = false,
	onNavigate,
}: SessionTraceViewProps) {
	const t = useT();
	const { token } = theme.useToken();
	const [mode, setMode] = useState<AxisMode>("time");
	const [compressIdle, setCompressIdle] = useState(true);
	const [selection, setSelection] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [matchIndex, setMatchIndex] = useState(0);
	const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
	const [viewport, setViewport] = useState<TimelineViewport | null>(null);

	const modeOptions = useMemo(
		() => [
			{ value: "time" as AxisMode, label: t("traces.mode.time"), title: t("traces.mode.time.title") },
			{ value: "turns" as AxisMode, label: t("traces.mode.turns"), title: t("traces.mode.turns.title") },
			{ value: "calls" as AxisMode, label: t("traces.mode.calls"), title: t("traces.mode.calls.title") },
		],
		[t],
	);

	const tracks = useMemo(() => trace?.tracks ?? [], [trace]);
	const scale = useMemo(() => buildScale(tracks, mode, compressIdle), [tracks, mode, compressIdle]);
	const scaleRef = useRef(scale);

	// File change: reset viewport/selection and default-collapse deep tracks.
	const lastFileRef = useRef<string | null>(null);
	useEffect(() => {
		if (!trace) return;
		if (lastFileRef.current === trace.file) return;
		lastFileRef.current = trace.file;
		setSelection(null);
		setSearch("");
		setViewport(null);
		const deep = new Set<string>();
		for (const track of trace.tracks) {
			const depth = track.id === "main" ? 0 : track.id.split("/").length;
			if (depth >= 1) deep.add(track.id);
		}
		setCollapsed(deep);
	}, [trace]);

	// Axis-mode / compression switches remap the viewport through wall time so
	// the visible window stays put; selection survives untouched.
	useEffect(() => {
		const prev = scaleRef.current;
		scaleRef.current = scale;
		setViewport(current => {
			if (!current) return current;
			const t0 = prev.toT(current.u0);
			const t1 = prev.toT(current.u1);
			const u0 = scale.toU(t0);
			const u1 = scale.toU(t1);
			return u1 - u0 > 0 ? { u0, u1 } : null;
		});
	}, [scale]);

	const effectiveViewport = useMemo<TimelineViewport>(
		() => viewport ?? { u0: scale.domain[0], u1: scale.domain[1] },
		[viewport, scale],
	);

	const allSpans = useMemo(() => {
		const spans: Array<{ span: TraceSpan; track: TraceTrack }> = [];
		for (const track of tracks) {
			for (const span of track.spans) spans.push({ span, track });
		}
		spans.sort((a, b) => a.span.start - b.span.start);
		return spans;
	}, [tracks]);

	const matches = useMemo(() => {
		const needle = search.trim().toLowerCase();
		if (!needle) return [];
		return allSpans.filter(({ span }) => `${span.label} ${span.detail ?? ""}`.toLowerCase().includes(needle));
	}, [allSpans, search]);
	// Shared with the canvas and transcript so the match test runs once per search.
	const matchIds = useMemo(
		() => (search.trim() ? new Set(matches.map(({ span }) => span.id)) : null),
		[matches, search],
	);

	const centerOnSpan = useCallback(
		(span: TraceSpan) => {
			const u = scale.toU(span.start);
			const uEnd = scale.toU(span.end);
			setViewport(current => {
				const vp = current ?? { u0: scale.domain[0], u1: scale.domain[1] };
				if (u >= vp.u0 && uEnd <= vp.u1) return current;
				const window = vp.u1 - vp.u0;
				const mid = (u + uEnd) / 2;
				const [d0, d1] = scale.domain;
				let u0 = mid - window / 2;
				if (u0 < d0) u0 = d0;
				if (u0 + window > d1) u0 = Math.max(d0, d1 - window);
				return { u0, u1: u0 + window };
			});
		},
		[scale],
	);

	const selectAndReveal = useCallback(
		(spanId: string) => {
			setSelection(spanId);
			const found = allSpans.find(({ span }) => span.id === spanId);
			if (found) centerOnSpan(found.span);
		},
		[allSpans, centerOnSpan],
	);
	// Canvas click / transcript click: select AND open the detail drawer.
	// Search cycling only selects, so the timeline stays visible.
	const selectAndOpen = useCallback((spanId: string | null) => {
		setSelection(spanId);
		setDrawerOpen(spanId !== null);
	}, []);

	const cycleMatch = useCallback(
		(direction: 1 | -1) => {
			if (matches.length === 0) return;
			const next = (((matchIndex + direction) % matches.length) + matches.length) % matches.length;
			setMatchIndex(next);
			selectAndReveal(matches[next].span.id);
		},
		[matches, matchIndex, selectAndReveal],
	);

	const toggleCollapse = useCallback((trackId: string) => {
		setCollapsed(current => {
			const next = new Set(current);
			if (next.has(trackId)) next.delete(trackId);
			else next.add(trackId);
			return next;
		});
	}, []);

	const selected = useMemo(() => {
		if (!selection) return null;
		return allSpans.find(({ span }) => span.id === selection) ?? null;
	}, [selection, allSpans]);

	const openChildTrack = useCallback(
		(childTrackId: string) => {
			const child = tracks.find(track => track.id === childTrackId);
			const first = child?.spans[0];
			// Expand ancestors so the track is visible.
			setCollapsed(current => {
				const next = new Set(current);
				let cursor = child;
				while (cursor?.parentId) {
					next.delete(cursor.parentId);
					cursor = tracks.find(track => track.id === cursor?.parentId);
				}
				return next;
			});
			if (first) selectAndReveal(first.id);
		},
		[tracks, selectAndReveal],
	);

	const collapseAll = useCallback(
		(collapse: boolean) => {
			if (!collapse) {
				setCollapsed(new Set());
				return;
			}
			const all = new Set<string>();
			for (const track of tracks) {
				if (track.id !== "main") all.add(track.id);
			}
			setCollapsed(all);
		},
		[tracks],
	);

	const openFromTranscript = useCallback(
		(spanId: string) => {
			selectAndReveal(spanId);
			setDrawerOpen(true);
		},
		[selectAndReveal],
	);
	const closeDrawer = useCallback(() => setDrawerOpen(false), []);

	const traceStart = trace.startedAt;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }} data-view={view}>
			{view === "full" && <SummaryStrip summary={trace.summary} />}
			{allSpans.length === 0 && <Empty description={t("traces.emptySpans")} style={{ padding: "24px 0" }} />}

			<Card
				index={1}
				title={t("traces.timeline.title")}
				description={t("traces.timeline.hint")}
				actions={
					<>
						<Button type="text" size="small" onClick={() => collapseAll(false)}>
							{t("traces.timeline.expandAll")}
						</Button>
						<Button type="text" size="small" onClick={() => collapseAll(true)}>
							{t("traces.timeline.collapseAll")}
						</Button>
					</>
				}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							flexWrap: "wrap",
							gap: 12,
						}}
					>
						<Segmented
							options={modeOptions}
							value={mode}
							onChange={setMode}
							size="sm"
							aria-label={t("traces.timeline.axisMode")}
						/>
						{mode === "time" && (
							<Checkbox
								checked={compressIdle}
								onChange={event => setCompressIdle(event.target.checked)}
							>
								{t("traces.timeline.compressIdle")}
							</Checkbox>
						)}
						<div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
							<SearchInput
								value={search}
								onChange={value => {
									setSearch(value);
									setMatchIndex(0);
								}}
								label={t("traces.search.label")}
								placeholder={t("traces.search.placeholder")}
								width={200}
							/>
							{search.trim() && (
								<>
									<span
										style={{
											fontSize: 12,
											minWidth: 36,
											textAlign: "center",
											fontVariantNumeric: "tabular-nums",
											color: token.colorTextSecondary,
										}}
									>
										{matches.length === 0
											? "0"
											: `${(matchIndex % Math.max(matches.length, 1)) + 1}/${matches.length}`}
									</span>
									<Button
										type="text"
										size="small"
										icon={<ChevronLeft size={14} />}
										onClick={() => cycleMatch(-1)}
										aria-label={t("traces.search.prev")}
										disabled={matches.length === 0}
									/>
									<Button
										type="text"
										size="small"
										icon={<ChevronRight size={14} />}
										onClick={() => cycleMatch(1)}
										aria-label={t("traces.search.next")}
										disabled={matches.length === 0}
									/>
								</>
							)}
						</div>
						<div
							style={{
								display: "inline-flex",
								flexWrap: "wrap",
								gap: 12,
								marginLeft: "auto",
								fontSize: 12,
								color: token.colorTextSecondary,
							}}
						>
							{LEGEND_KINDS.map(kind => (
								<span
									key={kind}
									style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
								>
									<span
										style={{
											display: "inline-block",
											width: 8,
											height: 8,
											borderRadius: 2,
											flexShrink: 0,
											background: `var(${CATEGORY_VARS[kind]})`,
										}}
									/>
									{t(`traces.kind.${kind}`)}
								</span>
							))}
						</div>
					</div>
					<Minimap tracks={tracks} scale={scale} viewport={effectiveViewport} onViewportChange={setViewport} />
					<TimelineCanvas
						tracks={tracks}
						scale={scale}
						viewport={effectiveViewport}
						onViewportChange={setViewport}
						selected={selected}
						onSelect={selectAndOpen}
						matchIds={matchIds}
						collapsed={collapsed}
						onToggleCollapse={toggleCollapse}
						traceStart={traceStart}
						autoFocus={!embedded}
					/>
				</div>
			</Card>

			<SpanDrawer
				span={drawerOpen ? (selected?.span ?? null) : null}
				track={selected?.track ?? null}
				onClose={closeDrawer}
				onOpenChildTrack={openChildTrack}
				loadEntry={loadEntry}
				inline={embedded}
				onNavigate={onNavigate}
			/>

			{view === "full" && (
				<Card index={2} title={t("traces.transcript.title")} description={t("traces.transcript.hint")} flush>
					<TranscriptList
						tracks={tracks}
						selection={selection}
						onSelect={openFromTranscript}
						search={search}
						matchIds={matchIds}
						traceStart={traceStart}
					/>
				</Card>
			)}
			{view === "full" && <AggregatesPanel toolStats={trace.summary.toolStats} index={3} />}
		</div>
	);
}
