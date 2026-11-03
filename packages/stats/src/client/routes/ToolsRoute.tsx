import { Flex, Select, theme, type GlobalToken } from "antd";
import { useMemo, useState, type CSSProperties } from "react";
import { getRecentToolCalls, getToolDashboardStats } from "../api";
import { Legend, Sparkline, TimeChart, useHiddenSeries } from "../charts";
import { buildColorLookup, OTHER_COLOR } from "../data/colors";
import {
	formatCompact,
	formatErrorRate,
	formatEstimatedCost,
	formatInteger,
	formatKb,
	formatPayloadKb,
	formatPercent,
	formatRelativeTime,
	formatTimestamp,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { bucketAxis, rangeMeta, rangeWindowLabel } from "../data/range";
import { densify, pivotSeries } from "../data/series";
import { buildToolRows, toolCallSource, toolCallSourceSort, type ToolRowView } from "../data/view-models";
import { t, useT } from "../i18n";
import type { TimeRange, ToolCallDetail, ToolDashboardStats, ToolModelStats, ToolTimeSeriesPoint } from "../types";
import {
	Badge,
	Card,
	ChartSkeleton,
	type Column,
	EmptyState,
	errorRateTone,
	LabelCell,
	MeterCell,
	PageHeader,
	QueryView,
	Segmented,
	Stat,
	StatGrid,
	Swatch,
	Table,
	TableSkeleton,
	type Tone,
} from "../ui";

export interface ToolsRouteProps {
	active: boolean;
	range: TimeRange;
}

type CallMetric = "calls" | "errors";

type Translate = typeof t;

/** Tools stacked individually in the calls chart; the rest fold into "Other". */
const TOP_TOOLS = 6;

/** Label and tone for each tool origin kind. */
const TOOL_KIND_TONE: Record<ToolCallDetail["kind"], Tone> = {
	mcp: "accent",
	skill: "ok",
	script: "warn",
	builtin: "neutral",
};

/** Characters of the argument preview shown in a call-log row; the full preview is the cell's title. */
const ARGS_SNIPPET_LIMIT = 90;

function argsSnippet(preview: string | null): string {
	if (!preview) return "–";
	const compact = preview.replace(/\s+/g, " ").trim();
	return compact.length > ARGS_SNIPPET_LIMIT ? `${compact.slice(0, ARGS_SNIPPET_LIMIT - 1)}…` : compact;
}

const ATTRIBUTION_NOTE = t("tools.attribution");

const NO_CALLS = <EmptyState title={t("tools.empty")} />;

export function ToolsRoute({ active, range }: ToolsRouteProps) {
	const tt = useT();
	const { token } = theme.useToken();
	const tools = useQuery(["tools", range], ({ signal }) => getToolDashboardStats(range, signal), { enabled: active });
	const recentCalls = useQuery(["tools-recent", range], ({ signal }) => getRecentToolCalls(range, 100, signal), {
		enabled: active,
	});
	const [metric, setMetric] = useState<CallMetric>("calls");
	const [hidden, toggleHidden] = useHiddenSeries();
	const [pickedTool, setToolFilter] = useState<string | null>(null);
	const meta = rangeMeta(range);

	const METRIC_OPTIONS = [
		{ value: "calls" as const, label: tt("tools.metric.calls") },
		{ value: "errors" as const, label: tt("tools.metric.errors") },
	];

	const view = useMemo(() => buildToolsView(tools.data, range, tt, token), [tools.data, range, tt, token]);
	// A pick from another range only applies while that tool still has calls.
	const toolFilter = pickedTool !== null && view.toolNames.includes(pickedTool) ? pickedTool : null;

	const chartSeries = metric === "calls" ? view.callSeries : view.errorSeries;
	const isEmpty = (data: ToolDashboardStats) => data.byTool.length === 0;
	const bucketLabel =
		meta.bucketMs < 3_600_000
			? tt("tools.bucket.minutes", { count: Math.round(meta.bucketMs / 60_000) })
			: meta.bucketMs < 86_400_000
				? tt("tools.bucket.hour")
				: tt("tools.bucket.day");

	return (
		<Flex vertical gap={20}>
			<PageHeader title={tt("nav.tools")} description={tt("tools.subtitle", { window: rangeWindowLabel(range) })} />

			<QueryView query={tools} skeleton={<ChartSkeleton height={112} />}>
				{() => {
					const totals = view.totals;
					return (
						<Flex vertical gap={16} data-stale={tools.stale}>
							<StatGrid min={190}>
								<Stat
									label={tt("tools.stat.calls")}
									value={formatInteger(totals.calls)}
									hint={tt("tools.stat.callsFailed", { count: formatInteger(totals.errors) })}
									spark={view.totalCalls}
								/>
								<Stat
									label={tt("tools.stat.distinct")}
									value={formatInteger(totals.tools)}
									hint={view.rows[0] ? tt("tools.stat.mostUsed", { name: view.rows[0].tool }) : undefined}
								/>
								<Stat
									label={tt("tools.stat.errorRate")}
									title={tt("tools.stat.errorRate.title")}
									value={formatErrorRate(totals.calls > 0 ? totals.errors / totals.calls : 0)}
									hint={tt("tools.stat.succeeded", { count: formatInteger(totals.calls - totals.errors) })}
									spark={view.totalErrors}
									sparkColor="var(--bad)"
								/>
								<Stat
									label={tt("tools.stat.tokens")}
									title={ATTRIBUTION_NOTE}
									value={formatCompact(Math.round(totals.tokens))}
									hint={tt("tools.stat.output", { count: formatCompact(Math.round(totals.output)) })}
								/>
								<Stat
									label={tt("tools.stat.cost")}
									title={tt("tools.stat.cost.title", { note: ATTRIBUTION_NOTE })}
									value={formatEstimatedCost(totals.cost, totals.unpriced)}
									hint={
										totals.unpriced > 0
											? tt("tools.stat.unpriced", { count: formatInteger(Math.round(totals.unpriced)) })
											: tt("tools.stat.apiEquivalent")
									}
								/>
							</StatGrid>
							<StatGrid min={150}>
								<Stat
									size="sm"
									label={tt("tools.stat.resultSize")}
									title={tt("tools.stat.resultSize.title", { count: formatInteger(totals.resultChars) })}
									value={formatPayloadKb(totals.resultChars / 1024)}
								/>
								<Stat
									size="sm"
									label={tt("tools.stat.argsSize")}
									title={tt("tools.stat.argsSize.title", { count: formatInteger(totals.argsChars) })}
									value={formatPayloadKb(totals.argsChars / 1024)}
								/>
								<Stat
									size="sm"
									label={tt("tools.stat.avgResult")}
									value={formatKb(totals.calls > 0 ? totals.resultChars / totals.calls / 1024 : 0)}
								/>
								<Stat
									size="sm"
									label={tt("tools.stat.avgArgs")}
									value={formatKb(totals.calls > 0 ? totals.argsChars / totals.calls / 1024 : 0)}
								/>
							</StatGrid>
						</Flex>
					);
				}}
			</QueryView>

			<Card
				index={1}
				title={metric === "calls" ? tt("tools.chart.calls") : tt("tools.chart.errors")}
				description={tt("tools.chart.perBucket", { bucket: bucketLabel, count: TOP_TOOLS })}
				actions={<Segmented size="sm" options={METRIC_OPTIONS} value={metric} onChange={setMetric} />}
				stale={tools.stale}
			>
				<QueryView query={tools} skeleton={<ChartSkeleton height={260} />} isEmpty={isEmpty} empty={NO_CALLS}>
					{() => (
						<Flex vertical gap={12}>
							<TimeChart
								buckets={view.buckets}
								bucketMs={meta.bucketMs}
								series={chartSeries}
								hidden={hidden}
								height={260}
								formatTooltip={formatInteger}
								emptyLabel={metric === "errors" ? tt("tools.chart.noErrors") : undefined}
							/>
							<Legend
								items={chartSeries.map(s => ({
									key: s.key,
									label: s.label,
									color: s.color,
									value: formatCompact(s.values.reduce<number>((sum, v) => sum + (v ?? 0), 0)),
								}))}
								hidden={hidden}
								onToggle={toggleHidden}
							/>
						</Flex>
					)}
				</QueryView>
			</Card>

			<Card
				index={2}
				title={tt("tools.byTool.title")}
				description={tt("tools.byTool.description", { note: ATTRIBUTION_NOTE })}
				flush
				stale={tools.stale}
			>
				<QueryView query={tools} skeleton={<TableSkeleton rows={8} />} isEmpty={isEmpty} empty={NO_CALLS}>
					{() => (
						<Table
							rows={view.rows}
							rowKey={row => row.tool}
							columns={view.toolColumns}
							initialSort={{ key: "calls", dir: "desc" }}
							limit={20}
							selectedKey={toolFilter}
							onRowClick={row => setToolFilter(prev => (prev === row.tool ? null : row.tool))}
							dense
						/>
					)}
				</QueryView>
			</Card>

			<Card
				index={3}
				title={tt("tools.byToolModel.title")}
				description={tt("tools.byToolModel.description")}
				flush
				stale={tools.stale}
				actions={
					<Select
						style={{ width: 200 }}
						aria-label={tt("tools.filter.aria")}
						placeholder={tt("tools.filter.all")}
						allowClear
						value={toolFilter ?? undefined}
						onChange={v => setToolFilter(v ?? null)}
						options={view.toolNames.map(name => ({ value: name, label: name }))}
					/>
				}
			>
				<QueryView query={tools} skeleton={<TableSkeleton rows={8} />} isEmpty={isEmpty} empty={NO_CALLS}>
					{data => <ToolModelTable rows={data.byToolModel} tool={toolFilter} colors={view.colors} />}
				</QueryView>
			</Card>

			<Card
				index={4}
				title={tt("tools.recent.title")}
				description={tt("tools.recent.description", { window: rangeWindowLabel(range) })}
				flush
				stale={recentCalls.stale}
			>
				<QueryView
					query={recentCalls}
					skeleton={<TableSkeleton rows={8} />}
					isEmpty={calls => calls.length === 0}
					empty={NO_CALLS}
				>
					{calls => <RecentToolCallsTable rows={calls} />}
				</QueryView>
			</Card>
		</Flex>
	);
}

/** Newest calls with source, target and argument preview; the session drawer holds the full payload. */
function RecentToolCallsTable({ rows }: { rows: ToolCallDetail[] }) {
	const tt = useT();
	const { token } = theme.useToken();
	const columns = useMemo<Column<ToolCallDetail>[]>(() => {
		const mono: CSSProperties = { fontFamily: token.fontFamilyCode };
		const num: CSSProperties = { fontVariantNumeric: "tabular-nums" };
		const muted: CSSProperties = { color: token.colorTextSecondary };
		const dim: CSSProperties = { color: token.colorTextTertiary };
		const truncate: CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 };
		const toolName: CSSProperties = { ...mono, ...truncate, display: "inline-block", maxWidth: 220 };
		return [
			{
				key: "time",
				header: tt("tools.col.when"),
				sort: row => row.timestamp,
				render: row => (
					<span style={muted} title={formatTimestamp(row.timestamp)}>
						{formatRelativeTime(row.timestamp)}
					</span>
				),
			},
			{
				key: "tool",
				header: tt("tools.col.tool"),
				sort: row => row.tool,
				render: row => (
					<Flex align="center" gap={8}>
						<span style={toolName} title={row.tool}>
							{row.tool}
						</span>
						<Badge tone={TOOL_KIND_TONE[row.kind]}>{row.kind}</Badge>
						{row.isError === true && <Badge tone="bad">{tt("tools.col.error")}</Badge>}
					</Flex>
				),
			},
			{
				key: "source",
				header: tt("tools.col.source"),
				sort: row => toolCallSourceSort(row),
				render: row => <span style={truncate}>{toolCallSource(row, tt)}</span>,
			},
			{
				key: "target",
				header: tt("tools.col.target"),
				title: tt("tools.col.target.title"),
				render: row =>
					row.target ? (
						<span style={{ ...mono, ...muted, ...truncate, display: "block", maxWidth: 280 }} title={row.target}>
							{row.target}
						</span>
					) : (
						<span style={dim}>–</span>
					),
			},
			{
				key: "args",
				header: tt("tools.col.args"),
				title: tt("tools.col.args.title"),
				render: row =>
					row.argsPreview ? (
						<span
							style={{ ...mono, ...muted, ...truncate, display: "block", maxWidth: 320 }}
							title={row.argsPreview}
						>
							{argsSnippet(row.argsPreview)}
						</span>
					) : (
						<span style={dim}>–</span>
					),
			},
			{
				key: "result",
				header: tt("tools.col.result"),
				title: tt("tools.col.result.title"),
				align: "right",
				sort: row => row.resultChars ?? -1,
				render: row =>
					row.resultChars === null ? (
						<span style={dim}>–</span>
					) : (
						<span style={{ ...num, ...muted }}>{formatKb(row.resultChars / 1024)}</span>
					),
			},
		];
	}, [tt, token]);
	return (
		<Table
			rows={rows}
			rowKey={row => row.id ?? `${row.sessionFile}:${row.toolCallId}`}
			columns={columns}
			initialSort={{ key: "time", dir: "desc" }}
			limit={50}
			dense
		/>
	);
}

// ---------------------------------------------------------------------------
// View model
// ---------------------------------------------------------------------------

interface ToolTotals {
	calls: number;
	errors: number;
	tools: number;
	tokens: number;
	output: number;
	cost: number;
	unpriced: number;
	resultChars: number;
	argsChars: number;
}

function buildToolsView(data: ToolDashboardStats | null, range: TimeRange, tt: Translate, token: GlobalToken) {
	const byTool = data?.byTool ?? [];
	const points = data?.series ?? [];
	const rows = buildToolRows(byTool).sort((a, b) => b.calls - a.calls);
	const colors = buildColorLookup(byTool.map(t => ({ key: t.tool, weight: t.calls })));
	const buckets = bucketAxis(
		range,
		points.map(p => p.timestamp),
	);

	const totals: ToolTotals = {
		calls: 0,
		errors: 0,
		tools: byTool.length,
		tokens: 0,
		output: 0,
		cost: 0,
		unpriced: 0,
		resultChars: 0,
		argsChars: 0,
	};
	for (const tool of byTool) {
		totals.calls += tool.calls;
		totals.errors += tool.errors;
		totals.tokens += tool.totalTokensShare;
		totals.output += tool.outputTokensShare;
		totals.cost += tool.costShare;
		totals.unpriced += tool.unpricedRequestsShare;
		totals.resultChars += tool.resultChars;
		totals.argsChars += tool.argsChars;
	}

	// Every tool keeps its table swatch color in both metrics; zero slots become
	// gaps so the tooltip lists only tools active in that bucket.
	const [callSeries, errorSeries] = [(p: ToolTimeSeriesPoint) => p.calls, (p: ToolTimeSeriesPoint) => p.errors].map(
		value =>
			pivotSeries(points, { buckets, key: p => p.tool, value, limit: TOP_TOOLS, colors }).map(s => ({
				...s,
				values: s.values.map(v => v || null),
			})),
	);
	// Unlimited pivot for the per-row sparklines.
	const trends = new Map(
		pivotSeries(points, { buckets, key: p => p.tool, value: p => p.calls }).map(s => [s.key, s.values as number[]]),
	);

	const maxCalls = rows[0]?.calls ?? 0;
	const toolColumns = buildToolColumns(tt, token, maxCalls, colors, trends);

	return {
		rows,
		colors,
		buckets,
		totals,
		callSeries,
		errorSeries,
		totalCalls: densify(points, buckets, p => p.calls),
		totalErrors: densify(points, buckets, p => p.errors),
		toolNames: rows.map(r => r.tool).sort((a, b) => a.localeCompare(b)),
		toolColumns,
	};
}

function buildToolColumns(
	tt: Translate,
	token: GlobalToken,
	maxCalls: number,
	colors: ReadonlyMap<string, string>,
	trends: ReadonlyMap<string, number[]>,
): Column<ToolRowView>[] {
	const mono: CSSProperties = { fontFamily: token.fontFamilyCode };
	const num: CSSProperties = { fontVariantNumeric: "tabular-nums" };
	const muted: CSSProperties = { color: token.colorTextSecondary };
	const dim: CSSProperties = { color: token.colorTextTertiary };
	const truncate: CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 };
	const toolName: CSSProperties = { ...mono, ...truncate, display: "inline-block", maxWidth: 220 };
	const share: CSSProperties = { display: "inline-block", minWidth: 32, marginLeft: 8, textAlign: "right" };
	return [
		{
			key: "tool",
			header: tt("tools.col.tool"),
			sort: row => row.tool,
			render: row => (
				<Flex align="center" gap={8}>
					<Swatch color={colors.get(row.tool) ?? OTHER_COLOR} />
					<span style={toolName} title={row.tool}>
						{row.tool}
					</span>
				</Flex>
			),
		},
		{
			key: "trend",
			header: tt("tools.col.trend"),
			title: tt("tools.col.trend.title"),
			render: row => {
				const values = trends.get(row.tool);
				return values && values.length > 1 ? (
					<Sparkline values={values} width={80} height={20} color={colors.get(row.tool) ?? OTHER_COLOR} />
				) : (
					<span style={dim}>–</span>
				);
			},
		},
		{
			key: "calls",
			header: tt("tools.col.calls"),
			align: "right",
			sort: row => row.calls,
			render: row => (
				<MeterCell
					value={row.calls}
					max={maxCalls}
					display={
						<span title={tt("tools.col.callsShare", { share: formatPercent(row.callFraction) })}>
							{formatInteger(row.calls)}
							<span style={{ ...dim, ...share }}>{formatPercent(row.callFraction, 0)}</span>
						</span>
					}
				/>
			),
		},
		{
			key: "errorRate",
			header: tt("tools.col.errors"),
			title: tt("tools.col.errors.title"),
			align: "right",
			sort: row => row.errorRate,
			render: row => (
				<Flex align="center" gap={8} justify="flex-end">
					<span style={{ ...num, ...dim }}>{formatInteger(row.errors)}</span>
					<Badge tone={row.errors > 0 ? errorRateTone(row.errorRate) : "neutral"} mono>
						{formatErrorRate(row.errorRate)}
					</Badge>
				</Flex>
			),
		},
		{
			key: "args",
			header: tt("tools.col.argsShort"),
			title: tt("tools.col.argsSize.title"),
			align: "right",
			sort: row => row.argsChars,
			render: row => (
				<span
					style={num}
					title={tt("tools.col.sizeChars", { count: formatInteger(row.argsChars), size: formatKb(row.argsKb) })}
				>
					{formatPayloadKb(row.argsKb)}
				</span>
			),
		},
		{
			key: "result",
			header: tt("tools.col.result"),
			title: tt("tools.col.result.title"),
			align: "right",
			sort: row => row.resultChars,
			render: row => (
				<span
					style={num}
					title={tt("tools.col.sizeChars", {
						count: formatInteger(row.resultChars),
						size: formatKb(row.resultKb),
					})}
				>
					{formatPayloadKb(row.resultKb)}
				</span>
			),
		},
		{
			key: "avgResult",
			header: tt("tools.col.resultPerCall"),
			title: tt("tools.col.resultPerCall.title"),
			align: "right",
			sort: row => row.avgResultChars,
			render: row => <span style={{ ...num, ...muted }}>{formatKb(row.avgResultChars / 1024)}</span>,
		},
		{
			key: "tokens",
			header: tt("tools.col.tokens"),
			title: ATTRIBUTION_NOTE,
			align: "right",
			sort: row => row.totalTokensShare,
			render: row => (
				<span style={num} title={tt("tools.col.tokensShare", { share: formatPercent(row.tokenFraction) })}>
					{formatCompact(Math.round(row.totalTokensShare))}
					<span style={{ ...dim, ...share }}>{formatPercent(row.tokenFraction, 0)}</span>
				</span>
			),
		},
		{
			key: "cost",
			header: tt("tools.col.cost"),
			title: tt("tools.stat.cost.title", { note: ATTRIBUTION_NOTE }),
			align: "right",
			sort: row => row.costShare,
			render: row => (
				<span style={num} title={tt("tools.col.costShare", { share: formatPercent(row.costFraction) })}>
					{formatEstimatedCost(row.costShare, row.unpricedRequestsShare)}
					<span style={{ ...dim, ...share }}>{formatPercent(row.costFraction, 0)}</span>
				</span>
			),
		},
		{
			key: "lastUsed",
			header: tt("tools.col.lastUsed"),
			align: "right",
			sort: row => row.lastUsed,
			render: row => <span style={muted}>{formatRelativeTime(row.lastUsed)}</span>,
		},
	];
}

// ---------------------------------------------------------------------------
// Tool × model breakdown
// ---------------------------------------------------------------------------

interface ToolModelRow extends ToolModelStats {
	errorRate: number;
}

function ToolModelTable({
	rows,
	tool,
	colors,
}: {
	rows: ToolModelStats[];
	tool: string | null;
	colors: ReadonlyMap<string, string>;
}) {
	const tt = useT();
	const { token } = theme.useToken();
	const filtered = useMemo<ToolModelRow[]>(
		() =>
			(tool === null ? rows : rows.filter(r => r.tool === tool)).map(r => ({
				...r,
				errorRate: r.calls > 0 ? r.errors / r.calls : 0,
			})),
		[rows, tool],
	);
	const columns = useMemo<Column<ToolModelRow>[]>(() => {
		const mono: CSSProperties = { fontFamily: token.fontFamilyCode };
		const num: CSSProperties = { fontVariantNumeric: "tabular-nums" };
		const muted: CSSProperties = { color: token.colorTextSecondary };
		const dim: CSSProperties = { color: token.colorTextTertiary };
		const truncate: CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 };
		const toolName: CSSProperties = { ...mono, ...truncate, display: "inline-block", maxWidth: 220 };
		const maxCalls = filtered.reduce((max, r) => Math.max(max, r.calls), 0);
		return [
			{
				key: "tool",
				header: tt("tools.col.tool"),
				sort: row => row.tool,
				render: row => (
					<Flex align="center" gap={8}>
						<Swatch color={colors.get(row.tool) ?? OTHER_COLOR} />
						<span style={toolName} title={row.tool}>
							{row.tool}
						</span>
					</Flex>
				),
			},
			{
				key: "model",
				header: tt("tools.col.model"),
				sort: row => row.model,
				render: row => (
					<LabelCell primary={<span style={mono}>{row.model || tt("tools.unknownModel")}</span>} secondary={row.provider} />
				),
			},
			{
				key: "calls",
				header: tt("tools.col.calls"),
				align: "right",
				sort: row => row.calls,
				render: row => <MeterCell value={row.calls} max={maxCalls} display={formatInteger(row.calls)} />,
			},
			{
				key: "errorRate",
				header: tt("tools.col.errors"),
				title: tt("tools.col.errors.title"),
				align: "right",
				sort: row => row.errorRate,
				render: row => (
					<Flex align="center" gap={8} justify="flex-end">
						<span style={{ ...num, ...dim }}>{formatInteger(row.errors)}</span>
						<Badge tone={row.errors > 0 ? errorRateTone(row.errorRate) : "neutral"} mono>
							{formatErrorRate(row.errorRate)}
						</Badge>
					</Flex>
				),
			},
			{
				key: "result",
				header: tt("tools.col.result"),
				title: tt("tools.col.result.title"),
				align: "right",
				sort: row => row.resultChars,
				render: row => <span style={num}>{formatPayloadKb(row.resultKb)}</span>,
			},
			{
				key: "tokens",
				header: tt("tools.col.tokens"),
				title: ATTRIBUTION_NOTE,
				align: "right",
				sort: row => row.totalTokensShare,
				render: row => <span style={num}>{formatCompact(Math.round(row.totalTokensShare))}</span>,
			},
			{
				key: "cost",
				header: tt("tools.col.cost"),
				title: tt("tools.stat.cost.title", { note: ATTRIBUTION_NOTE }),
				align: "right",
				sort: row => row.costShare,
				render: row => <span style={num}>{formatEstimatedCost(row.costShare, row.unpricedRequestsShare)}</span>,
			},
			{
				key: "lastUsed",
				header: tt("tools.col.lastUsed"),
				align: "right",
				sort: row => row.lastUsed,
				render: row => <span style={muted}>{formatRelativeTime(row.lastUsed)}</span>,
			},
		];
	}, [filtered, colors, tt, token]);

	return (
		<Table
			rows={filtered}
			rowKey={row => `${row.tool}::${row.model}::${row.provider}`}
			columns={columns}
			initialSort={{ key: "calls", dir: "desc" }}
			limit={25}
			dense
			empty={<EmptyState title={tool ? tt("tools.emptyFor", { tool }) : tt("tools.empty")} />}
		/>
	);
}
