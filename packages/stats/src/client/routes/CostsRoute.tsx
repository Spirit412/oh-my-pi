import { Col, Flex, Row, Typography, theme } from "antd";
import { useMemo, useState } from "react";
import { getCostDashboardStats } from "../api";
import { Chart, type ChartSeries, Legend, ShareBar, useHiddenSeries } from "../charts";
import { buildModelColorLookup, modelKey, OTHER_COLOR, SERIES_COLORS } from "../data/colors";
import { formatCost, formatEstimatedCost, formatInteger, formatPercent } from "../data/formatters";
import { useQuery } from "../data/query";
import { bucketAxis, rangeWindowLabel } from "../data/range";
import { densify, pivotSeries } from "../data/series";
import { buildCostSummary, type CostComponents, type CostModelRow, type CostSummaryView } from "../data/view-models";
import { intlLocale, t, useT } from "../i18n";
import type { CostDashboardStats, TimeRange } from "../types";
import {
	Card,
	ChartSkeleton,
	type Column,
	EmptyState,
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

export interface CostsRouteProps {
	active: boolean;
	range: TimeRange;
}

type SplitMode = "model" | "component";

const SPLIT_OPTIONS = [
	{ value: "model" as const, label: t("costs.split.model") },
	{ value: "component" as const, label: t("costs.split.component") },
];

/** Models stacked individually in the daily chart; the rest fold into "Other". */
const MODEL_LIMIT = 6;

/** The cost series is bucketed by UTC day on the server. */
const DAY_MS = 86_400_000;

const COMPONENTS = [
	{ key: "costInput", label: t("costs.component.input"), color: "#5b8cff" },
	{ key: "costOutput", label: t("costs.component.output"), color: "var(--chart-secondary)" },
	{ key: "costCacheRead", label: t("costs.component.cacheRead"), color: "var(--chart-primary)" },
	{ key: "costCacheWrite", label: t("costs.component.cacheWrite"), color: "#f5b54a" },
] as const satisfies readonly { key: keyof CostComponents; label: string; color: string }[];

const UTC_DAY = new Intl.DateTimeFormat(intlLocale(), { month: "short", day: "numeric", timeZone: "UTC" });
const UTC_DAY_LONG = new Intl.DateTimeFormat(intlLocale(), {
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

export function CostsRoute({ active, range }: CostsRouteProps) {
	const t = useT();
	const query = useQuery(["costs", range], ({ signal }) => getCostDashboardStats(range, signal), { enabled: active });
	const [split, setSplit] = useState<SplitMode>("model");
	const [hidden, toggleSeries] = useHiddenSeries();
	const { token } = theme.useToken();
	const view = useMemo(() => (query.data ? buildCostsView(query.data, range) : null), [query.data, range]);
	// Stable columns: a fresh array would make Table re-sort on every render.
	const columns = useMemo(() => (view ? buildCostColumns(view, token.colorWarning) : []), [view, token.colorWarning]);
	const isEmpty = (data: CostDashboardStats) => data.costSeries.length === 0;
	const empty = <EmptyState title={t("costs.empty.title")} hint={t("costs.empty.hint")} />;

	return (
		<Flex vertical gap={20}>
			<PageHeader title={t("nav.costs")} description={t("costs.subtitle", { window: rangeWindowLabel(range) })} />

			<QueryView
				query={query}
				skeleton={<Skeleton height={112} style={{ borderRadius: 12 }} />}
				isEmpty={isEmpty}
				empty={empty}
			>
				{() => view && <CostStats view={view} stale={query.stale} />}
			</QueryView>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={16}>
					<Card
						index={1}
						title={t("costs.daily.title")}
						description={split === "model" ? t("costs.daily.desc.model") : t("costs.daily.desc.component")}
						actions={
							<Segmented
								size="sm"
								options={SPLIT_OPTIONS}
								value={split}
								onChange={setSplit}
								aria-label={t("costs.split.aria")}
							/>
						}
						stale={query.stale}
					>
						<QueryView query={query} skeleton={<ChartSkeleton height={280} />} isEmpty={isEmpty} empty={empty}>
							{() => {
								if (!view) return null;
								const series = split === "model" ? view.modelSeries : view.componentSeries;
								return (
									<Flex vertical gap={12}>
										<Chart
											slots={view.buckets.length}
											tickLabel={i => UTC_DAY.format(view.buckets[i])}
											tooltipTitle={i => UTC_DAY_LONG.format(view.buckets[i])}
											series={series}
											hidden={hidden}
											height={280}
											format={v => formatCost(v, Number.isInteger(v) ? 0 : 2)}
											formatTooltip={v => formatCost(v)}
											emptyLabel={t("costs.chart.empty")}
											tooltipExtra={i =>
												view.unpricedPerDay[i] > 0 ? (
													<div className="chart-tooltip-row chart-tooltip-total">
														<span className="chart-tooltip-label">{t("costs.tooltip.unpriced")}</span>
														<span className="chart-tooltip-value">
															{formatInteger(view.unpricedPerDay[i])}
														</span>
													</div>
												) : null
											}
										/>
										<Legend
											items={series.map(s => ({
												key: s.key,
												label: s.label,
												color: s.color,
												value: formatCost(sum(s.values)),
											}))}
											hidden={hidden}
											onToggle={toggleSeries}
										/>
									</Flex>
								);
							}}
						</QueryView>
					</Card>
				</Col>

				<Col xs={24} lg={8}>
					<Card index={2} title={t("costs.went.title")} description={t("costs.went.desc")} stale={query.stale}>
						<QueryView query={query} skeleton={<ChartSkeleton height={280} />} isEmpty={isEmpty} empty={empty}>
							{() => view && <ComponentBreakdown summary={view.summary} />}
						</QueryView>
					</Card>
				</Col>
			</Row>

			<Card index={3} title={t("costs.table.title")} description={t("costs.table.desc")} stale={query.stale} flush>
				<QueryView query={query} skeleton={<TableSkeleton rows={8} />} isEmpty={isEmpty} empty={empty}>
					{() =>
						view && (
							<Table
								rows={view.summary.models}
								rowKey={row => row.key}
								columns={columns}
								initialSort={{ key: "cost", dir: "desc" }}
								limit={20}
							/>
						)
					}
				</QueryView>
			</Card>
		</Flex>
	);
}

interface CostsView {
	summary: CostSummaryView;
	/** Chart color of each individually plotted model; the rest share "Other" gray. */
	swatches: Map<string, string>;
	buckets: number[];
	dailyTotals: number[];
	unpricedPerDay: number[];
	modelSeries: ChartSeries[];
	componentSeries: ChartSeries[];
	maxModelCost: number;
}

function buildCostsView(data: CostDashboardStats, range: TimeRange): CostsView {
	const points = data.costSeries;
	const summary = buildCostSummary(points);
	const colors = buildModelColorLookup(
		summary.models.map(m => ({ model: m.model, provider: m.provider, totalRequests: m.requests })),
	);
	const byKey = new Map(summary.models.map(m => [m.key, m]));
	const buckets = bucketAxis(
		range,
		points.map(p => p.timestamp),
		DAY_MS,
	);
	// Zero slots become gaps so the tooltip lists only what was spent that day.
	const modelSeries = pivotSeries(points, {
		buckets,
		key: p => modelKey(p.model, p.provider),
		label: key => byKey.get(key)?.model ?? key,
		value: p => p.cost,
		limit: MODEL_LIMIT,
		colors,
	}).map(s => ({ ...s, values: s.values.map(v => v || null) }));
	// Colors follow request rank (shared with the Models page); the top models by
	// cost can include ranks that wrap onto the same hue, so recolor repeats.
	const used = new Set<string>();
	for (const s of modelSeries) {
		if (s.key === "__other__") continue;
		if (used.has(s.color)) s.color = SERIES_COLORS.find(c => !used.has(c)) ?? s.color;
		used.add(s.color);
	}
	return {
		summary,
		swatches: new Map(modelSeries.filter(s => s.key !== "__other__").map(s => [s.key, s.color])),
		buckets,
		dailyTotals: densify(points, buckets, p => p.cost),
		unpricedPerDay: densify(points, buckets, p => p.unpricedRequests),
		modelSeries,
		componentSeries: COMPONENTS.map(c => ({
			key: c.key,
			label: c.label,
			color: c.color,
			values: densify(points, buckets, p => p[c.key]).map(v => v || null),
		})),
		maxModelCost: summary.models[0]?.cost ?? 0,
	};
}

function CostStats({ view, stale }: { view: CostsView; stale: boolean }) {
	const t = useT();
	const { summary } = view;
	const pricedRequests = summary.requests - summary.unpricedRequests;
	const top = summary.topModel;
	return (
		<div data-stale={stale}>
			<StatGrid min={180}>
				<Stat
					label={t("costs.stat.estimate")}
					title={t("costs.stat.estimate.title")}
					value={formatEstimatedCost(summary.totalCost, summary.unpricedRequests)}
					hint={t("costs.stat.estimate.requests", { count: summary.requests })}
					spark={view.dailyTotals}
					sparkColor="var(--chart-secondary)"
				/>
				<Stat
					label={t("costs.stat.avgPerDay")}
					title={t("costs.stat.avgPerDay.title")}
					value={formatEstimatedCost(summary.avgDailyCost, summary.unpricedRequests)}
					hint={t("costs.stat.avgPerDay.days", { count: summary.activeDays })}
				/>
				<Stat
					label={t("costs.stat.topModel")}
					title={top ? `${top.model} (${top.provider})` : undefined}
					value={top ? top.model : "–"}
					hint={
						top
							? t("costs.stat.topModel.hint", { cost: formatCost(top.cost), share: formatPercent(top.share) })
							: t("costs.stat.topModel.empty")
					}
				/>
				<Stat
					label={t("costs.stat.perRequest")}
					title={t("costs.stat.perRequest.title")}
					value={pricedRequests > 0 ? formatUnitCost(summary.totalCost / pricedRequests) : "–"}
					hint={t("costs.stat.perRequest.priced", { count: pricedRequests })}
				/>
				<Stat
					label={t("costs.stat.unpriced")}
					title={t("costs.stat.unpriced.title")}
					value={formatInteger(summary.unpricedRequests)}
					hint={
						summary.unpricedRequests > 0 ? t("costs.hint.excluded") : t("costs.hint.allPriced")
					}
				/>
			</StatGrid>
		</div>
	);
}

function ComponentBreakdown({ summary }: { summary: CostSummaryView }) {
	const t = useT();
	const { token } = theme.useToken();
	const rowBorder = `1px solid ${token.colorBorderSecondary}`;
	return (
		<Flex vertical gap={14}>
			<ShareBar
				height={10}
				segments={COMPONENTS.map(c => ({ key: c.key, label: c.label, value: summary[c.key], color: c.color }))}
			/>
			<div>
				{COMPONENTS.map((c, i) => (
					<div
						key={c.key}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 12,
							padding: "7px 0",
							borderBottom: i === COMPONENTS.length - 1 ? undefined : rowBorder,
						}}
					>
						<Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
							<Swatch color={c.color} />
							{c.label}
						</Flex>
						<span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCost(summary[c.key])}</span>
						<Typography.Text
							type="secondary"
							style={{ width: 56, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
						>
							{summary.totalCost > 0 ? formatPercent(summary[c.key] / summary.totalCost) : "–"}
						</Typography.Text>
					</div>
				))}
				<div style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
					<span style={{ flex: 1, fontWeight: 500 }}>{t("costs.breakdown.total")}</span>
					<span style={{ fontVariantNumeric: "tabular-nums" }}>
						{formatEstimatedCost(summary.totalCost, summary.unpricedRequests)}
					</span>
					<span style={{ width: 56 }} />
				</div>
			</div>
			{summary.unpricedRequests > 0 && (
				<Typography.Text type="secondary" style={{ fontSize: 12, margin: 0 }}>
					{t("costs.breakdown.unpricedNote", { count: summary.unpricedRequests })}
				</Typography.Text>
			)}
		</Flex>
	);
}

function buildCostColumns(view: CostsView, warnColor: string): Column<CostModelRow>[] {
	const componentColumns: Column<CostModelRow>[] = COMPONENTS.map(c => ({
		key: c.key,
		header: c.label,
		align: "right",
		sort: row => row[c.key],
		render: row => <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCost(row[c.key])}</span>,
	}));
	return [
		{
			key: "model",
			header: t("costs.col.model"),
			sort: row => row.model,
			render: row => (
				<LabelCell
					lead={<Swatch color={view.swatches.get(row.key) ?? OTHER_COLOR} />}
					primary={
						<span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>{row.model}</span>
					}
					secondary={row.provider}
				/>
			),
		},
		{
			key: "requests",
			header: t("costs.col.requests"),
			align: "right",
			sort: row => row.requests,
			render: row => <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatInteger(row.requests)}</span>,
		},
		{
			key: "cost",
			header: t("costs.col.estimate"),
			title: t("costs.col.estimate.title"),
			align: "right",
			sort: row => row.cost,
			render: row => (
				<MeterCell
					value={row.cost}
					max={view.maxModelCost}
					display={formatEstimatedCost(row.cost, row.unpricedRequests)}
					color={view.swatches.get(row.key) ?? OTHER_COLOR}
				/>
			),
		},
		{
			key: "share",
			header: t("costs.col.share"),
			align: "right",
			sort: row => row.share,
			render: row => (
				<Typography.Text type="secondary" style={{ fontVariantNumeric: "tabular-nums" }}>
					{row.cost > 0 ? formatPercent(row.share) : "–"}
				</Typography.Text>
			),
		},
		{
			key: "split",
			header: t("costs.col.split"),
			title: t("costs.col.split.title"),
			width: 150,
			render: row =>
				row.cost > 0 ? (
					<ShareBar
						segments={COMPONENTS.map(c => ({ key: c.key, label: c.label, value: row[c.key], color: c.color }))}
					/>
				) : (
					<Typography.Text type="secondary">–</Typography.Text>
				),
		},
		...componentColumns,
		{
			key: "perRequest",
			header: t("costs.col.perRequest"),
			title: t("costs.col.perRequest.title"),
			align: "right",
			sort: row => (row.requests > row.unpricedRequests ? row.cost / (row.requests - row.unpricedRequests) : -1),
			render: row => (
				<span style={{ fontVariantNumeric: "tabular-nums" }}>
					{row.requests > row.unpricedRequests
						? formatUnitCost(row.cost / (row.requests - row.unpricedRequests))
						: "–"}
				</span>
			),
		},
		{
			key: "unpriced",
			header: t("costs.col.unpriced"),
			title: t("costs.col.unpriced.title"),
			align: "right",
			sort: row => row.unpricedRequests,
			render: row =>
				row.unpricedRequests > 0 ? (
					<span style={{ fontVariantNumeric: "tabular-nums", color: warnColor }}>{formatInteger(row.unpricedRequests)}</span>
				) : (
					<Typography.Text type="secondary" style={{ fontVariantNumeric: "tabular-nums" }}>–</Typography.Text>
				),
		},
	];
}

/** Per-request cost; amounts below the 4-digit precision read as a bound instead of "$0.0000". */
function formatUnitCost(value: number): string {
	return value > 0 && value < 0.0001 ? t("costs.unitCost.bound") : formatCost(value);
}

function sum(values: readonly (number | null)[]): number {
	let total = 0;
	for (const v of values) total += v ?? 0;
	return total;
}
