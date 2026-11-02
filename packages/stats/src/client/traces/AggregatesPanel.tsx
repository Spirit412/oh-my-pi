/**
 * Per-tool duration aggregates for one trace (sortable; server order is total
 * time descending).
 */

import { formatDurationMs, formatInteger } from "../data/formatters";
import { useT } from "../i18n";
import type { TraceToolStat } from "../types";
import { Badge, Card, type Column, MeterCell, Table } from "../ui";

const numStyle = { fontVariantNumeric: "tabular-nums" } as const;
const monoStyle = { fontFamily: "var(--font-mono, ui-monospace, monospace)" } as const;

export interface AggregatesPanelProps {
	toolStats: TraceToolStat[];
	index?: number;
}

export function AggregatesPanel({ toolStats, index }: AggregatesPanelProps) {
	const t = useT();
	if (toolStats.length === 0) return null;
	const maxTotal = Math.max(...toolStats.map(stat => stat.totalMs));
	const columns: Column<TraceToolStat>[] = [
		{
			key: "tool",
			header: t("traces.aggs.tool"),
			render: row => <span style={monoStyle}>{row.tool}</span>,
			sort: row => row.tool,
		},
		{
			key: "calls",
			header: t("traces.aggs.calls"),
			align: "right",
			render: row => <span style={numStyle}>{formatInteger(row.calls)}</span>,
			sort: row => row.calls,
		},
		{
			key: "errors",
			header: t("traces.aggs.errors"),
			align: "right",
			render: row =>
				row.errors > 0 ? (
					<Badge tone="bad">{t("traces.aggs.failed", { count: row.errors, value: formatInteger(row.errors) })}</Badge>
				) : (
					<span style={{ ...numStyle, opacity: 0.6 }}>0</span>
				),
			sort: row => row.errors,
		},
		{
			key: "total",
			header: t("traces.aggs.total"),
			align: "right",
			width: 200,
			render: row => (
				<MeterCell value={row.totalMs} max={maxTotal} display={formatDurationMs(row.totalMs)} color="var(--warn)" />
			),
			sort: row => row.totalMs,
		},
		{
			key: "avg",
			header: t("traces.aggs.avg"),
			align: "right",
			render: row => <span style={numStyle}>{formatDurationMs(row.calls > 0 ? row.totalMs / row.calls : 0)}</span>,
			sort: row => (row.calls > 0 ? row.totalMs / row.calls : 0),
		},
		{
			key: "max",
			header: t("traces.aggs.max"),
			align: "right",
			render: row => <span style={numStyle}>{formatDurationMs(row.maxMs)}</span>,
			sort: row => row.maxMs,
		},
	];
	return (
		<Card
			title={t("traces.aggs.title")}
			description={t("traces.aggs.description", { count: toolStats.length, value: formatInteger(toolStats.length) })}
			flush
			index={index}
		>
			<Table columns={columns} rows={toolStats} rowKey={row => row.tool} dense limit={12} />
		</Card>
	);
}
