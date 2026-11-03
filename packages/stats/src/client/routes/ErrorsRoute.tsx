import { Button, theme } from "antd";
import { ArrowUpRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getRecentErrors } from "../api";
import { BarList } from "../charts";
import { modelKey } from "../data/colors";
import {
	formatCompact,
	formatFolder,
	formatInteger,
	formatMessageCost,
	formatRelativeTime,
	formatTimestamp,
} from "../data/formatters";
import { useQuery } from "../data/query";
import { rangeWindowLabel } from "../data/range";
import { type ErrorGroupView, errorSignature, groupErrorsBySignature } from "../data/view-models";
import { useT } from "../i18n";
import type { MessageStats, TimeRange } from "../types";
import {
	Card,
	type Column,
	EmptyState,
	LabelCell,
	MeterCell,
	PageHeader,
	QueryView,
	SearchInput,
	Skeleton,
	Stat,
	StatGrid,
	Table,
	TableSkeleton,
	Badge,
} from "../ui";

export interface ErrorsRouteProps {
	active: boolean;
	range: TimeRange;
	onRequestClick: (id: number) => void;
}

/** How many of the newest failures to load; "Load more" steps through these. */
const LOAD_STEPS = [50, 200, 1_000] as const;

export function ErrorsRoute({ active, range, onRequestClick }: ErrorsRouteProps) {
	const t = useT();
	const { token } = theme.useToken();
	const [step, setStep] = useState(0);
	const limit = LOAD_STEPS[step];
	const errors = useQuery(["errors", range, limit], ({ signal }) => getRecentErrors(range, limit, signal), {
		enabled: active,
	});
	const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
	const [selectedModel, setSelectedModel] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const windowLabel = rangeWindowLabel(range);

	const view = useMemo(() => {
		const rows = (errors.data ?? []).map(row => ({ row, signature: errorSignature(row.errorMessage) }));
		const groups = groupErrorsBySignature(errors.data ?? []);
		const byModel = new Map<string, { model: string; provider: string; count: number }>();
		for (const { row } of rows) {
			const key = modelKey(row.model, row.provider);
			const entry = byModel.get(key);
			if (entry) entry.count++;
			else byModel.set(key, { model: row.model, provider: row.provider, count: 1 });
		}
		const models = [...byModel.entries()]
			.map(([key, entry]) => ({ key, ...entry }))
			.sort((a, b) => b.count - a.count || a.model.localeCompare(b.model));
		const newest = rows.reduce<MessageStats | null>(
			(best, { row }) => (!best || row.timestamp > best.timestamp ? row : best),
			null,
		);
		return { rows, groups, models, newest };
	}, [errors.data]);

	// Selections that no longer exist in this range's data are ignored.
	const signature = view.groups.some(g => g.signature === selectedSignature) ? selectedSignature : null;
	const model = view.models.some(m => m.key === selectedModel) ? selectedModel : null;

	const filtered = useMemo(() => {
		const needle = search.trim().toLowerCase();
		return view.rows
			.filter(
				entry =>
					(signature === null || entry.signature === signature) &&
					(model === null || modelKey(entry.row.model, entry.row.provider) === model) &&
					(needle === "" ||
						entry.row.model.toLowerCase().includes(needle) ||
						entry.row.provider.toLowerCase().includes(needle) ||
						entry.row.folder.toLowerCase().includes(needle) ||
						(entry.row.errorMessage ?? "").toLowerCase().includes(needle)),
			)
			.map(entry => entry.row);
	}, [view.rows, signature, model, search]);

	const loaded = errors.data?.length ?? 0;
	// The server applies the range; fewer rows than the limit means we have them all.
	const complete = !errors.stale && loaded < limit;
	const nextStep = step + 1 < LOAD_STEPS.length ? LOAD_STEPS[step + 1] : null;
	const footer =
		errors.data !== null && !complete ? (
			<>
				<span>
					{t("errors.footer.partial", { count: loaded, window: windowLabel })}
				</span>
				{nextStep !== null && (
					<Button type="default" size="small" disabled={errors.refreshing} onClick={() => setStep(step + 1)}>
						{errors.refreshing && errors.stale
							? t("errors.loadingMore")
							: t("errors.loadMore", { count: nextStep })}
					</Button>
				)}
			</>
		) : undefined;

	const maxGroup = view.groups[0]?.count ?? 0;
	const groupColumns = useMemo(
		() =>
			buildGroupColumns(t, token.fontFamilyCode, token.colorTextTertiary, token.colorError, maxGroup),
		[t, token, maxGroup],
	);
	const failureColumns = useMemo(
		() => buildFailureColumns(t, token.fontFamilyCode, token.colorTextTertiary, token.colorError),
		[t, token],
	);
	const selectedModelInfo = view.models.find(m => m.key === model);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
			<PageHeader
				title={t("errors.title")}
				description={t("errors.description", { window: windowLabel })}
			/>

			<QueryView query={errors} skeleton={<Skeleton height={96} style={{ borderRadius: 12 }} />}>
				{() => (
					<div data-stale={errors.stale}>
						<StatGrid min={170}>
							<Stat
								label={t("errors.stat.failures")}
								value={formatInteger(loaded)}
								hint={
									complete
										? t("errors.stat.failures.complete", { window: windowLabel })
										: t("errors.stat.failures.partial", { count: loaded })
								}
							/>
							<Stat
								label={t("errors.stat.signatures")}
								title={t("errors.stat.signatures.title")}
								value={formatInteger(view.groups.length)}
								hint={
									view.groups[0]
										? t("errors.stat.signatures.top", { count: view.groups[0].count })
										: undefined
								}
							/>
							<Stat
								label={t("errors.stat.models")}
								value={formatInteger(view.models.length)}
								hint={view.models[0]?.model}
							/>
							<Stat
								label={t("errors.stat.last")}
								value={view.newest ? formatRelativeTime(view.newest.timestamp) : "–"}
								hint={
									view.newest
										? formatTimestamp(view.newest.timestamp)
										: t("errors.stat.last.noneIn", { window: windowLabel })
								}
							/>
						</StatGrid>
					</div>
				)}
			</QueryView>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
					gap: 16,
				}}
			>
				<Card
					index={1}
					title={t("errors.sig.title")}
					description={t("errors.sig.description")}
					flush
					stale={errors.stale}
				>
					<QueryView
						query={errors}
						skeleton={<TableSkeleton rows={8} />}
						isEmpty={rows => rows.length === 0}
						empty={
							<EmptyState
								title={t("errors.sig.empty", { window: windowLabel })}
								hint={t("errors.sig.emptyHint")}
							/>
						}
					>
						{() => (
							<Table
								rows={view.groups}
								rowKey={group => group.signature}
								columns={groupColumns}
								onRowClick={group =>
									setSelectedSignature(signature === group.signature ? null : group.signature)
								}
								selectedKey={signature}
								expanded={group =>
									group.signature === signature ? (
										<SignatureDetail group={group} onRequestClick={onRequestClick} />
									) : null
								}
								limit={12}
							/>
						)}
					</QueryView>
				</Card>

				<Card
					index={2}
					title={t("errors.model.title")}
					description={t("errors.model.description")}
					stale={errors.stale}
				>
					<QueryView
						query={errors}
						skeleton={<Skeleton height={180} />}
						isEmpty={rows => rows.length === 0}
						empty={<EmptyState title={t("errors.model.empty")} />}
					>
						{() => (
							<BarList
								items={view.models.slice(0, 12).map(m => ({
									key: m.key,
									label: (
										<span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
											<span
												style={{
													fontFamily: token.fontFamilyCode,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{m.model}
											</span>
											<span
												style={{
													color: token.colorTextTertiary,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{m.provider}
											</span>
										</span>
									),
									value: m.count,
									color:
										m.key === model
											? token.colorError
											: `color-mix(in srgb, ${token.colorError} 45%, transparent)`,
								}))}
								onSelect={key => setSelectedModel(model === key ? null : key)}
							/>
						)}
					</QueryView>
				</Card>
			</div>

			<Card
				index={3}
				title={t("errors.fail.title")}
				description={
					errors.data === null
						? t("errors.fail.loading")
						: t("errors.fail.count", {
								shown: formatInteger(filtered.length),
								total: formatInteger(loaded),
							})
				}
				actions={
					<>
						{signature !== null && (
							<Button
								type="default"
								size="small"
								onClick={() => setSelectedSignature(null)}
								title={signature}
								style={{ maxWidth: 260 }}
							>
								<span
									style={{
										fontFamily: token.fontFamilyCode,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										minWidth: 0,
									}}
								>
									{signature}
								</span>
								<X size={12} />
							</Button>
						)}
						{selectedModelInfo && (
							<Button
								type="default"
								size="small"
								onClick={() => setSelectedModel(null)}
								style={{ maxWidth: 260 }}
							>
								<span
									style={{
										fontFamily: token.fontFamilyCode,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										minWidth: 0,
									}}
								>
									{selectedModelInfo.model}
								</span>
								<X size={12} />
							</Button>
						)}
						<SearchInput
							value={search}
							onChange={setSearch}
							placeholder={t("errors.search.placeholder")}
						/>
					</>
				}
				flush
				stale={errors.stale}
				footer={footer}
			>
				<QueryView
					query={errors}
					skeleton={<TableSkeleton rows={10} />}
					isEmpty={rows => rows.length === 0}
					empty={<EmptyState title={t("errors.fail.empty.range", { window: windowLabel })} />}
				>
					{() => (
						<Table
							rows={filtered}
							rowKey={row => row.id ?? `${row.sessionFile}:${row.entryId}`}
							onRowClick={row => row.id !== undefined && onRequestClick(row.id)}
							columns={failureColumns}
							initialSort={{ key: "time", dir: "desc" }}
							limit={50}
							dense
							empty={
								<EmptyState title={t("errors.fail.empty.filter")} hint={t("errors.fail.empty.hint")} />
							}
						/>
					)}
				</QueryView>
			</Card>
		</div>
	);
}

/** The dashboard translate function; declared structurally since it lives in the off-limits i18n core. */
type Translate = (key: string, params?: Record<string, string | number>) => string;

function buildGroupColumns(
	t: Translate,
	monoFont: string,
	mutedColor: string,
	errorColor: string,
	maxCount: number,
): Column<ErrorGroupView>[] {
	const mono = { fontFamily: monoFont };
	const muted = { color: mutedColor };
	return [
		{
			key: "signature",
			header: t("errors.sig.col.signature"),
			wrap: true,
			sort: group => group.signature,
			render: group => (
				<span
					style={{
						...mono,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						fontSize: 12,
						lineHeight: 1.5,
						overflowWrap: "anywhere",
					}}
					title={group.latest.errorMessage ?? undefined}
				>
					{group.signature}
				</span>
			),
		},
		{
			key: "models",
			header: t("errors.sig.col.models"),
			sort: group => group.models.length,
			render: group => (
				<LabelCell
					primary={<span style={mono}>{group.models[0]?.model}</span>}
					secondary={
						group.models.length > 1
							? t("errors.sig.more", { count: group.models.length - 1 })
							: group.models[0]?.provider
					}
				/>
			),
		},
		{
			key: "last",
			header: t("errors.sig.col.last"),
			sort: group => group.lastSeen,
			render: group => (
				<span style={muted} title={formatTimestamp(group.lastSeen)}>
					{formatRelativeTime(group.lastSeen)}
				</span>
			),
		},
		{
			key: "count",
			header: t("errors.sig.col.count"),
			align: "right",
			width: 120,
			sort: group => group.count,
			render: group => (
				<MeterCell value={group.count} max={maxCount} display={formatInteger(group.count)} color={errorColor} />
			),
		},
	];
}

function SignatureDetail({ group, onRequestClick }: { group: ErrorGroupView; onRequestClick: (id: number) => void }) {
	const t = useT();
	const { token } = theme.useToken();
	const latestId = group.latest.id;
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 10,
				padding: "4px 16px 14px",
				background: token.colorFillQuaternary,
				borderBottom: `1px solid ${token.colorBorderSecondary}`,
			}}
		>
			<pre
				style={{
					margin: 0,
					maxHeight: 200,
					overflow: "auto",
					fontFamily: token.fontFamilyCode,
					fontSize: 12,
					lineHeight: 1.55,
					color: token.colorText,
					whiteSpace: "pre-wrap",
					overflowWrap: "anywhere",
				}}
			>
				{group.latest.errorMessage ?? t("errors.detail.unknown")}
			</pre>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 8,
					flexWrap: "wrap",
					fontSize: 12.5,
				}}
			>
				<span style={{ color: token.colorTextTertiary }}>
					{t("errors.detail.meta", {
						count: group.count,
						first: formatTimestamp(group.firstSeen),
						last: formatTimestamp(group.lastSeen),
					})}
				</span>
				{latestId !== undefined && (
					<Button type="default" size="small" onClick={() => onRequestClick(latestId)}>
						{t("errors.detail.openLatest")} <ArrowUpRight size={13} />
					</Button>
				)}
			</div>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
				{group.models.map(m => (
					<Badge key={modelKey(m.model, m.provider)} mono>
						{m.model}{" "}
						<span style={{ color: token.colorTextTertiary }}>{m.provider}</span>{" "}
						<span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCompact(m.count)}</span>
					</Badge>
				))}
			</div>
		</div>
	);
}

function buildFailureColumns(
	t: Translate,
	monoFont: string,
	mutedColor: string,
	errorColor: string,
): readonly Column<MessageStats>[] {
	const mono = { fontFamily: monoFont };
	const muted = { color: mutedColor };
	const num = { fontVariantNumeric: "tabular-nums" };
	return [
		{
			key: "time",
			header: t("errors.col.time"),
			width: 120,
			sort: row => row.timestamp,
			render: row => (
				<span style={muted} title={formatTimestamp(row.timestamp)}>
					{formatRelativeTime(row.timestamp)}
				</span>
			),
		},
		{
			key: "model",
			header: t("errors.col.model"),
			sort: row => row.model,
			render: row => <LabelCell primary={<span style={mono}>{row.model}</span>} secondary={row.provider} />,
		},
		{
			key: "error",
			header: t("errors.col.error"),
			sort: row => row.errorMessage ?? "",
			render: row => (
				<span
					style={{
						...mono,
						display: "block",
						maxWidth: 520,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						fontSize: 12,
						color: errorColor,
					}}
					title={row.errorMessage ?? undefined}
				>
					{row.errorMessage ?? t("errors.detail.unknown")}
				</span>
			),
		},
		{
			key: "project",
			header: t("errors.col.project"),
			sort: row => row.folder,
			render: row => (
				<span style={{ ...mono, ...muted }} title={row.folder}>
					{formatFolder(row.folder)}
				</span>
			),
		},
		{
			key: "tokens",
			header: t("errors.col.tokens"),
			align: "right",
			sort: row => row.usage.totalTokens,
			render: row => <span style={num}>{formatInteger(row.usage.totalTokens)}</span>,
		},
		{
			key: "cost",
			header: t("errors.col.cost"),
			title: t("errors.col.cost.title"),
			align: "right",
			sort: row => row.usage.cost.total,
			render: row => <span style={num}>{formatMessageCost(row, 4)}</span>,
		},
	];
}
