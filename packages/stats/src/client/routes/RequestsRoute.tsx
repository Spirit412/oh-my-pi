import { Button, theme } from "antd";
import { useMemo, useState } from "react";
import { getRecentRequests } from "../api";
import {
	formatCompact,
	formatDurationMs,
	formatErrorRate,
	formatEstimatedCost,
	formatFolder,
	formatInteger,
	formatKb,
	formatMessageCost,
	formatPayloadKb,
	formatRelativeTime,
	formatTimestamp,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { rangeMeta, rangeWindowLabel } from "../data/range";
import { type RequestStatus, requestStatus, summarizeRequests } from "../data/view-models";
import { useT } from "../i18n";
import { REQUEST_STATUS } from "../ui/RequestDrawer";
import type { MessageStats, TimeRange } from "../types";
import {
	Card,
	type Column,
	Dot,
	EmptyState,
	LabelCell,
	PageHeader,
	QueryView,
	SearchInput,
	Segmented,
	Skeleton,
	Stat,
	StatGrid,
	Table,
	TableSkeleton,
} from "../ui";

export interface RequestsRouteProps {
	active: boolean;
	range: TimeRange;
	onRequestClick: (id: number) => void;
}

/** How many of the newest requests to load; "Load more" steps through these. */
const LOAD_STEPS = [500, 2_000, 10_000] as const;

type StatusFilter = "all" | RequestStatus;

export function RequestsRoute({ active, range, onRequestClick }: RequestsRouteProps) {
	const t = useT();
	const { token } = theme.useToken();
	const [step, setStep] = useState(0);
	const limit = LOAD_STEPS[step];
	const log = useQuery(["requests-log", limit], ({ signal }) => getRecentRequests(limit, signal), { enabled: active });
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<StatusFilter>("all");
	const spanMs = rangeMeta(range).spanMs;
	const windowLabel = rangeWindowLabel(range);

	const view = useMemo(() => {
		const rows = log.data ?? [];
		const cutoff = spanMs === null ? null : Date.now() - spanMs;
		const inRange = cutoff === null ? rows : rows.filter(row => row.timestamp >= cutoff);
		// The loaded window covers the whole range when the server ran out of rows
		// or the oldest loaded row is already older than the range start. Stale
		// rows belong to a smaller limit that is being replaced.
		const complete = !log.stale && (rows.length < limit || (cutoff !== null && inRange.length < rows.length));
		const counts: Record<StatusFilter, number> = { all: inRange.length, ok: 0, aborted: 0, failed: 0 };
		for (const row of inRange) counts[requestStatus(row)]++;
		return { loaded: rows.length, inRange, complete, counts, summary: summarizeRequests(inRange) };
	}, [log.data, log.stale, limit, spanMs]);

	const filtered = useMemo(() => {
		const needle = search.trim().toLowerCase();
		return view.inRange.filter(
			row =>
				(status === "all" || requestStatus(row) === status) &&
				(needle === "" ||
					row.model.toLowerCase().includes(needle) ||
					row.provider.toLowerCase().includes(needle) ||
					row.folder.toLowerCase().includes(needle)),
		);
	}, [view.inRange, search, status]);

	const columns = useMemo(() => buildColumns(t, token.fontFamilyCode, token.colorTextTertiary), [t, token]);

	const { summary, counts, complete } = view;
	const nextStep = step + 1 < LOAD_STEPS.length ? LOAD_STEPS[step + 1] : null;
	const loadMore =
		nextStep !== null ? (
			<Button
				type="default"
				size="small"
				disabled={log.refreshing}
				onClick={() => setStep(step + 1)}
			>
				{log.refreshing && log.stale
					? t("requests.log.loadingMore")
					: t("requests.log.loadMore", { count: nextStep })}
			</Button>
		) : undefined;

	const statusOptions = (["all", "ok", "aborted", "failed"] as const).map(value => ({
		value,
		label: (
			<>
				{value === "all" ? t("requests.filter.all") : REQUEST_STATUS[value].label}{" "}
				<span style={{ color: token.colorTextTertiary, fontVariantNumeric: "tabular-nums" }}>
					{formatCompact(counts[value])}
				</span>
			</>
		),
	}));

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
			<PageHeader
				title={t("requests.title")}
				description={t("requests.description", { window: windowLabel })}
			/>

			<QueryView query={log} skeleton={<Skeleton height={96} style={{ borderRadius: 12 }} />}>
				{() => (
					<div data-stale={log.stale}>
						<StatGrid min={160}>
							<Stat
								label={t("requests.stat.requests")}
								value={formatInteger(summary.requests)}
								hint={
									summary.oldest === null
										? t("requests.stat.requests.noneIn", { window: windowLabel })
										: t("requests.stat.requests.since", { when: formatRelativeTime(summary.oldest) })
								}
							/>
							<Stat
								label={t("requests.stat.failed")}
								value={formatInteger(summary.failed)}
								hint={t("requests.stat.failed.hint", {
									rate:
										summary.requests > 0 ? formatErrorRate(summary.failed / summary.requests) : "–",
									count: summary.aborted,
								})}
							/>
							<Stat
								label={t("requests.stat.tokens")}
								title={t("requests.stat.tokens.title")}
								value={formatCompact(summary.tokens)}
							/>
							<Stat
								label={t("requests.stat.cost")}
								title={t("requests.stat.cost.title")}
								value={formatEstimatedCost(summary.cost, summary.unpriced)}
								hint={
									summary.unpriced > 0
										? t("requests.stat.cost.unpriced", { count: summary.unpriced })
										: undefined
								}
							/>
							<Stat
								label={t("requests.stat.duration")}
								value={formatDurationMs(summary.medianDuration)}
								hint={t("requests.stat.duration.p95", { value: formatDurationMs(summary.p95Duration) })}
							/>
							<Stat
								label={t("requests.stat.ttft")}
								title={t("requests.stat.ttft.title")}
								value={formatDurationMs(summary.medianTtft)}
							/>
							<Stat
								label={t("requests.stat.requestKb")}
								title={t("requests.stat.requestKb.title")}
								value={formatPayloadKb(summary.requestKb)}
								hint={
									summary.payloadRequests > 0
										? t("requests.stat.requestKb.measured", {
												avg: formatKb(summary.requestKb / summary.payloadRequests),
												count: summary.payloadRequests,
											})
										: t("requests.stat.requestKb.notMeasured")
								}
							/>
							<Stat
								label={t("requests.stat.responseKb")}
								title={t("requests.stat.responseKb.title")}
								value={formatPayloadKb(summary.responseKb)}
								hint={
									summary.requests > 0
										? t("requests.stat.responseKb.avg", {
												avg: formatKb(summary.responseKb / summary.requests),
											})
										: undefined
								}
							/>
						</StatGrid>
					</div>
				)}
			</QueryView>

			<Card
				index={1}
				title={t("requests.log.title")}
				description={
					log.data === null
						? t("requests.log.loading")
						: complete
							? t("requests.log.complete", {
									shown: formatInteger(filtered.length),
									total: formatInteger(summary.requests),
									window: windowLabel,
								})
							: t("requests.log.partial", {
									shown: formatInteger(filtered.length),
									total: formatInteger(summary.requests),
								})
				}
				actions={
					<>
						<SearchInput
							value={search}
							onChange={setSearch}
							placeholder={t("requests.search.placeholder")}
						/>
						<Segmented
							size="sm"
							aria-label={t("requests.filter.status")}
							options={statusOptions}
							value={status}
							onChange={setStatus}
						/>
					</>
				}
				flush
				stale={log.stale}
				footer={
					log.data !== null && !complete ? (
						<>
							<span>
								{t("requests.log.footer", {
									loaded: formatInteger(view.loaded),
									oldest: summary.oldest === null ? "–" : formatTimestamp(summary.oldest),
									window: windowLabel,
								})}
							</span>
							{loadMore}
						</>
					) : undefined
				}
			>
				<QueryView query={log} skeleton={<TableSkeleton rows={12} />}>
					{() => (
						<Table
							rows={filtered}
							rowKey={row => row.id ?? `${row.sessionFile}:${row.entryId}`}
							onRowClick={row => row.id !== undefined && onRequestClick(row.id)}
							columns={columns}
							initialSort={{ key: "time", dir: "desc" }}
							limit={100}
							dense
							empty={
								<EmptyState
									title={
										summary.requests === 0
											? t("requests.empty.range", { window: windowLabel })
											: t("requests.empty.filter")
									}
									hint={summary.requests === 0 ? undefined : t("requests.empty.filterHint")}
								/>
							}
						/>
					)}
				</QueryView>
			</Card>
		</div>
	);
}

/** The dashboard translate function; declared structurally since it lives in the off-limits i18n core. */
type Translate = (key: string, params?: Record<string, string | number>) => string;

function buildColumns(
	t: Translate,
	monoFont: string,
	mutedColor: string,
): readonly Column<MessageStats>[] {
	const mono = { fontFamily: monoFont };
	const num = { fontVariantNumeric: "tabular-nums" };
	const muted = { color: mutedColor };
	return [
		{
			key: "model",
			header: t("requests.col.model"),
			sort: row => row.model,
			render: row => <LabelCell primary={<span style={mono}>{row.model}</span>} secondary={row.provider} />,
		},
		{
			key: "time",
			header: t("requests.col.time"),
			sort: row => row.timestamp,
			render: row => (
				<span style={muted} title={formatTimestamp(row.timestamp)}>
					{formatRelativeTime(row.timestamp)}
				</span>
			),
		},
		{
			key: "project",
			header: t("requests.col.project"),
			sort: row => row.folder,
			render: row => (
				<span
					style={{ ...mono, ...muted, display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
					title={row.folder}
				>
					{formatFolder(row.folder)}
				</span>
			),
		},
		{
			key: "input",
			header: t("requests.col.input"),
			title: t("requests.col.input.title"),
			align: "right",
			sort: row => row.usage.input,
			render: row => <span style={num}>{formatCompact(row.usage.input)}</span>,
		},
		{
			key: "cache",
			header: t("requests.col.cache"),
			title: t("requests.col.cache.title"),
			align: "right",
			sort: row => row.usage.cacheRead,
			render: row => (
				<span style={num} title={t("requests.col.cacheWrite", { count: formatInteger(row.usage.cacheWrite) })}>
					{formatCompact(row.usage.cacheRead)}
				</span>
			),
		},
		{
			key: "output",
			header: t("requests.col.output"),
			align: "right",
			sort: row => row.usage.output,
			render: row => <span style={num}>{formatCompact(row.usage.output)}</span>,
		},
		{
			key: "requestKb",
			header: t("requests.col.requestKb"),
			title: t("requests.col.requestKb.title"),
			align: "right",
			sort: row => row.requestKb ?? 0,
			render: row => (
				<span style={{ ...num, ...muted }}>{formatKb(row.requestKb)}</span>
			),
		},
		{
			key: "responseKb",
			header: t("requests.col.responseKb"),
			title: t("requests.col.responseKb.title"),
			align: "right",
			sort: row => row.responseKb ?? 0,
			render: row => (
				<span style={{ ...num, ...muted }}>{formatKb(row.responseKb)}</span>
			),
		},
		{
			key: "cost",
			header: t("requests.col.cost"),
			title: t("requests.col.cost.title"),
			align: "right",
			sort: row => row.usage.cost.total,
			render: row => <span style={num}>{formatMessageCost(row, 4)}</span>,
		},
		{
			key: "duration",
			header: t("requests.col.duration"),
			align: "right",
			sort: row => row.duration ?? -1,
			render: row => <span style={num}>{formatDurationMs(row.duration)}</span>,
		},
		{
			key: "ttft",
			header: t("requests.col.ttft"),
			title: t("requests.col.ttft.title"),
			align: "right",
			sort: row => row.ttft ?? -1,
			render: row => (
				<span style={{ ...num, ...muted }}>{formatDurationMs(row.ttft)}</span>
			),
		},
		{
			key: "status",
			header: t("requests.col.status"),
			sort: row => requestStatus(row),
			render: row => {
				const status = REQUEST_STATUS[requestStatus(row)];
				return (
					<span title={row.errorMessage ?? undefined}>
						<LabelCell
							lead={<Dot tone={status.tone} />}
							primary={status.label}
							secondary={<span style={mono}>{row.stopReason}</span>}
						/>
					</span>
				);
			},
		},
	];
}
