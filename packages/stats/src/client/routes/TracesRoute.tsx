/**
 * Traces section: root-session list (subagents folded in) that opens the
 * flamegraph trace viewer for a selected session.
 */

import { theme } from "antd";
import { type ReactNode, useMemo, useState } from "react";
import { getSessions } from "../api";
import {
	formatCompact,
	formatElapsed,
	formatEstimatedCost,
	formatInteger,
	formatRelativeTime,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { useT } from "../i18n";
import { TraceView } from "../traces/TraceView";
import type { SessionSummary } from "../types";
import {
	Badge,
	Card,
	type Column,
	EmptyState,
	LabelCell,
	MeterCell,
	PageHeader,
	QueryView,
	SearchInput,
	Table,
	TableSkeleton,
} from "../ui";

export interface TracesRouteProps {
	active: boolean;
	session: string | null;
	onOpenSession: (file: string | null) => void;
}

const SESSION_LIMIT = 200;

function ModelList({ models }: { models: string[] }) {
	const { token } = theme.useToken();
	const t = useT();
	if (models.length === 0) {
		return <span style={{ color: token.colorTextTertiary }}>-</span>;
	}
	return (
		<span
			title={models.join("\n")}
			style={{ display: "inline-flex", alignItems: "center", gap: 6, maxWidth: 220, minWidth: 0 }}
		>
			<span
				style={{
					fontFamily: token.fontFamilyCode,
					fontSize: 12,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{models[0]}
			</span>
			{models.length > 1 && <Badge mono>{t("tracesRoute.moreModels", { count: models.length - 1 })}</Badge>}
		</span>
	);
}

export function TracesRoute({ active, session, onOpenSession }: TracesRouteProps) {
	const { token } = theme.useToken();
	const t = useT();
	const [filter, setFilter] = useState("");
	const sessions = useQuery(
		["sessions", SESSION_LIMIT],
		({ signal }) => getSessions(SESSION_LIMIT, undefined, signal),
		{ pollMs: 30000, enabled: active && session === null },
	);

	const filtered = useMemo(() => {
		const rows = sessions.data ?? [];
		const needle = filter.trim().toLowerCase();
		if (!needle) return rows;
		return rows.filter(
			row =>
				(row.title ?? "").toLowerCase().includes(needle) ||
				row.folder.toLowerCase().includes(needle) ||
				row.models.some(model => model.toLowerCase().includes(needle)),
		);
	}, [sessions.data, filter]);

	const maxCost = useMemo(() => Math.max(0, ...filtered.map(row => row.costTotal)), [filtered]);

	const num = (value: number): ReactNode => (
		<span style={{ fontVariantNumeric: "tabular-nums" }}>{formatInteger(value)}</span>
	);

	const columns = useMemo<Column<SessionSummary>[]>(
		() => [
			{
				key: "title",
				header: t("tracesRoute.col.session"),
				width: "32%",
				render: row => (
					<LabelCell
						primary={row.title ?? row.file.split("/").pop()}
						secondary={
							<span style={{ fontFamily: token.fontFamilyCode, fontSize: 12 }}>
								{row.folder.split("/").slice(-2).join("/")}
							</span>
						}
					/>
				),
				sort: row => (row.title ?? row.file).toLowerCase(),
			},
			{ key: "models", header: t("tracesRoute.col.models"), render: row => <ModelList models={row.models} /> },
			{
				key: "started",
				header: t("tracesRoute.col.started"),
				align: "right",
				render: row => (
					<span style={{ color: token.colorTextTertiary }} title={new Date(row.startedAt).toLocaleString()}>
						{formatRelativeTime(row.startedAt)}
					</span>
				),
				sort: row => row.startedAt,
			},
			{
				key: "duration",
				header: t("tracesRoute.col.duration"),
				align: "right",
				render: row => <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatElapsed(row.endedAt - row.startedAt)}</span>,
				sort: row => row.endedAt - row.startedAt,
			},
			{
				key: "requests",
				header: t("tracesRoute.col.requests"),
				align: "right",
				render: row => num(row.requests),
				sort: row => row.requests,
			},
			{
				key: "toolCalls",
				header: t("tracesRoute.col.tools"),
				align: "right",
				render: row => num(row.toolCalls),
				sort: row => row.toolCalls,
			},
			{
				key: "subagents",
				header: t("tracesRoute.col.agents"),
				align: "right",
				render: row => (
					<span
						style={
							row.subagents > 0
								? { fontVariantNumeric: "tabular-nums" }
								: { fontVariantNumeric: "tabular-nums", color: token.colorTextTertiary }
						}
					>
						{formatInteger(row.subagents)}
					</span>
				),
				sort: row => row.subagents,
			},
			{
				key: "tokens",
				header: t("tracesRoute.col.tokens"),
				align: "right",
				render: row => (
					<span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCompact(row.totalTokens)}</span>
				),
				sort: row => row.totalTokens,
			},
			{
				key: "cost",
				header: t("tracesRoute.col.cost"),
				align: "right",
				width: 150,
				render: row => (
					<MeterCell
						value={row.costTotal}
						max={maxCost}
						display={formatEstimatedCost(row.costTotal, row.unpricedRequests)}
					/>
				),
				sort: row => row.costTotal,
			},
		],
		[maxCost, t, token],
	);

	if (session !== null) {
		return <TraceView file={session} active={active} onBack={() => onOpenSession(null)} />;
	}

	const total = sessions.data?.length ?? 0;
	const hasFilter = Boolean(filter.trim());
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
			<PageHeader title={t("nav.traces")} description={t("tracesRoute.description")} />
			<Card
				title={t("tracesRoute.cardTitle")}
				description={
					sessions.data
						? hasFilter
							? t("tracesRoute.cardDescription.filtered", {
									shown: formatInteger(filtered.length),
									total: formatInteger(total),
								})
							: t("tracesRoute.cardDescription.all", { total: formatInteger(total) })
						: undefined
				}
				actions={
					<SearchInput
						value={filter}
						onChange={setFilter}
						placeholder={t("tracesRoute.searchPlaceholder")}
						width={260}
					/>
				}
				flush
				index={0}
				stale={sessions.stale}
			>
				<QueryView
					query={sessions}
					skeleton={<TableSkeleton rows={10} />}
					isEmpty={rows => rows.length === 0}
					empty={<EmptyState title={t("tracesRoute.empty")} hint={t("tracesRoute.emptyHint")} />}
				>
					{() => (
						<Table
							columns={columns}
							rows={filtered}
							rowKey={row => row.file}
							onRowClick={row => onOpenSession(row.file)}
							initialSort={{ key: "started", dir: "desc" }}
						/>
					)}
				</QueryView>
			</Card>
		</div>
	);
}
