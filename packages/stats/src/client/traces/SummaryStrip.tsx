/**
 * Headline tiles for one trace: wall time split into model/tool/idle, then
 * turns, requests, tool calls, agents, tokens, cost.
 */

import { formatCompact, formatElapsed, formatEstimatedCost, formatInteger, formatPercent } from "../data/formatters";
import { useT } from "../i18n";
import type { TraceSummary } from "../types";
import { Stat, StatGrid } from "../ui";

export interface SummaryStripProps {
	summary: TraceSummary;
}

export function SummaryStrip({ summary }: SummaryStripProps) {
	const t = useT();
	const share = (ms: number) =>
		summary.wallMs > 0 ? t("traces.summary.ofWall", { pct: formatPercent(ms / summary.wallMs) }) : undefined;
	return (
		<StatGrid min={112}>
			<Stat size="sm" label={t("traces.summary.wall")} value={formatElapsed(summary.wallMs)} />
			<Stat size="sm" label={t("traces.summary.model")} value={formatElapsed(summary.modelMs)} hint={share(summary.modelMs)} />
			<Stat size="sm" label={t("traces.summary.tool")} value={formatElapsed(summary.toolMs)} hint={share(summary.toolMs)} />
			<Stat size="sm" label={t("traces.summary.idle")} value={formatElapsed(summary.idleMs)} hint={share(summary.idleMs)} />
			<Stat size="sm" label={t("traces.summary.turns")} value={formatInteger(summary.turns)} />
			<Stat
				size="sm"
				label={t("traces.summary.requests")}
				value={formatInteger(summary.requests)}
				hint={t("traces.summary.toolCalls", { count: summary.toolCalls, value: formatInteger(summary.toolCalls) })}
			/>
			<Stat size="sm" label={t("traces.summary.agents")} value={formatInteger(summary.subagents)} />
			<Stat size="sm" label={t("traces.summary.tokens")} value={formatCompact(summary.totalTokens)} />
			<Stat size="sm" label={t("traces.summary.cost")} value={formatEstimatedCost(summary.costTotal, summary.unpricedRequests)} />
		</StatGrid>
	);
}
