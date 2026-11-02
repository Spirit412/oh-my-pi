import { Button, theme } from "antd";
import { GitBranch } from "lucide-react";
import { getRequestDetails } from "../api";
import {
	formatCost,
	formatDurationMs,
	formatFolder,
	formatInteger,
	formatKb,
	formatMessageCost,
	formatRelativeTime,
	formatTimestamp,
	formatTokensPerSecond,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { buildHash, parseHash } from "../data/useHashRoute";
import { type RequestStatus, requestStatus, toolCallSource } from "../data/view-models";
import { t, useT } from "../i18n";
import type { RequestDetails, ToolCallDetail } from "../types";
import { Badge, type Tone } from "./Badge";
import { Drawer, KeyValues } from "./Drawer";
import { JsonBlock } from "./JsonBlock";
import { ErrorState, Skeleton } from "./States";

/** Label and tone for each tool origin kind. */
const TOOL_KIND_TONE: Record<ToolCallDetail["kind"], Tone> = {
	mcp: "accent",
	skill: "ok",
	script: "warn",
	builtin: "neutral",
};

/**
 * Label and tone for each request outcome; shared by the request tables.
 * Labels come from the requests dictionary; the locale is fixed at page load,
 * so evaluating them at module scope is safe.
 */
export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: Tone }> = {
	ok: { label: t("requests.status.ok"), tone: "ok" },
	aborted: { label: t("requests.status.aborted"), tone: "warn" },
	failed: { label: t("requests.status.failed"), tone: "bad" },
};

export interface RequestDrawerProps {
	id: number | null;
	onClose: () => void;
}

/** Full detail sheet for one model request: timing, tokens, cost, ids, error, and the raw session entry. */
export function RequestDrawer({ id, onClose }: RequestDrawerProps) {
	const t = useT();
	const { token } = theme.useToken();
	const query = useQuery(["request", id], ({ signal }) => getRequestDetails(id ?? 0, signal), {
		enabled: id !== null,
	});
	// Never show the previous request's payload under a new id.
	const details = query.stale ? null : query.data;
	const status = details ? REQUEST_STATUS[requestStatus(details)] : null;

	return (
		<Drawer
			open={id !== null}
			onClose={onClose}
			width={620}
			title={details ? <span style={{ fontFamily: token.fontFamilyCode }}>{details.model}</span> : t("drawer.title")}
			subtitle={
				details ? (
					<>
						{details.provider} ·{" "}
						<span title={formatTimestamp(details.timestamp)}>{formatRelativeTime(details.timestamp)}</span>
					</>
				) : id !== null ? (
					<span style={{ fontFamily: token.fontFamilyCode }}>#{id}</span>
				) : undefined
			}
			actions={
				details && status ? (
					<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
						<Button
							size="small"
							href={buildHash({
								...parseHash(window.location.hash),
								section: "traces",
								session: details.sessionFile,
							})}
							onClick={onClose}
							title={t("drawer.trace.title")}
						>
							<GitBranch size={13} /> {t("drawer.trace")}
						</Button>
						<Badge tone={status.tone}>{status.label}</Badge>
					</div>
				) : undefined
			}
		>
			{details ? (
				<RequestDetailsBody details={details} aborted={requestStatus(details) === "aborted"} />
			) : query.error ? (
				<ErrorState error={query.error} onRetry={query.refetch} />
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					<Skeleton height={56} />
					<Skeleton height={120} />
					<Skeleton height={120} />
					<Skeleton height={220} />
				</div>
			)}
		</Drawer>
	);
}

function SectionLabel({ children }: { children: string }) {
	const { token } = theme.useToken();
	return (
		<div style={{ fontSize: 12, fontWeight: 600, color: token.colorTextSecondary, marginBottom: 8 }}>
			{children}
		</div>
	);
}

function RequestDetailsBody({ details, aborted }: { details: RequestDetails; aborted: boolean }) {
	const t = useT();
	const { token } = theme.useToken();
	const { usage } = details;
	const throughput =
		details.duration !== null && details.duration > 0 && usage.output > 0
			? (usage.output * 1000) / details.duration
			: null;
	// The stats row as ingested, without the session payload shown separately below.
	const { messages, output, toolCalls, ...row } = details;
	const toneColor = aborted ? token.colorWarning : token.colorError;

	return (
		<>
			{details.errorMessage && (
				<section
					role="note"
					style={{
						padding: "10px 12px 12px",
						borderRadius: token.borderRadius,
						border: `1px solid color-mix(in srgb, ${toneColor} 35%, transparent)`,
						background: `color-mix(in srgb, ${toneColor} 10%, transparent)`,
					}}
				>
					<div style={{ fontSize: 12, fontWeight: 600, color: toneColor, marginBottom: 6 }}>
						{aborted ? t("drawer.aborted") : t("drawer.error")}
					</div>
					<pre
						style={{
							margin: 0,
							fontFamily: token.fontFamilyCode,
							fontSize: 12,
							lineHeight: 1.55,
							color: token.colorText,
							whiteSpace: "pre-wrap",
							overflowWrap: "anywhere",
							maxHeight: 240,
							overflow: "auto",
						}}
					>
						{details.errorMessage}
					</pre>
				</section>
			)}

			<section>
				<SectionLabel>{t("drawer.section.timing")}</SectionLabel>
				<KeyValues
					items={[
						{ key: "at", label: t("drawer.kv.started"), value: formatTimestamp(details.timestamp) },
						{ key: "duration", label: t("drawer.kv.duration"), value: formatDurationMs(details.duration) },
						{ key: "ttft", label: t("drawer.kv.ttft"), value: formatDurationMs(details.ttft) },
						{ key: "tps", label: t("drawer.kv.tps"), value: formatTokensPerSecond(throughput) },
					]}
				/>
			</section>

			<section>
				<SectionLabel>{t("drawer.section.tokens")}</SectionLabel>
				<KeyValues
					items={[
						{ key: "input", label: t("drawer.kv.uncachedInput"), value: formatInteger(usage.input) },
						{ key: "cacheRead", label: t("drawer.kv.cacheRead"), value: formatInteger(usage.cacheRead) },
						{ key: "cacheWrite", label: t("drawer.kv.cacheWrite"), value: formatInteger(usage.cacheWrite) },
						{ key: "output", label: t("drawer.kv.output"), value: formatInteger(usage.output) },
						{ key: "total", label: t("drawer.kv.total"), value: formatInteger(usage.totalTokens) },
						{
							key: "premium",
							label: t("drawer.kv.premium"),
							value: formatInteger(Math.round((usage.premiumRequests ?? 0) * 100) / 100),
						},
					]}
				/>
			</section>

			<section>
				<SectionLabel>{t("drawer.section.payload")}</SectionLabel>
				<KeyValues
					items={[
						{
							key: "request",
							label: t("drawer.kv.request"),
							value: (
								<span title={t("drawer.kv.request.title")}>{formatKb(details.requestKb)}</span>
							),
						},
						{
							key: "inputTokens",
							label: t("drawer.kv.promptTokens"),
							value: formatInteger(usage.input + usage.cacheRead),
						},
						{
							key: "response",
							label: t("drawer.kv.response"),
							value: (
								<span title={t("drawer.kv.response.title")}>{formatKb(details.responseKb)}</span>
							),
						},
						{ key: "outputTokens", label: t("drawer.kv.responseTokens"), value: formatInteger(usage.output) },
					]}
				/>
			</section>

			<section>
				<SectionLabel>{t("drawer.section.cost")}</SectionLabel>
				<KeyValues
					items={[
						{ key: "total", label: t("drawer.kv.costTotal"), value: formatMessageCost(details, 4) },
						{ key: "input", label: t("drawer.kv.input"), value: formatCost(usage.cost.input, 4) },
						{ key: "cacheRead", label: t("drawer.kv.cacheRead"), value: formatCost(usage.cost.cacheRead, 4) },
						{ key: "cacheWrite", label: t("drawer.kv.cacheWrite"), value: formatCost(usage.cost.cacheWrite, 4) },
						{ key: "output", label: t("drawer.kv.output"), value: formatCost(usage.cost.output, 4) },
					]}
				/>
			</section>

			<section>
				<SectionLabel>{t("drawer.section.identity")}</SectionLabel>
				<KeyValues
					items={[
						{ key: "id", label: t("drawer.kv.requestId"), value: details.id ?? "–" },
						{ key: "entry", label: t("drawer.kv.entryId"), value: details.entryId },
						{ key: "stop", label: t("drawer.kv.stopReason"), value: details.stopReason },
						{ key: "api", label: t("drawer.kv.api"), value: details.api },
						{
							key: "project",
							label: t("drawer.kv.project"),
							value: <span title={details.folder}>{formatFolder(details.folder)}</span>,
						},
					]}
				/>
				<div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 12 }}>
					<span style={{ fontSize: 12, color: "rgba(128,128,128,1)" }}>{t("drawer.kv.sessionFile")}</span>
					<span style={{ fontSize: 13 }}>{details.sessionFile}</span>
				</div>
			</section>

			{toolCalls.length > 0 && <ToolCallsSection calls={toolCalls} />}
			{output != null && <JsonBlock data={output} title={t("drawer.json.output")} />}
			<JsonBlock data={messages} title={t("drawer.json.entry")} initialCollapsed />
			<JsonBlock data={row} title={t("drawer.json.row")} initialCollapsed />
		</>
	);
}

/** Tool calls of the turn with the metadata derived at ingest and their argument previews. */
function ToolCallsSection({ calls }: { calls: ToolCallDetail[] }) {
	const t = useT();
	const { token } = theme.useToken();
	return (
		<section>
			<SectionLabel>{t("drawer.toolCalls", { count: calls.length })}</SectionLabel>
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				{calls.map(call => (
					<div
						key={call.toolCallId}
						style={{
							border: `1px solid ${token.colorBorderSecondary}`,
							borderRadius: token.borderRadius,
							padding: "8px 10px",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
							<span style={{ fontFamily: token.fontFamilyCode }}>{call.tool}</span>
							<Badge tone={TOOL_KIND_TONE[call.kind]}>{call.kind}</Badge>
							{call.isError === true && <Badge tone="bad">{t("drawer.tool.error")}</Badge>}
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 10,
								flexWrap: "wrap",
								marginTop: 4,
								fontSize: 12,
								color: token.colorTextTertiary,
							}}
						>
							<span>{toolCallSource(call)}</span>
							{call.target && (
								<span
									style={{
										fontFamily: token.fontFamilyCode,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
									title={call.target}
								>
									{call.target}
								</span>
							)}
							<span style={{ fontVariantNumeric: "tabular-nums" }}>
								{t("drawer.tool.args", { count: formatKb(call.argsChars / 1024) })}
							</span>
							{call.resultChars !== null && (
								<span style={{ fontVariantNumeric: "tabular-nums" }}>
									{t("drawer.tool.result", { count: formatKb(call.resultChars / 1024) })}
								</span>
							)}
						</div>
						{call.argsPreview && (
							<pre
								style={{
									margin: "6px 0 0",
									fontFamily: token.fontFamilyCode,
									fontSize: 11,
									lineHeight: 1.5,
									color: token.colorTextTertiary,
									whiteSpace: "pre-wrap",
									overflowWrap: "anywhere",
									maxHeight: 140,
									overflow: "auto",
								}}
							>
								{call.argsPreview}
							</pre>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
