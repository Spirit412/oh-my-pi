import { Button, Col, Flex, Row, Typography } from "antd";
import { ArrowRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { getOverviewStats, getRecentRequests } from "../api";
import { Legend, ShareBar, TimeChart } from "../charts";
import {
	formatCompact,
	formatDurationMs,
	formatErrorRate,
	formatEstimatedCost,
	formatInteger,
	formatKb,
	formatMessageCost,
	formatPayloadKb,
	formatPercent,
	formatRelativeTime,
	formatTokensPerSecond,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { bucketAxis, rangeMeta, rangeWindowLabel } from "../data/range";
import { densify } from "../data/series";
import { buildAgentTokenShare, type AgentTokenSegment, sumConversationTokens } from "../data/view-models";
import { t, useT } from "../i18n";
import type { AgentType, MessageStats, TimeRange } from "../types";
import {
	Badge,
	Card,
	ChartSkeleton,
	Dot,
	LabelCell,
	PageHeader,
	QueryView,
	Segmented,
	Stat,
	StatGrid,
	Swatch,
	Table,
	TableSkeleton,
} from "../ui";

export interface OverviewRouteProps {
	active: boolean;
	range: TimeRange;
	onRequestClick: (id: number) => void;
}

type ActivityMetric = "requests" | "tokens" | "cost";

const ACTIVITY_OPTIONS = [
	{ value: "requests" as const, label: t("overview.activity.option.requests") },
	{ value: "tokens" as const, label: t("overview.activity.option.tokens") },
	{ value: "cost" as const, label: t("overview.activity.option.cost") },
];

const AGENT_COLOR: Record<AgentType, string> = {
	main: "var(--chart-primary)",
	subagent: "var(--chart-secondary)",
	advisor: "#9d7bff",
};

const TOKEN_MIX = [
	{ key: "input", label: t("overview.mix.uncachedInput"), color: "#5b8cff" },
	{ key: "cacheRead", label: t("overview.mix.cacheRead"), color: "var(--chart-primary)" },
	{ key: "cacheWrite", label: t("overview.mix.cacheWrite"), color: "#f5b54a" },
	{ key: "output", label: t("overview.mix.output"), color: "var(--chart-secondary)" },
] as const;

export function OverviewRoute({ active, range, onRequestClick }: OverviewRouteProps) {
	const t = useT();
	const overview = useQuery(["overview", range], ({ signal }) => getOverviewStats(range, signal), { enabled: active });
	const recent = useQuery(["recent-requests"], ({ signal }) => getRecentRequests(12, signal), { enabled: active });
	const [metric, setMetric] = useState<ActivityMetric>("requests");
	const meta = rangeMeta(range);

	const series = useMemo(() => {
		const points = overview.data?.timeSeries ?? [];
		const buckets = bucketAxis(
			range,
			points.map(p => p.timestamp),
		);
		return {
			buckets,
			requests: densify(points, buckets, p => p.requests - p.errors),
			errors: densify(points, buckets, p => p.errors),
			tokens: densify(points, buckets, p => p.tokens),
			cost: densify(points, buckets, p => p.cost),
			all: densify(points, buckets, p => p.requests),
		};
	}, [overview.data, range]);

	const chartSeries =
		metric === "requests"
			? [
					{ key: "ok", label: t("overview.chart.succeeded"), color: "var(--chart-primary)", values: series.requests },
					{ key: "err", label: t("overview.chart.failed"), color: "var(--bad)", values: series.errors },
				]
			: metric === "tokens"
				? [{ key: "tokens", label: t("overview.activity.option.tokens"), color: "var(--chart-primary)", values: series.tokens }]
				: [{ key: "cost", label: t("overview.chart.cost"), color: "var(--chart-secondary)", values: series.cost }];

	const bucketLabel = meta.bucketMs < 3_600_000 ? t("overview.activity.per5m") : meta.bucketMs < 86_400_000 ? t("overview.activity.perHour") : t("overview.activity.perDay");

	return (
		<Flex vertical gap={20}>
			<PageHeader title={t("nav.overview")} description={t("overview.subtitle", { window: rangeWindowLabel(range) })} />

			<QueryView query={overview} skeleton={<ChartSkeleton height={112} />}>
				{({ overall }) => (
					<div data-stale={overview.stale}>
						<Flex vertical gap={16}>
							<StatGrid min={190}>
								<Stat
									label={t("overview.stat.costEstimate")}
									title={t("overview.stat.costEstimate.title")}
									value={formatEstimatedCost(overall.totalCost, overall.unpricedRequests)}
									hint={
										overall.unpricedRequests > 0
											? t("overview.stat.costEstimate.unpriced", { count: overall.unpricedRequests })
											: undefined
									}
									spark={series.cost}
									sparkColor="var(--chart-secondary)"
								/>
								<Stat
									label={t("overview.stat.requests")}
									value={formatInteger(overall.totalRequests)}
									hint={t("overview.stat.requests.failed", { count: overall.failedRequests })}
									spark={series.all}
								/>
								<Stat
									label={t("overview.stat.tokens")}
									title={t("overview.stat.tokens.title")}
									value={formatCompact(sumConversationTokens(overall))}
									hint={t("overview.stat.tokens.output", { count: formatCompact(overall.totalOutputTokens) })}
									spark={series.tokens}
								/>
								<Stat
									label={t("overview.stat.cacheRate")}
									title={t("overview.stat.cacheRate.title")}
									value={formatPercent(overall.cacheRate)}
									hint={t("overview.stat.cacheRate.saved", { pct: formatPercent(overall.cacheSavings) })}
								/>
								<Stat
									label={t("overview.stat.errorRate")}
									value={formatErrorRate(overall.errorRate)}
									hint={t("overview.stat.errorRate.succeeded", { count: overall.successfulRequests })}
									spark={series.errors}
									sparkColor="var(--bad)"
								/>
							</StatGrid>
							<StatGrid min={140}>
								<Stat size="sm" label={t("overview.stat.input")} value={formatCompact(overall.totalInputTokens)} />
								<Stat size="sm" label={t("overview.stat.cacheRead")} value={formatCompact(overall.totalCacheReadTokens)} />
								<Stat size="sm" label={t("overview.stat.cacheWrite")} value={formatCompact(overall.totalCacheWriteTokens)} />
								<Stat size="sm" label={t("overview.stat.output")} value={formatCompact(overall.totalOutputTokens)} />
								<Stat
									size="sm"
									label={t("overview.stat.premiumRequests")}
									value={formatInteger(Math.round(overall.totalPremiumRequests * 100) / 100)}
								/>
								<Stat size="sm" label={t("overview.stat.tokensPerSecond")} value={formatTokensPerSecond(overall.avgTokensPerSecond)} />
								<Stat size="sm" label={t("overview.stat.avgLatency")} value={formatDurationMs(overall.avgDuration)} />
								<Stat size="sm" label={t("overview.stat.avgTtft")} value={formatDurationMs(overall.avgTtft)} />
								<Stat
									size="sm"
									label={t("overview.stat.requestPayload")}
									title={t("overview.stat.requestPayload.title")}
									value={formatPayloadKb(overall.totalRequestKb)}
									hint={t("overview.stat.requestPayload.measured", { count: overall.payloadRequests })}
								/>
								<Stat
									size="sm"
									label={t("overview.stat.responsePayload")}
									title={t("overview.stat.responsePayload.title")}
									value={formatPayloadKb(overall.totalResponseKb)}
								/>
							</StatGrid>
						</Flex>
					</div>
				)}
			</QueryView>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={16}>
					<Card
						index={1}
						title={t("overview.activity.title")}
						description={bucketLabel}
						actions={<Segmented size="sm" options={ACTIVITY_OPTIONS} value={metric} onChange={setMetric} />}
						stale={overview.stale}
					>
						<QueryView query={overview} skeleton={<ChartSkeleton height={260} />}>
							{() => (
								<TimeChart
									buckets={series.buckets}
									bucketMs={meta.bucketMs}
									series={chartSeries}
									height={260}
									format={metric === "cost" ? v => formatEstimatedCost(v, 0) : formatCompact}
								/>
							)}
						</QueryView>
					</Card>
				</Col>

				<Col xs={24} lg={8}>
					<Card index={2} title={t("overview.tokenMix.title")} description={t("overview.tokenMix.desc")} stale={overview.stale}>
						<QueryView query={overview} skeleton={<ChartSkeleton height={260} />}>
							{({ overall, byAgentType }) => {
								const mix = {
									input: overall.totalInputTokens,
									cacheRead: overall.totalCacheReadTokens,
									cacheWrite: overall.totalCacheWriteTokens,
									output: overall.totalOutputTokens,
								};
								const total = sumConversationTokens(overall);
								const agents = buildAgentTokenShare(byAgentType);
								return (
									<Flex vertical gap={18}>
										<Flex vertical gap={10}>
											<ShareBar
												segments={TOKEN_MIX.map(m => ({
													key: m.key,
													label: m.label,
													value: mix[m.key],
													color: m.color,
												}))}
											/>
											<Legend
												items={TOKEN_MIX.map(m => ({
													key: m.key,
													label: m.label,
													color: m.color,
													value: total > 0 ? formatPercent(mix[m.key] / total, 0) : "–",
												}))}
											/>
										</Flex>
										<Flex vertical gap={10}>
											<Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
												{t("overview.tokenMix.byAgent")}
											</Typography.Text>
											<ShareBar
												segments={agents.segments.map(s => ({
													key: s.agentType,
													label: t(`overview.agent.${s.agentType}`),
													value: s.tokens,
													color: AGENT_COLOR[s.agentType],
												}))}
											/>
											<AgentRows agents={agents.segments} />
										</Flex>
									</Flex>
								);
							}}
						</QueryView>
					</Card>
				</Col>
			</Row>

			<Card
				index={3}
				title={
					<>
						<Dot tone="live" pulse /> {t("overview.latest.title")}
					</>
				}
				description={t("overview.latest.desc")}
				actions={
					<Button
						size="small"
						href={`#/requests?range=${range}`}
						icon={<ArrowRight size={13} />}
						iconPosition="end"
					>
						{t("overview.latest.all")}
					</Button>
				}
				flush
			>
				<QueryView query={recent} skeleton={<TableSkeleton rows={8} />}>
					{rows => (
						<Table
							rows={rows}
							rowKey={row => row.id ?? `${row.sessionFile}:${row.entryId}`}
							onRowClick={row => row.id !== undefined && onRequestClick(row.id)}
							columns={REQUEST_COLUMNS}
							dense
						/>
					)}
				</QueryView>
			</Card>
		</Flex>
	);
}

function AgentRows({ agents }: { agents: readonly AgentTokenSegment[] }) {
	const t = useT();
	return (
		<>
			{agents.map(s => (
				<Flex key={s.agentType} justify="space-between" align="center" gap={8}>
					<Flex align="center" gap={8} style={{ minWidth: 0 }}>
						<Swatch color={AGENT_COLOR[s.agentType]} />
						<span>{t(`overview.agent.${s.agentType}`)}</span>
						<Typography.Text type="secondary" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
							{t("overview.agent.requests", { count: s.requests })}
						</Typography.Text>
					</Flex>
					<Flex align="center" gap={8}>
						<Typography.Text type="secondary" style={{ fontVariantNumeric: "tabular-nums" }}>
							{formatCompact(s.tokens)}
						</Typography.Text>
						<span style={{ minWidth: 48, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatPercent(s.share)}</span>
					</Flex>
				</Flex>
			))}
		</>
	);
}

const REQUEST_COLUMNS = [
	{
		key: "model",
		header: t("overview.col.model"),
		render: (row: MessageStats) => <LabelCell primary={row.model} secondary={row.provider} />,
	},
	{
		key: "time",
		header: t("overview.col.when"),
		render: (row: MessageStats) => <Muted>{formatRelativeTime(row.timestamp)}</Muted>,
	},
	{
		key: "tokens",
		header: t("overview.col.tokens"),
		align: "right" as const,
		render: (row: MessageStats) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatInteger(row.usage.totalTokens)}</span>,
	},
	{
		key: "payload",
		header: t("overview.col.payload"),
		title: t("overview.col.payload.title"),
		align: "right" as const,
		render: (row: MessageStats) => (
			<span
				style={{ fontVariantNumeric: "tabular-nums" }}
				title={t("overview.payload.tooltip", { req: formatKb(row.requestKb), res: formatKb(row.responseKb) })}
			>
				<Muted inline>
					{formatKb(row.requestKb)} / {formatKb(row.responseKb)}
				</Muted>
			</span>
		),
	},
	{
		key: "cost",
		header: t("overview.col.cost"),
		align: "right" as const,
		render: (row: MessageStats) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatMessageCost(row, 4)}</span>,
	},
	{
		key: "duration",
		header: t("overview.col.duration"),
		align: "right" as const,
		render: (row: MessageStats) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatDurationMs(row.duration)}</span>,
	},
	{
		key: "status",
		header: t("overview.col.status"),
		align: "right" as const,
		render: (row: MessageStats) =>
			row.errorMessage ? <Badge tone="bad">{t("overview.status.failed")}</Badge> : <Badge tone="ok">{t("overview.status.ok")}</Badge>,
	},
];

/** Secondary-colored text used for muted table cells. */
function Muted({ children, inline }: { children: ReactNode; inline?: boolean }) {
	return (
		<Typography.Text type="secondary" style={inline ? { fontVariantNumeric: "tabular-nums" } : undefined}>
			{children}
		</Typography.Text>
	);
}
