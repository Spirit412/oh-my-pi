import { Flex, Select, theme, type GlobalToken } from "antd";
import { useMemo, useState } from "react";
import { getGainDashboardStats } from "../api";
import { Chart, type ChartSeries, Legend } from "../charts";
import { formatBytes, formatCompact, formatInteger, formatPercent } from "../data/formatters";
import { useQuery } from "../data/query";
import { bucketAxis, rangeWindowLabel } from "../data/range";
import { densify } from "../data/series";
import { intlLocale, t, useT } from "../i18n";
import type { GainSource, GainSourceTotals, TimeRange } from "../types";
import {
	Card,
	ChartSkeleton,
	type Column,
	EmptyState,
	MeterCell,
	PageHeader,
	QueryView,
	Stat,
	StatGrid,
	Table,
} from "../ui";

export interface GainRouteProps {
	active: boolean;
	range: TimeRange;
}

const DAY_MS = 86_400_000;

const SOURCE_LABEL: Record<GainSource, string> = { snapcompact: "Snapcompact" };

/** The server buckets gain by UTC calendar day (`YYYY-MM-DD`). */
const DAY_LABEL = new Intl.DateTimeFormat(intlLocale(), { month: "short", day: "numeric", timeZone: "UTC" });

interface SourceRow extends GainSourceTotals {
	source: GainSource;
	/** Share of all saved tokens (0-1). */
	share: number;
}

export function GainRoute({ active, range }: GainRouteProps) {
	const tt = useT();
	const { token } = theme.useToken();
	const [project, setProject] = useState<string | null>(null);
	const gain = useQuery(["gain", range, project], ({ signal }) => getGainDashboardStats(range, project, signal), {
		enabled: active,
	});
	const rangeLabel = rangeWindowLabel(range);
	const data = gain.data;

	const series = useMemo(() => {
		const points = (data?.timeSeries ?? []).map(p => ({ ...p, timestamp: Date.parse(`${p.date}T00:00:00Z`) }));
		const buckets = bucketAxis(
			range,
			points.map(p => p.timestamp),
			DAY_MS,
		);
		const daily = densify(points, buckets, p => p.snapcompact);
		let running = 0;
		const cumulative = daily.map(v => (running += v));
		return { buckets, daily, cumulative };
	}, [data, range]);

	const sourceRows = useMemo((): SourceRow[] => {
		if (!data) return [];
		const total = data.overall.savedTokens;
		return (Object.keys(data.bySource) as GainSource[]).map(source => ({
			...data.bySource[source],
			source,
			share: total > 0 ? data.bySource[source].savedTokens / total : 0,
		}));
	}, [data]);

	const projects = data?.projects ?? [];
	// Keep the chosen project selectable even when the current range never saw it.
	const projectOptions = project !== null && !projects.includes(project) ? [project, ...projects] : projects;

	const chartSeries: ChartSeries[] = [
		{ key: "daily", label: tt("gain.chart.daily"), color: "var(--chart-primary)", values: series.daily },
		{
			key: "cumulative",
			label: tt("gain.chart.cumulative"),
			color: "var(--chart-secondary)",
			values: series.cumulative,
			kind: "line",
			axis: "right",
		},
	];

	const sourceColumns = useMemo(() => buildSourceColumns(tt, token), [tt, token]);

	return (
		<Flex vertical gap={20}>
			<PageHeader
				title={tt("nav.gain")}
				description={tt(project ? "gain.descriptionProject" : "gain.description", { name: project ?? "", range: rangeLabel })}
				actions={
					projectOptions.length > 0 && (
						<Select
							style={{ maxWidth: 320 }}
							aria-label={tt("gain.project.aria")}
							value={project ?? ""}
							onChange={v => setProject(v || null)}
							options={[
								{ value: "", label: tt("gain.project.all") },
								...projectOptions.map(p => ({ value: p, label: p })),
							]}
						/>
					)
				}
			/>

			<QueryView
				query={gain}
				skeleton={<ChartSkeleton height={96} />}
				isEmpty={stats => stats.overall.hits === 0 && stats.timeSeries.length === 0}
				empty={
					<Card>
						<EmptyState
							title={tt(project ? "gain.emptyProject" : "gain.empty", { name: project ?? "", range: rangeLabel })}
							hint={range === "all" ? tt("gain.empty.hintFirst") : tt("gain.empty.hintLonger")}
						/>
					</Card>
				}
			>
				{({ overall }) => (
					<>
						<div data-stale={gain.stale}>
							<StatGrid min={180}>
								<Stat
									label={tt("gain.stat.savedTokens")}
									value={formatCompact(overall.savedTokens)}
									hint={formatInteger(overall.savedTokens)}
									spark={series.daily}
								/>
								<Stat label={tt("gain.stat.savedBytes")} value={formatBytes(overall.savedBytes)} />
								<Stat
									label={tt("gain.stat.reduction")}
									title={tt("gain.stat.reduction.title")}
									value={overall.reductionPercent !== null ? formatPercent(overall.reductionPercent) : "–"}
									hint={overall.reductionPercent === null ? tt("gain.stat.reduction.unknown") : undefined}
								/>
								<Stat label={tt("gain.stat.hits")} value={formatInteger(overall.hits)} />
								<Stat
									label={tt("gain.stat.perHit")}
									value={overall.hits > 0 ? formatCompact(overall.savedTokens / overall.hits) : "–"}
									hint={tt("gain.stat.perHit.hint")}
								/>
							</StatGrid>
						</div>

						<Card
							index={1}
							title={tt("gain.chart.title")}
							description={tt("gain.chart.description")}
							actions={<Legend items={chartSeries.map(s => ({ key: s.key, label: s.label, color: s.color }))} />}
							stale={gain.stale}
						>
							<Chart
								slots={series.buckets.length}
								tickLabel={i => DAY_LABEL.format(series.buckets[i])}
								series={chartSeries}
								height={260}
								formatTooltip={formatInteger}
								formatRight={formatCompact}
							/>
						</Card>

						<Card index={2} title={tt("gain.sources.title")} description={tt("gain.sources.description")} flush stale={gain.stale}>
							<Table rows={sourceRows} rowKey={row => row.source} columns={sourceColumns} />
						</Card>
					</>
				)}
			</QueryView>
		</Flex>
	);
}

type Translate = typeof t;

function buildSourceColumns(tt: Translate, token: GlobalToken): Column<SourceRow>[] {
	const num = { fontVariantNumeric: "tabular-nums" };
	const muted = { color: token.colorTextSecondary };
	return [
		{
			key: "source",
			header: tt("gain.col.source"),
			sort: row => row.source,
			render: row => <span style={{ fontWeight: 500 }}>{SOURCE_LABEL[row.source]}</span>,
		},
		{
			key: "tokens",
			header: tt("gain.col.tokens"),
			align: "right",
			sort: row => row.savedTokens,
			render: row => (
				<span title={formatInteger(row.savedTokens)}>
					<MeterCell value={row.share} max={1} display={formatCompact(row.savedTokens)} />
				</span>
			),
		},
		{
			key: "share",
			header: tt("gain.col.share"),
			align: "right",
			sort: row => row.share,
			render: row => <span style={{ ...num, ...muted }}>{formatPercent(row.share)}</span>,
		},
		{
			key: "bytes",
			header: tt("gain.col.bytes"),
			align: "right",
			sort: row => row.savedBytes,
			render: row => <span style={num}>{formatBytes(row.savedBytes)}</span>,
		},
		{
			key: "hits",
			header: tt("gain.col.hits"),
			align: "right",
			sort: row => row.hits,
			render: row => <span style={num}>{formatInteger(row.hits)}</span>,
		},
		{
			key: "reduction",
			header: tt("gain.col.reduction"),
			align: "right",
			sort: row => row.reductionPercent ?? -1,
			render: row => (
				<span style={num}>{row.reductionPercent !== null ? formatPercent(row.reductionPercent) : "–"}</span>
			),
		},
	];
}
