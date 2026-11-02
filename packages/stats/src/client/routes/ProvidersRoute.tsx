import { Select, theme } from "antd";
import { type ReactNode, useMemo, useState } from "react";
import { getProviderDashboardStats, getProviderWindowStats } from "../api";
import { Chart, type ChartSeries, Legend, ShareBar, TimeChart, useHiddenSeries } from "../charts";
import { buildColorLookup, OTHER_COLOR, SERIES_COLORS } from "../data/colors";
import {
	formatCompact,
	formatCost,
	formatErrorRate,
	formatEstimatedCost,
	formatInteger,
	formatKb,
	formatPayloadKb,
	formatPercent,
	formatRelativeTime,
	formatTokensPerSecond,
} from "../data/formatters";
import { type QueryResult, useQuery } from "../data/query";
import { bucketAxis, formatBucket, formatTick, rangeMeta, rangeWindowLabel } from "../data/range";
import { densify, pivotSeries } from "../data/series";
import { useT } from "../i18n";
import { formatDate } from "../i18n/dates";
import type {
	ProviderAggregate,
	ProviderHourlyPoint,
	ProviderWindowInsight,
	ProviderWindowStats,
	TimeRange,
	UsageWindowSeries,
} from "../types";
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
} from "../ui";

export interface ProvidersRouteProps {
	active: boolean;
	range: TimeRange;
}

/** The `t` translator from ../i18n; structural so column builders stay pure. */
type Translate = (key: string, params?: Record<string, string | number>) => string;

type BurnMetric = "tokens" | "cost" | "requests";

/** Providers stacked individually in the burn chart; the rest fold into "Other". */
const TOP_PROVIDERS = 6;

interface WindowRef {
	provider: string;
	windowKey: string;
}

export function ProvidersRoute({ active, range }: ProvidersRouteProps) {
	const t = useT();
	const stats = useQuery(["providers", range], ({ signal }) => getProviderDashboardStats(range, signal), {
		enabled: active,
	});
	const [metric, setMetric] = useState<BurnMetric>("tokens");
	const [hidden, toggleHidden] = useHiddenSeries();
	const meta = rangeMeta(range);

	// Subscription windows load independently: insights for every provider
	// first, then utilization series for the one provider being charted.
	const windows = useQuery(["provider-windows", range], ({ signal }) => getProviderWindowStats(range, null, signal), {
		enabled: active,
	});
	const [picked, setPicked] = useState<WindowRef | null>(null);
	const selected = resolveWindow(windows.data?.windowInsights ?? [], picked);
	const selectedProvider = selected?.provider ?? null;
	const accounts = useQuery(
		["provider-windows", range, selectedProvider],
		({ signal }) => getProviderWindowStats(range, selectedProvider, signal),
		{ enabled: active && selectedProvider !== null },
	);

	const view = useMemo(() => {
		const providers = stats.data?.providers ?? [];
		const points = stats.data?.series ?? [];
		const colors = buildColorLookup(providers.map(p => ({ key: p.provider, weight: p.totalTokens })));
		const buckets = bucketAxis(
			range,
			points.map(p => p.timestamp),
		);
		const totals = { requests: 0, failed: 0, tokens: 0, cost: 0, unpriced: 0 };
		for (const p of providers) {
			totals.requests += p.totalRequests;
			totals.failed += p.failedRequests;
			totals.tokens += p.totalTokens;
			totals.cost += p.totalCost;
			totals.unpriced += p.unpricedRequests;
		}
		// Zero slots become gaps so the tooltip lists only providers active in that bucket.
		const pivot = (value: (p: (typeof points)[number]) => number) =>
			pivotSeries(points, { buckets, key: p => p.provider, value, limit: TOP_PROVIDERS, colors }).map(s => ({
				...s,
				values: s.values.map(v => v || null),
			}));
		return {
			colors,
			buckets,
			totals,
			burn: {
				tokens: pivot(p => p.totalTokens),
				cost: pivot(p => p.cost),
				requests: pivot(p => p.requests),
			} satisfies Record<BurnMetric, ChartSeries[]>,
			spark: {
				tokens: densify(points, buckets, p => p.totalTokens),
				cost: densify(points, buckets, p => p.cost),
				requests: densify(points, buckets, p => p.requests),
			},
			topProvider: providers.reduce<ProviderAggregate | null>(
				(top, p) => (top === null || p.totalTokens > top.totalTokens ? p : top),
				null,
			),
		};
	}, [stats.data, range]);

	const burnSeries = view.burn[metric];
	const burnFormat = metric === "cost" ? (v: number) => formatCost(v) : formatCompact;
	const t2 = view.totals;
	const burnOptions = useMemo(
		() => [
			{ value: "tokens" as const, label: t("providers.burn.metricTokens") },
			{
				value: "cost" as const,
				label: t("providers.burn.metricCost"),
				title: t("providers.burn.metricCostTitle"),
			},
			{ value: "requests" as const, label: t("providers.burn.metricRequests") },
		],
		[t],
	);
	const burnBucket = bucketWord(t, meta.bucketMs);

	return (
		<div className="page">
			<PageHeader
				title={t("nav.providers")}
				description={t("providers.header", { range: rangeWindowLabel(range) })}
			/>

			<QueryView query={stats} skeleton={<ChartSkeleton height={112} />}>
				{({ providers }) => (
					<div data-stale={stats.stale}>
						<StatGrid min={190}>
							<Stat
								label={t("providers.stat.providers")}
								value={formatInteger(providers.length)}
								hint={view.topProvider ? t("providers.stat.mostTokens", { name: view.topProvider.provider }) : undefined}
							/>
							<Stat
								label={t("providers.stat.requests")}
								value={formatInteger(t2.requests)}
								hint={t("providers.stat.failed", { count: t2.failed })}
								spark={view.spark.requests}
							/>
							<Stat
								label={t("providers.stat.tokens")}
								title={t("providers.tokensTitle")}
								value={formatCompact(t2.tokens)}
								spark={view.spark.tokens}
							/>
							<Stat
								label={t("providers.stat.cost")}
								title={t("providers.stat.costTitle")}
								value={formatEstimatedCost(t2.cost, t2.unpriced)}
								hint={t2.unpriced > 0 ? t("providers.stat.unpriced", { count: t2.unpriced }) : undefined}
								spark={view.spark.cost}
								sparkColor="var(--chart-secondary)"
							/>
							<Stat
								label={t("providers.stat.errorRate")}
								value={formatErrorRate(t2.requests > 0 ? t2.failed / t2.requests : 0)}
								hint={t("providers.stat.succeeded", { count: t2.requests - t2.failed })}
							/>
						</StatGrid>
					</div>
				)}
			</QueryView>

			<Card
				index={1}
				title={t("providers.totals.title")}
				description={
					t2.unpriced > 0
						? t("providers.totals.descUnpriced", { count: t2.unpriced })
						: t("providers.totals.desc")
				}
				flush
				stale={stats.stale}
			>
				<QueryView query={stats} skeleton={<TableSkeleton rows={6} />}>
					{({ providers }) => <ProviderTotalsTable t={t} providers={providers} colors={view.colors} />}
				</QueryView>
			</Card>

			<div className="grid grid-main-side">
				<Card
					index={2}
					title={t("providers.burn.title")}
					description={
						metric === "cost" && t2.unpriced > 0
							? t("providers.burn.descUnpriced", { bucket: burnBucket })
							: t("providers.burn.desc", { bucket: burnBucket, count: TOP_PROVIDERS })
					}
					actions={<Segmented size="sm" options={burnOptions} value={metric} onChange={setMetric} />}
					stale={stats.stale}
				>
					<QueryView query={stats} skeleton={<ChartSkeleton height={260} />}>
						{() => (
							<div className="stack" style={{ gap: 12 }}>
								<TimeChart
									buckets={view.buckets}
									bucketMs={meta.bucketMs}
									series={burnSeries}
									hidden={hidden}
									height={260}
									format={burnFormat}
									formatTooltip={metric === "cost" ? v => formatCost(v) : formatInteger}
									emptyLabel={t("providers.burn.empty")}
								/>
								<Legend
									items={burnSeries.map(s => ({
										key: s.key,
										label: s.label,
										color: s.color,
										value: burnFormat(s.values.reduce<number>((sum, v) => sum + (v ?? 0), 0)),
									}))}
									hidden={hidden}
									onToggle={toggleHidden}
								/>
							</div>
						)}
					</QueryView>
				</Card>

				<QueryView query={stats} skeleton={<ChartSkeleton height={320} />}>
					{({ hourly, providers }) => <PeakHoursCard hourly={hourly} providers={providers} stale={stats.stale} />}
				</QueryView>
			</div>

			<Card
				index={4}
				title={t("providers.windows.title")}
				description={t("providers.windows.desc")}
				flush
				stale={windows.stale}
			>
				<QueryView query={windows} skeleton={<TableSkeleton rows={6} />}>
					{data => <WindowInsightsTable insights={data.windowInsights} selected={selected} onSelect={setPicked} />}
				</QueryView>
			</Card>

			<WindowUtilizationCard
				insights={windows.data?.windowInsights ?? null}
				accounts={accounts}
				selected={selected}
				onSelect={setPicked}
			/>
		</div>
	);
}

/**
 * The window charted below the insights table: the user's pick when it still
 * exists, else the first window of the picked provider, else the most-burned
 * window (the insights table's first row).
 */
function resolveWindow(insights: readonly ProviderWindowInsight[], picked: WindowRef | null): WindowRef | null {
	if (picked && insights.some(i => i.provider === picked.provider && i.windowKey === picked.windowKey)) return picked;
	const fallback =
		(picked && insights.find(i => i.provider === picked.provider)) ||
		insights.reduce<ProviderWindowInsight | undefined>(
			(top, i) => (top === undefined || i.fractionConsumed > top.fractionConsumed ? i : top),
			undefined,
		);
	return fallback ? { provider: fallback.provider, windowKey: fallback.windowKey } : null;
}

function bucketWord(t: Translate, bucketMs: number): string {
	if (bucketMs < 3_600_000) return t("providers.bucket.minutes");
	if (bucketMs < 86_400_000) return t("providers.bucket.hour");
	return t("providers.bucket.day");
}

// ---------------------------------------------------------------------------
// Provider totals
// ---------------------------------------------------------------------------

function buildTotalsColumns(
	t: Translate,
	providers: readonly ProviderAggregate[],
	colors: ReadonlyMap<string, string>,
): Column<ProviderAggregate>[] {
	let maxRequests = 0;
	let maxTokens = 0;
	let grandTokens = 0;
	for (const p of providers) {
		maxRequests = Math.max(maxRequests, p.totalRequests);
		maxTokens = Math.max(maxTokens, p.totalTokens);
		grandTokens += p.totalTokens;
	}
	return [
		{
			key: "provider",
			header: t("providers.col.provider"),
			sort: p => p.provider,
			render: p => (
				<span className="row" style={{ gap: 8 }}>
					<Swatch color={colors.get(p.provider) ?? OTHER_COLOR} />
					<span className="mono cell-primary">{p.provider}</span>
				</span>
			),
		},
		{
			key: "requests",
			header: t("providers.col.requests"),
			align: "right",
			sort: p => p.totalRequests,
			render: p => <MeterCell value={p.totalRequests} max={maxRequests} display={formatInteger(p.totalRequests)} />,
		},
		{
			key: "errors",
			header: t("providers.col.errorRate"),
			align: "right",
			sort: p => (p.totalRequests > 0 ? p.failedRequests / p.totalRequests : 0),
			render: p => {
				const rate = p.totalRequests > 0 ? p.failedRequests / p.totalRequests : 0;
				return (
					<span className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
						<span className="num dim">{formatInteger(p.failedRequests)}</span>
						<Badge tone={p.failedRequests > 0 ? errorRateTone(rate) : "neutral"} mono>
							{formatErrorRate(rate)}
						</Badge>
					</span>
				);
			},
		},
		{
			key: "models",
			header: t("providers.col.models"),
			title: t("providers.col.modelsTitle"),
			align: "right",
			sort: p => p.models,
			render: p => <span className="num">{formatInteger(p.models)}</span>,
		},
		{
			key: "tokens",
			header: t("providers.col.tokens"),
			title: t("providers.tokensTitle"),
			align: "right",
			sort: p => p.totalTokens,
			render: p => (
				<MeterCell
					value={p.totalTokens}
					max={maxTokens}
					display={formatCompact(p.totalTokens)}
					color={colors.get(p.provider)}
				/>
			),
		},
		{
			key: "payload",
			header: t("providers.col.payload"),
			title: t("providers.col.payloadTitle"),
			align: "right",
			sort: p => p.totalRequestKb + p.totalResponseKb,
			render: p => (
				<span
					className="num muted"
					title={t("providers.cell.payloadTitle", {
						request: formatKb(p.totalRequestKb),
						response: formatKb(p.totalResponseKb),
					})}
				>
					{formatPayloadKb(p.totalRequestKb)} / {formatPayloadKb(p.totalResponseKb)}
				</span>
			),
		},
		{
			key: "share",
			header: t("providers.col.share"),
			title: t("providers.col.shareTitle"),
			align: "right",
			sort: p => p.totalTokens,
			render: p => (
				<span className="num muted">{formatPercent(grandTokens > 0 ? p.totalTokens / grandTokens : 0)}</span>
			),
		},
		{
			key: "cost",
			header: t("providers.col.cost"),
			title: t("providers.col.costTitle"),
			align: "right",
			sort: p => p.totalCost,
			render: p => (
				<span className="num" title={p.unpricedRequests > 0 ? t("providers.cell.unpriced", { count: p.unpricedRequests }) : undefined}>
					{formatEstimatedCost(p.totalCost, p.unpricedRequests)}
				</span>
			),
		},
		{
			key: "tps",
			header: t("providers.col.tps"),
			title: t("providers.col.tpsTitle"),
			align: "right",
			sort: p => p.avgTokensPerSecond ?? -1,
			render: p => <span className="num">{formatTokensPerSecond(p.avgTokensPerSecond)}</span>,
		},
		{
			key: "premium",
			header: t("providers.col.premium"),
			title: t("providers.col.premiumTitle"),
			align: "right",
			sort: p => p.totalPremiumRequests,
			render: p => (
				<span className={p.totalPremiumRequests > 0 ? "num" : "num dim"}>
					{formatInteger(Math.round(p.totalPremiumRequests * 100) / 100)}
				</span>
			),
		},
	];
}

function ProviderTotalsTable({
	t,
	providers,
	colors,
}: {
	t: Translate;
	providers: ProviderAggregate[];
	colors: ReadonlyMap<string, string>;
}) {
	const [open, setOpen] = useState<string | null>(null);
	const columns = useMemo(() => buildTotalsColumns(t, providers, colors), [t, providers, colors]);
	return (
		<Table
			rows={providers}
			rowKey={p => p.provider}
			columns={columns}
			initialSort={{ key: "tokens", dir: "desc" }}
			limit={12}
			selectedKey={open}
			onRowClick={p => setOpen(prev => (prev === p.provider ? null : p.provider))}
			expanded={p => (p.provider === open ? <TokenMix t={t} provider={p} /> : null)}
			empty={<EmptyState title={t("providers.totals.empty")} />}
		/>
	);
}

const TOKEN_MIX_KEYS = [
	{ key: "input", color: "#5b8cff" },
	{ key: "cacheRead", color: "var(--chart-primary)" },
	{ key: "cacheWrite", color: "#f5b54a" },
	{ key: "output", color: "var(--chart-secondary)" },
] as const;

function TokenMix({ t, provider }: { t: Translate; provider: ProviderAggregate }) {
	const { token } = theme.useToken();
	const mix = {
		input: provider.totalInputTokens,
		cacheRead: provider.totalCacheReadTokens,
		cacheWrite: provider.totalCacheWriteTokens,
		output: provider.totalOutputTokens,
	};
	return (
		<div
			className="stack"
			style={{
				gap: 10,
				padding: "12px 16px 14px",
				background: token.colorFillTertiary,
				borderTop: `1px solid ${token.colorBorderSecondary}`,
			}}
		>
			<ShareBar
				segments={TOKEN_MIX_KEYS.map(m => ({
					key: m.key,
					label: t(`providers.mix.${m.key}`),
					value: mix[m.key],
					color: m.color,
				}))}
			/>
			<Legend
				items={TOKEN_MIX_KEYS.map(m => ({
					key: m.key,
					label: t(`providers.mix.${m.key}`),
					color: m.color,
					value: t("providers.mix.legendValue", {
						value: formatCompact(mix[m.key]),
						share:
							provider.totalTokens > 0 ? formatPercent(mix[m.key] / provider.totalTokens, 0) : "–",
					}),
				}))}
			/>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Peak burn hours
// ---------------------------------------------------------------------------

const ALL_PROVIDERS = "";

function PeakHoursCard({
	hourly,
	providers,
	stale,
}: {
	hourly: ProviderHourlyPoint[];
	providers: ProviderAggregate[];
	stale: boolean;
}) {
	const t = useT();
	const [provider, setProvider] = useState(ALL_PROVIDERS);
	const current =
		provider === ALL_PROVIDERS || providers.some(p => p.provider === provider) ? provider : ALL_PROVIDERS;

	const hours = useMemo(() => {
		const tokens = Array.from({ length: 24 }, () => 0);
		const output = Array.from({ length: 24 }, () => 0);
		const requests = Array.from({ length: 24 }, () => 0);
		for (const point of hourly) {
			if (current !== ALL_PROVIDERS && point.provider !== current) continue;
			tokens[point.hour] += point.totalTokens;
			output[point.hour] += point.outputTokens;
			requests[point.hour] += point.requests;
		}
		let peak = 0;
		for (let hour = 1; hour < 24; hour++) if (tokens[hour] > tokens[peak]) peak = hour;
		const hasData = tokens[peak] > 0;
		const series: ChartSeries[] = [
			{
				key: "tokens",
				label: t("providers.peak.seriesTokens"),
				color: "var(--chart-primary)",
				values: tokens.map((v, hour) => (hasData && hour === peak ? null : v)),
			},
			{
				key: "peak",
				label: t("providers.peak.seriesPeak"),
				color: "var(--chart-secondary)",
				values: tokens.map((v, hour) => (hasData && hour === peak ? v : null)),
			},
		];
		return { series, output, requests, peak, hasData };
	}, [hourly, current, t]);

	const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

	return (
		<Card
			index={3}
			title={t("providers.peak.title")}
			description={
				hours.hasData
					? t("providers.peak.descPeak", { time: hourLabel(hours.peak) })
					: t("providers.peak.desc")
			}
			actions={
				<Select
					size="small"
					style={{ maxWidth: 220 }}
					value={current}
					onChange={setProvider}
					aria-label={t("providers.peak.providerAria")}
					options={[
						{ value: ALL_PROVIDERS, label: t("providers.peak.allProviders") },
						...providers.map(p => ({ value: p.provider, label: p.provider })),
					]}
				/>
			}
			stale={stale}
		>
			<Chart
				slots={24}
				tickLabel={hour => String(hour).padStart(2, "0")}
				tooltipTitle={hour => `${hourLabel(hour)}–${hourLabel((hour + 1) % 24)}`}
				series={hours.series}
				height={260}
				showTotal={false}
				formatTooltip={formatInteger}
				emptyLabel={t("providers.peak.empty")}
				tooltipExtra={hour => (
					<>
						<div className="chart-tooltip-row">
							<span className="chart-tooltip-label">{t("providers.peak.tooltipOutput")}</span>
							<span className="chart-tooltip-value">{formatInteger(hours.output[hour])}</span>
						</div>
						<div className="chart-tooltip-row">
							<span className="chart-tooltip-label">{t("providers.peak.tooltipRequests")}</span>
							<span className="chart-tooltip-value">{formatInteger(hours.requests[hour])}</span>
						</div>
					</>
				)}
			/>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Subscription window insights
// ---------------------------------------------------------------------------

function WindowInsightsTable({
	insights,
	selected,
	onSelect,
}: {
	insights: ProviderWindowInsight[];
	selected: WindowRef | null;
	onSelect: (ref: WindowRef) => void;
}) {
	const t = useT();
	return (
		<Table
			rows={insights}
			rowKey={i => `${i.provider}::${i.windowKey}`}
			columns={insightColumns(t)}
			initialSort={{ key: "consumed", dir: "desc" }}
			limit={12}
			selectedKey={selected ? `${selected.provider}::${selected.windowKey}` : null}
			onRowClick={i => onSelect({ provider: i.provider, windowKey: i.windowKey })}
			empty={<EmptyState title={t("providers.windows.empty")} hint={t("providers.windows.hint")} />}
		/>
	);
}

function insightColumns(t: Translate): Column<ProviderWindowInsight>[] {
	return [
		{
			key: "window",
			header: t("providers.windows.col.window"),
			sort: i => `${i.provider} ${i.windowLabel}`,
			render: i => <LabelCell primary={i.windowLabel} secondary={<span className="mono">{i.provider}</span>} />,
		},
		{
			key: "accounts",
			header: t("providers.windows.col.accounts"),
			title: t("providers.windows.col.accountsTitle"),
			align: "right",
			sort: i => i.accounts,
			render: i => <span className="num">{formatInteger(i.accounts)}</span>,
		},
		{
			key: "cycles",
			header: t("providers.windows.col.resets"),
			title: t("providers.windows.col.resetsTitle"),
			align: "right",
			sort: i => i.cycles,
			render: i => <span className="num muted">{formatInteger(i.cycles)}</span>,
		},
		{
			key: "consumed",
			header: t("providers.windows.col.consumed"),
			title: t("providers.windows.col.consumedTitle"),
			align: "right",
			sort: i => i.fractionConsumed,
			render: i => <span className="num">{i.fractionConsumed.toFixed(2)}</span>,
		},
		{
			key: "capacity",
			header: t("providers.windows.col.capacity"),
			title: t("providers.windows.col.capacityTitle"),
			align: "right",
			sort: i => i.estTokensPerWindow ?? -1,
			render: i =>
				i.estTokensPerWindow !== null ? (
					<span className="num">{formatCompact(i.estTokensPerWindow)}</span>
				) : (
					<span className="dim" title={t("providers.windows.tooLittle")}>
						–
					</span>
				),
		},
		{
			key: "peak",
			header: t("providers.windows.col.peak"),
			title: t("providers.windows.col.peakTitle"),
			align: "right",
			sort: i => i.peakConcurrentFraction,
			render: i => {
				const load = i.accounts > 0 ? i.peakConcurrentFraction / i.accounts : 0;
				return (
					<MeterCell
						value={i.peakConcurrentFraction}
						max={i.accounts}
						display={formatPercent(i.peakConcurrentFraction, 0)}
						color={load >= 0.9 ? "var(--warn)" : undefined}
					/>
				);
			},
		},
		{
			key: "ideal",
			header: t("providers.windows.col.ideal"),
			title: t("providers.windows.col.idealTitle"),
			align: "right",
			sort: i => i.idealAccounts - i.accounts,
			render: i =>
				i.idealAccounts > i.accounts ? (
					<Badge tone="warn" mono>
						{t("providers.windows.needHave", { need: formatInteger(i.idealAccounts), count: formatInteger(i.accounts) })}
					</Badge>
				) : (
					<span className="num">{formatInteger(i.idealAccounts)}</span>
				),
		},
		{
			key: "exhausted",
			header: t("providers.windows.col.exhausted"),
			title: t("providers.windows.col.exhaustedTitle"),
			align: "right",
			sort: i => i.exhaustedEvents,
			render: i =>
				i.exhaustedEvents > 0 ? (
					<Badge tone="warn" mono>
						{t("providers.windows.exhaustedCount", { count: i.exhaustedEvents })}
					</Badge>
				) : (
					<span className="num dim">0</span>
				),
		},
	];
}

// ---------------------------------------------------------------------------
// Window utilization
// ---------------------------------------------------------------------------

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
/** Candidate utilization bucket sizes; the finest one within {@link MAX_UTIL_SLOTS} wins. */
const UTIL_STEPS = [
	5 * MINUTE_MS,
	15 * MINUTE_MS,
	30 * MINUTE_MS,
	HOUR_MS,
	2 * HOUR_MS,
	3 * HOUR_MS,
	6 * HOUR_MS,
	12 * HOUR_MS,
	DAY_MS,
];
const MAX_UTIL_SLOTS = 240;
/**
 * Snapshots are recorded whenever usage is fetched, so an account's samples
 * are irregular. A reading holds until the next one, but only this long —
 * longer silences render as gaps rather than invented plateaus.
 */
const MAX_HOLD_MS = 6 * HOUR_MS;

interface AccountRow {
	series: UsageWindowSeries;
	/** Account label, numbered when another account shares it. */
	name: string;
	color: string | null;
	latest: { fraction: number; exhausted: boolean; timestamp: number } | null;
	peak: number | null;
	samples: number;
}

function WindowUtilizationCard({
	insights,
	accounts,
	selected,
	onSelect,
}: {
	/** Every provider's window insights; `null` while they load. */
	insights: ProviderWindowInsight[] | null;
	/** Window stats whose `usageSeries` covers only the selected provider. */
	accounts: QueryResult<ProviderWindowStats>;
	selected: WindowRef | null;
	onSelect: (ref: WindowRef) => void;
}) {
	const t = useT();
	const { token } = theme.useToken();
	const [hidden, toggleHidden] = useHiddenSeries();

	const providers = useMemo(() => [...new Set((insights ?? []).map(i => i.provider))], [insights]);
	const windows = useMemo(
		() =>
			(insights ?? [])
				.filter(i => i.provider === selected?.provider)
				.map(i => ({ key: i.windowKey, label: i.windowLabel })),
		[insights, selected?.provider],
	);
	// While another provider's series are still on screen, show none of them.
	const providerSeries = useMemo(
		() => (accounts.data?.usageSeries ?? []).filter(s => s.provider === selected?.provider),
		[accounts.data, selected?.provider],
	);
	const loadingSeries = providerSeries.length === 0 && (accounts.loading || accounts.stale);

	// Distinct accounts can share a label (one email in two orgs): number the repeats.
	const names = useMemo(() => {
		const keysByLabel = new Map<string, string[]>();
		for (const s of providerSeries) {
			const keys = keysByLabel.get(s.accountLabel) ?? [];
			if (!keys.includes(s.accountKey)) keys.push(s.accountKey);
			keysByLabel.set(s.accountLabel, keys);
		}
		const out = new Map<string, string>();
		for (const [label, keys] of keysByLabel) {
			keys.sort();
			keys.forEach((key, i) =>
				out.set(key, keys.length > 1 ? t("providers.accounts.numbered", { label, count: i + 1 }) : label),
			);
		}
		return out;
	}, [providerSeries, t]);

	const chart = useMemo(
		() =>
			buildUtilization(
				providerSeries.filter(s => s.windowKey === selected?.windowKey),
				names,
			),
		[providerSeries, names, selected?.windowKey],
	);

	const rows = useMemo<AccountRow[]>(() => {
		const colorOf = new Map(chart.series.map(s => [s.key, s.color]));
		return providerSeries
			.map(series => {
				let latest: AccountRow["latest"] = null;
				let peak: number | null = null;
				for (const p of series.points) {
					if (p.usedFraction === null) continue;
					peak = Math.max(peak ?? 0, p.usedFraction);
					if (!latest || p.timestamp >= latest.timestamp)
						latest = { fraction: p.usedFraction, exhausted: p.exhausted, timestamp: p.timestamp };
				}
				const color = series.windowKey === selected?.windowKey ? (colorOf.get(series.accountKey) ?? null) : null;
				const name = names.get(series.accountKey) ?? series.accountLabel;
				return { series, name, color, latest, peak, samples: series.points.length };
			})
			.sort(
				(a, b) =>
					Number(b.color !== null) - Number(a.color !== null) ||
					a.series.windowLabel.localeCompare(b.series.windowLabel) ||
					(b.latest?.fraction ?? -1) - (a.latest?.fraction ?? -1),
			);
	}, [providerSeries, names, chart.series, selected?.windowKey]);

	const windowLabel = windows.find(w => w.key === selected?.windowKey)?.label;

	return (
		<Card
			index={5}
			title={t("providers.util.title")}
			description={
				chart.buckets.length > 0
					? t("providers.util.descRange", {
							window: windowLabel ?? t("providers.windows.col.window"),
							from: formatDate(chart.first, "MMM d HH:mm"),
							to: formatDate(chart.last, "MMM d HH:mm"),
						})
					: t("providers.util.desc")
			}
			actions={
				selected && (
					<div className="row" style={{ gap: 6 }}>
						<Select
							size="small"
							style={{ maxWidth: 220 }}
							value={selected.provider}
							onChange={next => {
								const first = insights?.find(i => i.provider === next);
								if (first) onSelect({ provider: next, windowKey: first.windowKey });
							}}
							aria-label={t("providers.util.providerAria")}
							options={providers.map(p => ({ value: p, label: p }))}
						/>
						<Select
							size="small"
							style={{ maxWidth: 220 }}
							value={selected.windowKey}
							onChange={windowKey => onSelect({ provider: selected.provider, windowKey })}
							aria-label={t("providers.util.windowAria")}
							options={windows.map(w => ({ value: w.key, label: w.label }))}
						/>
					</div>
				)
			}
			stale={accounts.stale}
		>
			{insights === null ? (
				<ChartSkeleton height={260} />
			) : selected === null ? (
				<EmptyState title={t("providers.windows.empty")} hint={t("providers.windows.hint")} />
			) : (
				<QueryView query={accounts} skeleton={<ChartSkeleton height={260} />}>
					{() =>
						loadingSeries ? (
							<ChartSkeleton height={260} />
						) : (
							<div className="stack" style={{ gap: 16 }}>
								<div className="stack" style={{ gap: 12 }}>
									<Chart
										slots={chart.buckets.length}
										tickLabel={i =>
											formatTick(
												chart.buckets[i],
												chart.last - chart.first > DAY_MS ? DAY_MS : chart.bucketMs,
											)
										}
										tooltipTitle={i => formatBucket(chart.buckets[i], HOUR_MS)}
										series={chart.series}
										hidden={hidden}
										kind="line"
										stacked={false}
										height={260}
										yMax={Math.max(1, chart.max)}
										format={v => formatPercent(v, 0)}
										formatTooltip={v => formatPercent(v, 1)}
										references={[{ value: 1, label: "100%" }]}
										emptyLabel={t("providers.util.empty")}
										tooltipExtra={i => {
											const exhausted = chart.exhausted[i];
											return exhausted.length > 0 ? (
												<div className="chart-tooltip-row">
													<span className="chart-tooltip-label tone-bad">
														{t("providers.util.tooltipExhausted")}
													</span>
													<span className="chart-tooltip-value">{exhausted.join(", ")}</span>
												</div>
											) : null;
										}}
									/>
									{chart.series.length > 1 && (
										<Legend
											items={chart.series.map(s => ({ key: s.key, label: s.label, color: s.color }))}
											hidden={hidden}
											onToggle={toggleHidden}
										/>
									)}
								</div>
								<div style={{ margin: "0 -16px -16px", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
									<Table
										rows={rows}
										rowKey={r => `${r.series.windowKey}::${r.series.accountKey}`}
										columns={accountColumns(t)}
										limit={16}
										onRowClick={r => onSelect({ provider: r.series.provider, windowKey: r.series.windowKey })}
										dense
									/>
								</div>
							</div>
						)
					}
				</QueryView>
			)}
		</Card>
	);
}

interface UtilizationChart {
	buckets: number[];
	bucketMs: number;
	first: number;
	last: number;
	max: number;
	series: ChartSeries[];
	/** Accounts seen exhausted per bucket. */
	exhausted: string[][];
}

/** One line per account over a shared axis spanning the window's recorded snapshots. */
function buildUtilization(accounts: UsageWindowSeries[], names: ReadonlyMap<string, string>): UtilizationChart {
	let first = Number.POSITIVE_INFINITY;
	let last = Number.NEGATIVE_INFINITY;
	for (const s of accounts) {
		for (const p of s.points) {
			if (p.timestamp < first) first = p.timestamp;
			if (p.timestamp > last) last = p.timestamp;
		}
	}
	if (!(last >= first))
		return { buckets: [], bucketMs: HOUR_MS, first: 0, last: 0, max: 0, series: [], exhausted: [] };

	const span = last - first;
	const bucketMs = UTIL_STEPS.find(step => span / step < MAX_UTIL_SLOTS) ?? DAY_MS;
	const buckets = bucketAxis("all", [first], bucketMs, last);
	const index = (ts: number) => Math.floor((ts - buckets[0]) / bucketMs);
	const exhausted = buckets.map((): string[] => []);
	let max = 0;

	const nameOf = (account: UsageWindowSeries) => names.get(account.accountKey) ?? account.accountLabel;
	const ordered = [...accounts].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
	const series = ordered.map((account, rank): ChartSeries => {
		// Last reading in each bucket, then hold it forward across short silences.
		const values: (number | null)[] = buckets.map(() => null);
		const readAt: number[] = buckets.map(() => 0);
		for (const p of account.points) {
			const i = index(p.timestamp);
			if (i < 0 || i >= buckets.length) continue;
			if (p.exhausted && !exhausted[i].includes(nameOf(account))) exhausted[i].push(nameOf(account));
			if (p.usedFraction === null || p.timestamp < readAt[i]) continue;
			values[i] = p.usedFraction;
			readAt[i] = p.timestamp;
			max = Math.max(max, p.usedFraction);
		}
		let held: number | null = null;
		let heldAt = 0;
		for (let i = 0; i < buckets.length; i++) {
			if (values[i] !== null) {
				held = values[i];
				heldAt = readAt[i];
			} else if (held !== null && buckets[i] - heldAt <= MAX_HOLD_MS) {
				values[i] = held;
			}
		}
		return {
			key: account.accountKey,
			label: nameOf(account),
			color: SERIES_COLORS[rank % SERIES_COLORS.length],
			values,
		};
	});

	return { buckets, bucketMs, first, last, max, series, exhausted };
}

function statusBadge(t: Translate, latest: AccountRow["latest"]): ReactNode {
	if (!latest) return <span className="dim">{t("providers.accounts.noReading")}</span>;
	if (latest.exhausted) return <Badge tone="bad">{t("providers.accounts.exhausted")}</Badge>;
	if (latest.fraction >= 0.8) return <Badge tone="warn">{t("providers.accounts.high")}</Badge>;
	return <Badge tone="ok">{t("providers.accounts.ok")}</Badge>;
}

function accountColumns(t: Translate): Column<AccountRow>[] {
	return [
		{
			key: "account",
			header: t("providers.accounts.col.account"),
			sort: r => r.name,
			render: r => (
				<span className="row" style={{ gap: 8 }}>
					<span style={{ display: "inline-flex", width: 10, flex: "none" }}>
						{r.color && <Swatch color={r.color} />}
					</span>
					<span className="truncate" style={{ maxWidth: 280 }} title={r.series.accountKey}>
						{r.name}
					</span>
				</span>
			),
		},
		{
			key: "window",
			header: t("providers.windows.col.window"),
			sort: r => r.series.windowLabel,
			render: r => <span className={r.color ? undefined : "muted"}>{r.series.windowLabel}</span>,
		},
		{
			key: "latest",
			header: t("providers.accounts.col.latest"),
			align: "right",
			sort: r => r.latest?.fraction ?? -1,
			render: r =>
				r.latest ? (
					<MeterCell
						value={r.latest.fraction}
						max={1}
						display={formatPercent(r.latest.fraction, 0)}
						color={r.latest.exhausted ? "var(--bad)" : r.latest.fraction >= 0.8 ? "var(--warn)" : "var(--ok)"}
					/>
				) : (
					<span className="dim">–</span>
				),
		},
		{
			key: "status",
			header: t("providers.accounts.col.status"),
			sort: r => (r.latest?.exhausted ? 2 : (r.latest?.fraction ?? 0) >= 0.8 ? 1 : 0),
			render: r => statusBadge(t, r.latest),
		},
		{
			key: "peak",
			header: t("providers.accounts.col.peak"),
			align: "right",
			sort: r => r.peak ?? -1,
			render: r => <span className="num">{r.peak === null ? "–" : formatPercent(r.peak, 0)}</span>,
		},
		{
			key: "samples",
			header: t("providers.accounts.col.snapshots"),
			align: "right",
			sort: r => r.samples,
			render: r => <span className="num muted">{formatInteger(r.samples)}</span>,
		},
		{
			key: "recorded",
			header: t("providers.accounts.col.recorded"),
			align: "right",
			sort: r => r.latest?.timestamp ?? 0,
			render: r => <span className="muted">{r.latest ? formatRelativeTime(r.latest.timestamp) : "–"}</span>,
		},
	];
}
