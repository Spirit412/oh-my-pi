import { useDeferredValue, useMemo, useState } from "react";
import { getFolderStats } from "../api";
import { BarList } from "../charts";
import {
	formatCompact,
	formatDurationMs,
	formatErrorRate,
	formatEstimatedCost,
	formatFolder,
	formatInteger,
	formatKb,
	formatPayloadKb,
	formatPercent,
	formatRelativeTime,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { rangeWindowLabel } from "../data/range";
import { buildFolderRows, type FolderRowView } from "../data/view-models";
import { useT } from "../i18n";
import type { TimeRange } from "../types";
import {
	Badge,
	Card,
	ChartSkeleton,
	type Column,
	EmptyState,
	errorRateTone,
	MeterCell,
	PageHeader,
	QueryView,
	SearchInput,
	Stat,
	StatGrid,
	Table,
	TableSkeleton,
} from "../ui";

export interface ProjectsRouteProps {
	active: boolean;
	range: TimeRange;
}

/** Rows rendered before "Show all": keeps the first paint cheap with tens of thousands of folders. */
const TABLE_LIMIT = 100;
const TOP_LIMIT = 8;

export function ProjectsRoute({ active, range }: ProjectsRouteProps) {
	const t = useT();
	const folders = useQuery(["projects", range], ({ signal }) => getFolderStats(range, signal), { enabled: active });
	const [search, setSearch] = useState("");
	// Benchmarks and scratch sessions can leave tens of thousands of one-off temp folders; hide them by default.
	const [hideTemporary, setHideTemporary] = useState(true);
	const query = useDeferredValue(search.trim().toLowerCase());

	const view = useMemo(() => buildFolderRows(folders.data ?? []), [folders.data]);
	const scoped = useMemo(
		() => (hideTemporary ? view.rows.filter(row => !row.temporary) : view.rows),
		[view, hideTemporary],
	);
	const matching = useMemo(
		() => (query ? scoped.filter(row => row.folder.toLowerCase().includes(query)) : scoped),
		[scoped, query],
	);
	const top = useMemo(
		() => ({
			cost: [...scoped].sort((a, b) => b.totalCost - a.totalCost).slice(0, TOP_LIMIT),
			requests: [...scoped].sort((a, b) => b.totalRequests - a.totalRequests).slice(0, TOP_LIMIT),
		}),
		[scoped],
	);
	const topEmpty = (
		<EmptyState
			title={view.rows.length === 0 ? t("projects.top.emptyNone") : t("projects.top.emptyTemp")}
		/>
	);
	// Meter scales follow the whole range so a bar's length does not change while filtering.
	const columns = useMemo(() => folderColumns(t, view.maxRequests, view.maxCost), [t, view]);

	return (
		<div className="page">
			<PageHeader title={t("nav.projects")} description={t("projects.header", { range: rangeWindowLabel(range) })} />

			<QueryView query={folders} skeleton={<ChartSkeleton height={96} />}>
				{() => (
					<div data-stale={folders.stale}>
						<StatGrid min={180}>
							<Stat
								label={t("projects.stat.folders")}
								value={formatInteger(view.rows.length)}
								hint={
									view.temporaryCount > 0
										? t("projects.stat.temporary", { count: view.temporaryCount })
										: undefined
								}
							/>
							<Stat
								label={t("projects.stat.requests")}
								value={formatInteger(view.totalRequests)}
								hint={t("projects.stat.failed", { count: view.failedRequests })}
							/>
							<Stat
								label={t("projects.stat.cost")}
								title={t("projects.stat.costTitle")}
								value={formatEstimatedCost(view.totalCost, view.unpricedRequests)}
								hint={
									view.unpricedRequests > 0
										? t("projects.stat.unpriced", { count: view.unpricedRequests })
										: undefined
								}
							/>
							<Stat
								label={t("projects.stat.tokens")}
								title={t("projects.tokensTitle")}
								value={formatCompact(view.conversationTokens)}
							/>
							<Stat
								label={t("projects.stat.cacheRate")}
								title={t("projects.stat.cacheRateTitle")}
								value={formatPercent(view.cacheRate)}
							/>
						</StatGrid>
					</div>
				)}
			</QueryView>

			<div className="grid grid-2">
				<Card index={1} title={t("projects.top.cost")} description={t("projects.top.costDesc")} stale={folders.stale}>
					<QueryView
						query={folders}
						skeleton={<ChartSkeleton height={236} />}
						isEmpty={() => top.cost.length === 0}
						empty={topEmpty}
					>
						{() => (
							<BarList
								items={top.cost.map(row => ({
									key: row.folder,
									label: <span className="mono">{formatFolder(row.folder)}</span>,
									value: row.totalCost,
									display: t("projects.top.valueShare", {
										value: formatEstimatedCost(row.totalCost, row.unpricedRequests),
										share: formatPercent(row.costShare),
									}),
									color: "var(--chart-secondary)",
								}))}
								onSelect={setSearch}
							/>
						)}
					</QueryView>
				</Card>
				<Card index={2} title={t("projects.top.requests")} description={t("projects.top.requestsDesc")} stale={folders.stale}>
					<QueryView
						query={folders}
						skeleton={<ChartSkeleton height={236} />}
						isEmpty={() => top.requests.length === 0}
						empty={topEmpty}
					>
						{() => (
							<BarList
								items={top.requests.map(row => ({
									key: row.folder,
									label: <span className="mono">{formatFolder(row.folder)}</span>,
									value: row.totalRequests,
									display: t("projects.top.valueShare", {
										value: formatInteger(row.totalRequests),
										share: formatPercent(row.requestShare),
									}),
								}))}
								onSelect={setSearch}
							/>
						)}
					</QueryView>
				</Card>
			</div>

			<Card
				index={3}
				title={t("projects.table.title")}
				description={
					folders.data
						? matching.length === view.rows.length
							? t("projects.table.count", { count: view.rows.length })
							: t("projects.table.filtered", { shown: formatInteger(matching.length), total: formatInteger(view.rows.length) })
						: undefined
				}
				actions={
					<>
						{view.temporaryCount > 0 && (
							<label className="check" title={t("projects.table.hideTemporaryTitle")}>
								<input
									type="checkbox"
									checked={hideTemporary}
									onChange={e => setHideTemporary(e.target.checked)}
								/>
								{t("projects.table.hideTemporary", { count: view.temporaryCount })}
							</label>
						)}
						<SearchInput value={search} onChange={setSearch} placeholder={t("projects.table.filterPlaceholder")} width={240} />
					</>
				}
				flush
				stale={folders.stale}
			>
				<QueryView query={folders} skeleton={<TableSkeleton rows={10} />}>
					{() => (
						<Table
							rows={matching}
							rowKey={row => row.folder}
							columns={columns}
							initialSort={{ key: "cost", dir: "desc" }}
							limit={TABLE_LIMIT}
							dense
							empty={
								<EmptyState
									title={view.rows.length === 0 ? t("projects.top.emptyNone") : t("projects.table.emptyFiltered")}
									hint={
										view.rows.length === 0
											? t("projects.table.hintNone")
											: hideTemporary && view.temporaryCount > 0
												? t("projects.table.hintHidden")
												: undefined
									}
								/>
							}
						/>
					)}
				</QueryView>
			</Card>
		</div>
	);
}

/** The `t` translator from ../i18n; structural so column builders stay pure. */
type Translate = (key: string, params?: Record<string, string | number>) => string;

function folderColumns(t: Translate, maxRequests: number, maxCost: number): Column<FolderRowView>[] {
	return [
		{
			key: "folder",
			header: t("projects.col.folder"),
			sort: row => row.folder,
			render: row => (
				<span className="row" style={{ gap: 8, maxWidth: 280, minWidth: 0 }} title={row.folder || t("projects.cell.root")}>
					<span className="mono truncate">{formatFolder(row.folder)}</span>
					{row.temporary && <Badge>{t("projects.cell.temp")}</Badge>}
				</span>
			),
		},
		{
			key: "requests",
			header: t("projects.col.requests"),
			align: "right",
			sort: row => row.totalRequests,
			render: row => (
				<span title={t("projects.cell.requestShare", { share: formatPercent(row.requestShare) })}>
					<MeterCell value={row.totalRequests} max={maxRequests} display={formatInteger(row.totalRequests)} />
				</span>
			),
		},
		{
			key: "cost",
			header: t("projects.col.cost"),
			title: t("projects.col.costTitle"),
			align: "right",
			sort: row => row.totalCost,
			render: row => (
				<span title={t("projects.cell.costShare", { share: formatPercent(row.costShare) })}>
					<MeterCell
						value={row.totalCost}
						max={maxCost}
						display={formatEstimatedCost(row.totalCost, row.unpricedRequests)}
						color="var(--chart-secondary)"
					/>
				</span>
			),
		},
		{
			key: "tokens",
			header: t("projects.col.tokens"),
			title: t("projects.tokensTitle"),
			align: "right",
			sort: row => row.conversationTokens,
			render: row => (
				<span className="num" title={formatInteger(row.conversationTokens)}>
					{formatCompact(row.conversationTokens)}
				</span>
			),
		},
		{
			key: "payload",
			header: t("projects.col.payload"),
			title: t("projects.col.payloadTitle"),
			align: "right",
			sort: row => row.totalRequestKb + row.totalResponseKb,
			render: row => (
				<span
					className="num muted"
					title={t("projects.cell.payloadTitle", {
						request: formatKb(row.totalRequestKb),
						response: formatKb(row.totalResponseKb),
					})}
				>
					{formatPayloadKb(row.totalRequestKb)} / {formatPayloadKb(row.totalResponseKb)}
				</span>
			),
		},
		{
			key: "cacheRate",
			header: t("projects.col.cacheRate"),
			title: t("projects.col.cacheRateTitle"),
			align: "right",
			sort: row => row.cacheRate,
			render: row => <span className="num">{formatPercent(row.cacheRate)}</span>,
		},
		{
			key: "cacheSavings",
			header: t("projects.col.cacheSavings"),
			title: t("projects.col.cacheSavingsTitle"),
			align: "right",
			sort: row => row.cacheSavings,
			render: row => (
				<span className={`num ${row.cacheSavings < 0 ? "tone-bad" : "muted"}`}>
					{formatPercent(row.cacheSavings)}
				</span>
			),
		},
		{
			key: "errorRate",
			header: t("projects.col.errors"),
			align: "right",
			sort: row => row.errorRate,
			render: row => (
				<span title={t("projects.cell.failed", { count: row.failedRequests })}>
					<Badge tone={row.failedRequests > 0 ? errorRateTone(row.errorRate) : "neutral"} mono>
						{formatErrorRate(row.errorRate)}
					</Badge>
				</span>
			),
		},
		{
			key: "duration",
			header: t("projects.col.duration"),
			align: "right",
			sort: row => row.avgDuration ?? -1,
			render: row => <span className="num">{formatDurationMs(row.avgDuration)}</span>,
		},
		{
			key: "last",
			header: t("projects.col.last"),
			align: "right",
			sort: row => row.lastTimestamp,
			render: row => <span className="dim">{formatRelativeTime(row.lastTimestamp)}</span>,
		},
	];
}
