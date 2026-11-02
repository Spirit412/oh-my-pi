import { theme } from "antd";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { getModelDashboardStats } from "../api";
import { type ChartSeries, Legend, Sparkline, TimeChart, useHiddenSeries } from "../charts";
import { buildModelColorLookup, modelKey, OTHER_COLOR } from "../data/colors";
import {
	formatCompact,
	formatDurationMs,
	formatErrorRate,
	formatEstimatedCost,
	formatInteger,
	formatKb,
	formatPayloadKb,
	formatPercent,
	formatRelativeTime,
	formatTokensPerSecond,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { bucketAxis, rangeMeta, rangeWindowLabel } from "../data/range";
import { densify, pivotSeries } from "../data/series";
import {
	buildModelPerformanceLookup,
	type ModelPerformanceDataPoint,
	sumConversationTokens,
} from "../data/view-models";
import { useT } from "../i18n";
import type { ModelDashboardStats, ModelStats, TimeRange } from "../types";
import {
	Badge,
	Card,
	ChartSkeleton,
	type Column,
	EmptyState,
	errorRateTone,
	KeyValues,
	LabelCell,
	MeterCell,
	PageHeader,
	QueryView,
	Segmented,
	Skeleton,
	Stat,
	StatGrid,
	Swatch,
	Table,
	TableSkeleton,
} from "../ui";

export interface ModelsRouteProps {
	active: boolean;
	range: TimeRange;
}

/** The `t` translator from ../i18n; structural so column builders stay pure. */
type Translate = (key: string, params?: Record<string, string | number>) => string;

type ShareMode = "share" | "requests";

/** Models plotted individually in the share chart; the rest fold into "Other". */
const SHARE_LIMIT = 6;

export function ModelsRoute({ active, range }: ModelsRouteProps) {
	const t = useT();
	const query = useQuery(["models", range], ({ signal }) => getModelDashboardStats(range, signal), {
		enabled: active,
	});
	const meta = rangeMeta(range);
	const [mode, setMode] = useState<ShareMode>("share");
	const [hidden, toggleSeries] = useHiddenSeries();
	const [expandedKey, setExpandedKey] = useState<string | null>(null);
	const view = useMemo(() => (query.data ? buildModelsView(query.data, range) : null), [query.data, range]);
	const bucketWord = bucketName(t, meta.bucketMs);
	// Stable columns: a fresh array would make Table re-sort on every render.
	const columns = useMemo(
		() => (view ? buildModelColumns(t, view, expandedKey, bucketWord) : []),
		[t, view, expandedKey, bucketWord],
	);
	const shareOptions = useMemo(
		() => [
			{ value: "share" as const, label: t("models.share.modeShare") },
			{ value: "requests" as const, label: t("models.share.modeRequests") },
		],
		[t],
	);
	const isEmpty = (data: ModelDashboardStats) => data.byModel.length === 0;
	const empty = <EmptyState title={t("models.empty")} hint={t("models.emptyHint")} />;

	return (
		<div className="page">
			<PageHeader
				title={t("nav.models")}
				description={t("models.header", { range: rangeWindowLabel(range) })}
			/>

			<QueryView
				query={query}
				skeleton={<Skeleton height={112} style={{ borderRadius: 12 }} />}
				isEmpty={isEmpty}
				empty={empty}
			>
				{() =>
					view && (
						<div data-stale={query.stale}>
							<StatGrid min={200}>
								<Stat
									label={t("models.stat.used")}
									value={formatInteger(view.models.length)}
									hint={t("models.stat.acrossProviders", { count: view.providerCount })}
								/>
								<Stat
									label={t("models.stat.mostUsed")}
									title={view.top ? `${view.top.model} (${view.top.provider})` : undefined}
									value={view.top ? view.top.model : "–"}
									hint={
										view.top
											? t("models.stat.mostUsedHint", {
													share: formatPercent(view.top.totalRequests / Math.max(1, view.totalRequests)),
													provider: view.top.provider,
												})
											: undefined
									}
								/>
								<Stat
									label={t("models.stat.requests")}
									value={formatInteger(view.totalRequests)}
									hint={t("models.stat.failed", { count: view.failedRequests })}
									spark={view.requestTotals}
								/>
								<Stat
									label={t("models.stat.cost")}
									title={t("models.stat.costTitle")}
									value={formatEstimatedCost(view.totalCost, view.unpricedRequests)}
									hint={
										view.unpricedRequests > 0
											? t("models.stat.unpriced", { count: view.unpricedRequests })
											: undefined
									}
								/>
							</StatGrid>
						</div>
					)
				}
			</QueryView>

			<Card
				index={1}
				title={t("models.share.title")}
				description={
					mode === "share"
						? t("models.share.descShare", { bucket: bucketWord })
						: t("models.share.descRequests", { bucket: bucketWord })
				}
				actions={
					<Segmented
						size="sm"
						options={shareOptions}
						value={mode}
						onChange={setMode}
						aria-label={t("models.share.aria")}
					/>
				}
				stale={query.stale}
			>
				<QueryView query={query} skeleton={<ChartSkeleton height={260} />} isEmpty={isEmpty} empty={empty}>
					{() =>
						view && (
							<div className="stack" style={{ gap: 12 }}>
								<TimeChart
									buckets={view.buckets}
									bucketMs={meta.bucketMs}
									series={mode === "share" ? view.shareSeries : view.countSeries}
									hidden={hidden}
									height={260}
									yMax={mode === "share" ? 1 : undefined}
									format={mode === "share" ? v => formatPercent(v, 0) : formatCompact}
									formatTooltip={mode === "share" ? v => formatPercent(v) : formatInteger}
									showTotal={mode === "requests"}
								/>
								<Legend
									items={view.countSeries.map(s => ({
										key: s.key,
										label: s.label,
										color: s.color,
										value: formatPercent(sumValues(s.values) / Math.max(1, sumValues(view.requestTotals))),
									}))}
									hidden={hidden}
									onToggle={toggleSeries}
								/>
							</div>
						)
					}
				</QueryView>
			</Card>

			<Card
				index={2}
				title={t("models.table.title")}
				description={t("models.table.desc")}
				stale={query.stale}
				flush
			>
				<QueryView query={query} skeleton={<TableSkeleton rows={8} />} isEmpty={isEmpty} empty={empty}>
					{() =>
						view && (
							<Table
								rows={view.models}
								rowKey={row => modelKey(row.model, row.provider)}
								columns={columns}
								initialSort={{ key: "requests", dir: "desc" }}
								limit={25}
								onRowClick={row => {
									const key = modelKey(row.model, row.provider);
									setExpandedKey(prev => (prev === key ? null : key));
								}}
								selectedKey={expandedKey}
								expanded={row => {
									const key = modelKey(row.model, row.provider);
									return key === expandedKey ? (
										<ModelDetail
											model={row}
											color={view.swatches.get(key) ?? "var(--chart-primary)"}
											points={view.performance.get(key) ?? []}
											bucketMs={meta.bucketMs}
											bucketWord={bucketWord}
										/>
									) : null;
								}}
							/>
						)
					}
				</QueryView>
			</Card>
		</div>
	);
}

interface ModelsView {
	models: ModelStats[];
	top: ModelStats | undefined;
	/** Chart color of each individually plotted model; the rest share "Other" gray. */
	swatches: Map<string, string>;
	labels: Map<string, string>;
	providerCount: number;
	totalRequests: number;
	failedRequests: number;
	totalCost: number;
	unpricedRequests: number;
	maxRequests: number;
	buckets: number[];
	requestTotals: number[];
	/** Top-N + Other requests per bucket (stacked counts). */
	countSeries: ChartSeries[];
	/** `countSeries` as a fraction of each bucket's total. */
	shareSeries: ChartSeries[];
	/** Dense requests per bucket for every model, for the table sparkline. */
	trends: Map<string, readonly (number | null)[]>;
	performance: Map<string, ModelPerformanceDataPoint[]>;
}

function buildModelsView(data: ModelDashboardStats, range: TimeRange): ModelsView {
	const models = data.byModel;
	const colors = buildModelColorLookup(models);
	const labels = modelLabels(models);
	const buckets = bucketAxis(
		range,
		data.modelSeries.map(p => p.timestamp),
	);
	const requestTotals = densify(data.modelSeries, buckets, p => p.requests);
	const pivot = {
		buckets,
		key: (p: { model: string; provider: string }) => modelKey(p.model, p.provider),
		label: (key: string) => labels.get(key) ?? key,
		value: (p: { requests: number }) => p.requests,
		colors,
	};
	// Zero slots become gaps so tooltips list only the models active in that bucket.
	const countSeries = pivotSeries(data.modelSeries, { ...pivot, limit: SHARE_LIMIT }).map(s => ({
		...s,
		values: s.values.map(v => v || null),
	}));
	const shareSeries = countSeries.map(s => ({
		...s,
		values: s.values.map((v, i) => (v === null ? null : v / requestTotals[i])),
	}));
	const trends = new Map(pivotSeries(data.modelSeries, pivot).map(s => [s.key, s.values]));

	let top: ModelStats | undefined;
	let totalRequests = 0;
	let failedRequests = 0;
	let totalCost = 0;
	let unpricedRequests = 0;
	for (const m of models) {
		if (!top || m.totalRequests > top.totalRequests) top = m;
		totalRequests += m.totalRequests;
		failedRequests += m.failedRequests;
		totalCost += m.totalCost;
		unpricedRequests += m.unpricedRequests;
	}

	return {
		models,
		top,
		swatches: new Map(countSeries.filter(s => s.key !== "__other__").map(s => [s.key, s.color])),
		labels,
		providerCount: new Set(models.map(m => m.provider)).size,
		totalRequests,
		failedRequests,
		totalCost,
		unpricedRequests,
		maxRequests: top?.totalRequests ?? 0,
		buckets,
		requestTotals,
		countSeries,
		shareSeries,
		trends,
		performance: buildModelPerformanceLookup(data.modelPerformanceSeries),
	};
}

/** Model name, qualified by provider only when the same model id is served by several. */
function modelLabels(models: readonly ModelStats[]): Map<string, string> {
	const providersPerModel = new Map<string, number>();
	for (const m of models) providersPerModel.set(m.model, (providersPerModel.get(m.model) ?? 0) + 1);
	return new Map(
		models.map(m => [
			modelKey(m.model, m.provider),
			(providersPerModel.get(m.model) ?? 0) > 1 ? `${m.model} · ${m.provider}` : m.model,
		]),
	);
}

function buildModelColumns(t: Translate, view: ModelsView, expandedKey: string | null, bucketWord: string): Column<ModelStats>[] {
	return [
		{
			key: "expand",
			header: "",
			width: 28,
			render: row => <ExpandChevron open={modelKey(row.model, row.provider) === expandedKey} />,
		},
		{
			key: "model",
			header: t("models.col.model"),
			sort: row => row.model,
			render: row => (
				<LabelCell
					lead={<Swatch color={view.swatches.get(modelKey(row.model, row.provider)) ?? OTHER_COLOR} />}
					primary={<span className="mono">{row.model}</span>}
					secondary={row.provider}
				/>
			),
		},
		{
			key: "requests",
			header: t("models.col.requests"),
			align: "right",
			sort: row => row.totalRequests,
			render: row => (
				<MeterCell
					value={row.totalRequests}
					max={view.maxRequests}
					display={formatInteger(row.totalRequests)}
					color={view.swatches.get(modelKey(row.model, row.provider)) ?? OTHER_COLOR}
				/>
			),
		},
		{
			key: "cost",
			header: t("models.col.cost"),
			title: t("models.col.costTitle"),
			align: "right",
			sort: row => row.totalCost,
			render: row => <span className="num">{formatEstimatedCost(row.totalCost, row.unpricedRequests)}</span>,
		},
		{
			key: "tokens",
			header: t("models.col.tokens"),
			title: t("models.tokensTitle"),
			align: "right",
			sort: row => sumConversationTokens(row),
			render: row => {
				const tokens = sumConversationTokens(row);
				return (
					<span className="num" title={formatInteger(tokens)}>
						{formatCompact(tokens)}
					</span>
				);
			},
		},
		{
			key: "payload",
			header: t("models.col.payload"),
			title: t("models.col.payloadTitle"),
			align: "right",
			sort: row => row.totalRequestKb + row.totalResponseKb,
			render: row => (
				<span
					className="num muted"
					title={t("models.cell.payloadTitle", {
						request: formatKb(row.totalRequestKb),
						response: formatKb(row.totalResponseKb),
					})}
				>
					{formatPayloadKb(row.totalRequestKb)} / {formatPayloadKb(row.totalResponseKb)}
				</span>
			),
		},
		{
			key: "cache",
			header: t("models.col.cacheRate"),
			title: t("models.col.cacheRateTitle"),
			align: "right",
			sort: row => row.cacheRate,
			render: row => <span className="num">{formatPercent(row.cacheRate)}</span>,
		},
		{
			key: "errors",
			header: t("models.col.errors"),
			align: "right",
			sort: row => row.errorRate,
			render: row =>
				row.failedRequests === 0 ? (
					<span className="num dim">{t("models.cell.noErrors")}</span>
				) : (
					<span title={t("models.cell.failed", { count: row.failedRequests })}>
						<Badge tone={errorRateTone(row.errorRate)} mono>
							{formatErrorRate(row.errorRate)}
						</Badge>
					</span>
				),
		},
		{
			key: "tps",
			header: t("models.col.tps"),
			title: t("models.col.tpsTitle"),
			align: "right",
			sort: row => row.avgTokensPerSecond ?? -1,
			render: row => <span className="num">{formatTokensPerSecond(row.avgTokensPerSecond)}</span>,
		},
		{
			key: "ttft",
			header: t("models.col.ttft"),
			title: t("models.col.ttftTitle"),
			align: "right",
			sort: row => row.avgTtft ?? -1,
			render: row => <span className="num">{formatDurationMs(row.avgTtft)}</span>,
		},
		{
			key: "trend",
			header: t("models.col.trend"),
			title: t("models.col.trendTitle", { bucket: bucketWord }),
			width: 112,
			render: row => {
				const key = modelKey(row.model, row.provider);
				const values = view.trends.get(key);
				return values ? (
					<Sparkline
						values={values.map(v => v ?? 0)}
						color={view.swatches.get(key) ?? OTHER_COLOR}
						width={96}
						height={22}
					/>
				) : (
					<span className="dim">–</span>
				);
			},
		},
	];
}

/** Rotating expand affordance for a model row. */
function ExpandChevron({ open }: { open: boolean }) {
	const { token } = theme.useToken();
	return (
		<span
			style={{
				display: "inline-flex",
				color: open ? token.colorText : token.colorTextTertiary,
				transform: open ? "rotate(90deg)" : undefined,
				transition: `transform 200ms ${token.motionEaseInOut}`,
			}}
		>
			<ChevronRight size={14} />
		</span>
	);
}

function ModelDetail({
	model,
	color,
	points,
	bucketMs,
	bucketWord,
}: {
	model: ModelStats;
	color: string;
	points: readonly ModelPerformanceDataPoint[];
	bucketMs: number;
	bucketWord: string;
}) {
	const t = useT();
	const { token } = theme.useToken();
	const [hidden, toggle] = useHiddenSeries();
	const series: ChartSeries[] = [
		{
			key: "tps",
			label: t("models.detail.seriesTps"),
			color,
			kind: points.length > 1 ? "line" : "bars",
			values: points.map(p => p.avgTokensPerSecond),
		},
		{
			key: "ttft",
			label: t("models.detail.seriesTtft"),
			color: OTHER_COLOR,
			kind: points.length > 1 ? "line" : "bars",
			axis: "right",
			dashed: true,
			values: points.map(p => p.avgTtftSeconds),
		},
	];

	return (
		<div
			className="rise"
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
				gap: 24,
				padding: "16px 16px 18px 44px",
				background: token.colorFillTertiary,
				borderBottom: `1px solid ${token.colorBorderSecondary}`,
			}}
		>
			<div className="stack" style={{ gap: 16 }}>
				<div>
					<div className="section-label">{t("models.detail.efficiency")}</div>
					<KeyValues
						items={[
							{
								key: "err",
								label: t("models.detail.errorRate"),
								value: (
									<span className={`tone-${errorRateTone(model.errorRate)}`}>
										{formatErrorRate(model.errorRate)}{" "}
										<span className="dim">
											{t("models.detail.failed", { count: model.failedRequests })}
										</span>
									</span>
								),
							},
							{ key: "cache", label: t("models.detail.cacheRate"), value: formatPercent(model.cacheRate) },
							{
								key: "savings",
								label: t("models.detail.cacheSavings"),
								value: (
									<span className={model.cacheSavings < 0 ? "tone-bad" : undefined}>
										{formatPercent(model.cacheSavings)}
									</span>
								),
							},
							{
								key: "premium",
								label: t("models.detail.premiumRequests"),
								value: formatInteger(Math.round(model.totalPremiumRequests * 100) / 100),
							},
						]}
					/>
				</div>
				<div>
					<div className="section-label">{t("models.detail.latency")}</div>
					<KeyValues
						items={[
							{ key: "dur", label: t("models.detail.avgDuration"), value: formatDurationMs(model.avgDuration) },
							{ key: "ttft", label: t("models.detail.avgTtft"), value: formatDurationMs(model.avgTtft) },
							{ key: "tps", label: t("models.detail.tps"), value: formatTokensPerSecond(model.avgTokensPerSecond) },
						]}
					/>
				</div>
				<div>
					<div className="section-label">{t("models.detail.tokens")}</div>
					<KeyValues
						items={[
							{ key: "in", label: t("models.detail.input"), value: formatCompact(model.totalInputTokens) },
							{ key: "cr", label: t("models.detail.cacheRead"), value: formatCompact(model.totalCacheReadTokens) },
							{ key: "cw", label: t("models.detail.cacheWrite"), value: formatCompact(model.totalCacheWriteTokens) },
							{ key: "out", label: t("models.detail.output"), value: formatCompact(model.totalOutputTokens) },
						]}
					/>
				</div>
				<div className="micro dim">
					{t("models.detail.seen", {
						first: formatRelativeTime(model.firstTimestamp),
						last: formatRelativeTime(model.lastTimestamp),
					})}
				</div>
			</div>
			<div className="stack" style={{ gap: 10 }}>
				<div className="row" style={{ justifyContent: "space-between" }}>
					<div className="section-label" style={{ marginBottom: 0 }}>
						{t("models.detail.chartTitle", { bucket: bucketWord })}
					</div>
					<Legend
						items={series.map(s => ({ key: s.key, label: s.label, color: s.color }))}
						hidden={hidden}
						onToggle={toggle}
					/>
				</div>
				{points.length === 0 ? (
					<EmptyState title={t("models.detail.empty")} hint={t("models.detail.emptyHint")} />
				) : (
					<TimeChart
						buckets={points.map(p => p.timestamp)}
						bucketMs={bucketMs}
						series={series}
						hidden={hidden}
						stacked={false}
						height={240}
						format={formatCompact}
						formatTooltip={v => `${formatTokensPerSecond(v)} ${t("models.detail.tpsUnit")}`}
						formatRight={v => t("format.secondsSuffix", { value: Number(v.toFixed(2)) })}
						tooltipExtra={i => (
							<div className="chart-tooltip-row chart-tooltip-total">
								<span className="chart-tooltip-label">{t("models.detail.tooltipRequests")}</span>
								<span className="chart-tooltip-value">{formatInteger(points[i].requests)}</span>
							</div>
						)}
					/>
				)}
			</div>
		</div>
	);
}

function bucketName(t: Translate, bucketMs: number): string {
	if (bucketMs < 3_600_000) return t("models.bucket.minutes");
	if (bucketMs < 86_400_000) return t("models.bucket.hour");
	return t("models.bucket.day");
}

function sumValues(values: readonly (number | null)[]): number {
	let total = 0;
	for (const v of values) total += v ?? 0;
	return total;
}
