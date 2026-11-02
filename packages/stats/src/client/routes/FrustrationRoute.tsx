import { Button, Checkbox, Flex, Progress, theme } from "antd";
import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
	cancelFrustrationRun,
	getFrustrationDashboardStats,
	getFrustrationEstimate,
	startFrustrationRun,
} from "../api";
import { Chart, type ChartSeries, Legend, useHiddenSeries } from "../charts";
import { SERIES_COLORS } from "../data/colors";
import { formatCost, formatElapsed, formatInteger, formatPercent } from "../data/formatters";
import { useQuery } from "../data/query";
import { rangeWindowLabel } from "../data/range";
import { useT } from "../i18n";
import type {
	FrustrationCounts,
	FrustrationEstimate,
	FrustrationJobStatus,
	FrustrationModelStats,
	TimeRange,
} from "../types";
import {
	Badge,
	Card,
	ChartSkeleton,
	type Column,
	Dot,
	EmptyState,
	KeyValues,
	Modal,
	PageHeader,
	QueryView,
	Segmented,
	Stat,
	StatGrid,
	Table,
	TableSkeleton,
} from "../ui";

export interface FrustrationRouteProps {
	active: boolean;
	range: TimeRange;
}

/** While a judge run is active every poll re-renders with the verdicts landed so far. */
const RUNNING_POLL_MS = 1_000;
/** Rows under this many messages are too noisy to compare; hidden unless asked for. */
const MIN_MESSAGES = 50;
/** Below this judged share a row is mostly classified by the regex fallback. */
const MIN_JUDGED_SHARE = 0.5;
/** Segmented-control value for "every model class". */
const ALL_CLASSES = "*";

export function FrustrationRoute({ active, range }: FrustrationRouteProps) {
	const tt = useT();
	const [running, setRunning] = useState(false);
	const stats = useQuery(["frustration", range], ({ signal }) => getFrustrationDashboardStats(range, signal), {
		enabled: active,
		pollMs: running ? RUNNING_POLL_MS : undefined,
	});

	const jobState = stats.data?.job.state;
	useEffect(() => {
		if (jobState !== undefined) setRunning(jobState === "running");
	}, [jobState]);

	const { refetch } = stats;
	const handleRunStarted = useCallback(() => {
		setRunning(true);
		refetch();
	}, [refetch]);

	return (
		<Flex vertical gap={20}>
			<PageHeader title={tt("nav.frustration")} description={tt("frustration.subtitle", { window: rangeWindowLabel(range) })} />

			<QueryView query={stats} skeleton={<ChartSkeleton height={96} />}>
				{data => (
					<div data-stale={stats.stale}>
						<FrustrationSummary overall={data.overall} />
					</div>
				)}
			</QueryView>

			<QueryView query={stats} skeleton={<ChartSkeleton height={120} />}>
				{data => (
					<JudgePanel
						active={active}
						range={range}
						judgeAvailable={data.judgeAvailable}
						job={data.job}
						onRunStarted={handleRunStarted}
						onRunChanged={refetch}
					/>
				)}
			</QueryView>

			<QueryView
				query={stats}
				skeleton={
					<Card index={2} title={tt("frustration.models.title")}>
						<ChartSkeleton height={340} />
						<TableSkeleton rows={6} />
					</Card>
				}
			>
				{data => <FrustrationModelsSection models={data.byModel} stale={stats.stale} />}
			</QueryView>
		</Flex>
	);
}

/** `part / whole` as a percentage string; `–` when there is nothing to divide. */
function rate(part: number, whole: number): string {
	return whole > 0 ? formatPercent(part / whole) : "–";
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function FrustrationSummary({ overall }: { overall: FrustrationCounts }) {
	const tt = useT();
	const regex = overall.messages - overall.judged;
	return (
		<StatGrid min={170}>
			<Stat
				label={tt("frustration.summary.messages")}
				title={tt("frustration.summary.messages.title")}
				value={formatInteger(overall.messages)}
			/>
			<Stat
				label={tt("frustration.summary.coverage")}
				title={tt("frustration.summary.coverage.title")}
				value={rate(overall.judged, overall.messages)}
				hint={tt("frustration.summary.coverage.hint", {
					judged: formatInteger(overall.judged),
					regex: formatInteger(regex),
				})}
			/>
			<Stat
				label={tt("frustration.summary.annoyed")}
				title={tt("frustration.summary.annoyed.title")}
				value={rate(overall.annoyed, overall.messages)}
				hint={tt("frustration.summary.messagesCount", { count: formatInteger(overall.annoyed) })}
			/>
			<Stat
				label={tt("frustration.summary.atAssistant")}
				title={tt("frustration.summary.atAssistant.title")}
				value={rate(overall.atAssistant, overall.messages)}
				hint={tt("frustration.summary.messagesCount", { count: formatInteger(overall.atAssistant) })}
			/>
			<Stat
				label={tt("frustration.summary.angry")}
				title={tt("frustration.summary.angry.title")}
				value={rate(overall.angry, overall.messages)}
				hint={tt("frustration.summary.messagesCount", { count: formatInteger(overall.angry) })}
			/>
		</StatGrid>
	);
}

// ---------------------------------------------------------------------------
// Judge control
// ---------------------------------------------------------------------------

type EstimateState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; estimate: FrustrationEstimate; range: TimeRange };

interface JudgePanelProps {
	active: boolean;
	range: TimeRange;
	judgeAvailable: boolean;
	job: FrustrationJobStatus;
	onRunStarted: () => void;
	onRunChanged: () => void;
}

function JudgePanel({ active, range, judgeAvailable, job, onRunStarted, onRunChanged }: JudgePanelProps) {
	const tt = useT();
	const { token } = theme.useToken();
	const [modalOpen, setModalOpen] = useState(false);
	const [estimate, setEstimate] = useState<EstimateState>({ status: "loading" });
	const [starting, setStarting] = useState(false);
	const [startError, setStartError] = useState<string | null>(null);
	const [cancelling, setCancelling] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const estimateAbortRef = useRef<AbortController | null>(null);

	const running = job.state === "running";

	const closeModal = useCallback(() => {
		estimateAbortRef.current?.abort();
		estimateAbortRef.current = null;
		setModalOpen(false);
	}, []);

	// A hidden route must not leave a dialog (portalled to <body>) on screen.
	useEffect(() => {
		if (!active) closeModal();
	}, [active, closeModal]);
	useEffect(() => () => estimateAbortRef.current?.abort(), []);

	const openEstimate = () => {
		estimateAbortRef.current?.abort();
		const controller = new AbortController();
		estimateAbortRef.current = controller;
		const quotedRange = range;
		setEstimate({ status: "loading" });
		setStartError(null);
		setActionError(null);
		setModalOpen(true);
		getFrustrationEstimate(quotedRange, controller.signal).then(
			result => {
				if (!controller.signal.aborted) setEstimate({ status: "ready", estimate: result, range: quotedRange });
			},
			(err: unknown) => {
				if (!controller.signal.aborted) setEstimate({ status: "error", message: errorMessage(err) });
			},
		);
	};

	const proceed = async () => {
		if (estimate.status !== "ready") return;
		setStarting(true);
		setStartError(null);
		try {
			// Judge exactly the range that was quoted, even if the picker moved meanwhile.
			await startFrustrationRun(estimate.range);
			closeModal();
			onRunStarted();
		} catch (err) {
			setStartError(errorMessage(err));
		} finally {
			setStarting(false);
		}
	};

	const cancelRun = async () => {
		setCancelling(true);
		setActionError(null);
		try {
			await cancelFrustrationRun();
			onRunChanged();
		} catch (err) {
			setActionError(errorMessage(err));
		} finally {
			setCancelling(false);
		}
	};

	const quote = estimate.status === "ready" ? estimate.estimate : null;
	const primaryAction =
		estimate.status === "loading"
			? { label: tt("frustration.judge.proceed"), onClick: proceed, disabled: true }
			: quote?.available
				? {
						label: starting ? tt("frustration.judge.starting") : tt("frustration.judge.proceed"),
						onClick: proceed,
						disabled: starting || quote.messages === 0,
					}
				: undefined;

	const actionTitle = !judgeAvailable
		? tt("frustration.judge.title.unavailable")
		: running
			? tt("frustration.judge.title.running")
			: tt("frustration.judge.title.quote");

	return (
		<Card
			index={1}
			title={
				<>
					{tt("frustration.judge.title")} <JobBadge job={job} judgeAvailable={judgeAvailable} />
				</>
			}
			description={tt("frustration.judge.description")}
			actions={
				<Button
					type="primary"
					size="small"
					icon={<Sparkles size={13} />}
					disabled={!judgeAvailable || running}
					onClick={openEstimate}
					title={actionTitle}
				>
					{tt("frustration.judge.run")}
				</Button>
			}
		>
			<Flex vertical gap={10} style={{ fontSize: 13 }}>
				{running ? (
					<JudgeProgress job={job} cancelling={cancelling} onCancel={cancelRun} />
				) : (
					<JudgeResultLine job={job} />
				)}
				{!judgeAvailable && (
					<p style={{ margin: 0, fontSize: 12, color: token.colorTextTertiary }}>{tt("frustration.judge.unavailable")}</p>
				)}
				{actionError && (
					<p style={{ margin: 0, fontSize: 12, color: token.colorError }} role="alert">
						{actionError}
					</p>
				)}
			</Flex>

			<Modal
				open={modalOpen}
				title={tt("frustration.judge.modalTitle")}
				onClose={closeModal}
				primaryAction={primaryAction}
			>
				<EstimateBody estimate={estimate} />
				{startError && (
					<p style={{ margin: 0, fontSize: 12, color: token.colorError }} role="alert">
						{startError}
					</p>
				)}
			</Modal>
		</Card>
	);
}

function JobBadge({ job, judgeAvailable }: { job: FrustrationJobStatus; judgeAvailable: boolean }) {
	const tt = useT();
	switch (job.state) {
		case "running":
			return (
				<Badge tone="ok">
					<Dot tone="live" pulse /> {tt("frustration.badge.running")}
				</Badge>
			);
		case "done":
			return <Badge tone="ok">{tt("frustration.badge.done")}</Badge>;
		case "cancelled":
			return <Badge tone="warn">{tt("frustration.badge.cancelled")}</Badge>;
		case "failed":
			return <Badge tone="bad">{tt("frustration.badge.failed")}</Badge>;
		case "idle":
			return <Badge>{judgeAvailable ? tt("frustration.badge.notRun") : tt("frustration.badge.regexOnly")}</Badge>;
	}
}

function EstimateBody({ estimate }: { estimate: EstimateState }) {
	const tt = useT();
	const { token } = theme.useToken();
	if (estimate.status === "loading")
		return <p style={{ margin: 0, color: token.colorTextSecondary }}>{tt("frustration.judge.estimating")}</p>;
	if (estimate.status === "error") return <p style={{ margin: 0, color: token.colorError }}>{estimate.message}</p>;
	const quote = estimate.estimate;
	if (!quote.available) return <p style={{ margin: 0 }}>{quote.reason}</p>;
	if (quote.messages === 0) {
		return <p style={{ margin: 0 }}>{tt("frustration.judge.allJudged")}</p>;
	}
	const quoteBox: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		padding: "12px 14px",
		border: `1px solid ${token.colorBorderSecondary}`,
		borderRadius: token.borderRadius,
		background: token.colorFillTertiary,
	};
	return (
		<>
			<div style={quoteBox}>
				<span style={{ fontSize: 12, color: token.colorTextTertiary }}>{tt("frustration.judge.quoteLabel")}</span>
				<span style={{ fontSize: 22, fontWeight: 600, color: token.colorText, fontVariantNumeric: "tabular-nums" }}>
					{tt("frustration.judge.approx", { cost: formatCost(quote.cost) })}
				</span>
			</div>
			<KeyValues
				items={[
					{ key: "messages", label: tt("frustration.judge.unjudgedMessages"), value: formatInteger(quote.messages) },
					{ key: "chars", label: tt("frustration.judge.proseChars"), value: formatInteger(quote.chars) },
					{ key: "tokens", label: tt("frustration.judge.estimatedTokens"), value: formatInteger(quote.inputTokens) },
					{ key: "judge", label: tt("frustration.judge.judgeLabel"), value: quote.judge },
				]}
			/>
			<p style={{ margin: 0, fontSize: 12, color: token.colorTextTertiary }}>{tt("frustration.judge.footnote")}</p>
		</>
	);
}

function JudgeProgress({
	job,
	cancelling,
	onCancel,
}: {
	job: FrustrationJobStatus;
	cancelling: boolean;
	onCancel: () => void;
}) {
	const tt = useT();
	const { token } = theme.useToken();
	const finished = job.done + job.failed;
	const share = job.total > 0 ? Math.min(1, finished / job.total) : 0;
	const num: CSSProperties = { fontVariantNumeric: "tabular-nums" };
	return (
		<Flex vertical gap={8}>
			<Flex align="center" gap={10}>
				<span style={num}>
					{tt("frustration.progress.judged", {
						done: formatInteger(job.done),
						total: formatInteger(job.total),
					})}
				</span>
				<span style={{ ...num, color: token.colorTextSecondary }}>{formatPercent(share)}</span>
				<Flex flex={1} />
				<Button danger size="small" onClick={onCancel} disabled={cancelling}>
					{cancelling ? tt("frustration.progress.cancelling") : tt("frustration.progress.cancel")}
				</Button>
			</Flex>
			<Progress
				percent={share * 100}
				showInfo={false}
				size="small"
				strokeColor="var(--accent)"
				aria-label={tt("frustration.progress.judged", {
					done: formatInteger(job.done),
					total: formatInteger(job.total),
				})}
			/>
			<Flex wrap gap="4px 18px" style={{ fontSize: 12, color: token.colorTextSecondary }}>
				<span style={job.failed > 0 ? { color: token.colorError } : undefined}>
					{tt("frustration.progress.failed", { count: formatInteger(job.failed) })}
				</span>
				<span>
					{tt("frustration.progress.costSoFar")} <span style={num}>{formatCost(job.cost)}</span>
				</span>
				{job.judge && <span style={{ fontFamily: token.fontFamilyCode }}>{job.judge}</span>}
				{job.startedAt !== null && (
					<span>
						{tt("frustration.progress.elapsed")} {formatElapsed(Date.now() - job.startedAt)}
					</span>
				)}
				{job.startedAt !== null && job.done > 0 && (
					<span style={num}>
						{tt("frustration.progress.perSecond", {
							rate: (job.done / Math.max(1, (Date.now() - job.startedAt) / 1000)).toFixed(0),
						})}
					</span>
				)}
				{job.concurrency > 0 && (
					<span style={num}>
						{tt("frustration.progress.inFlight", { count: formatInteger(job.concurrency) })}
					</span>
				)}
			</Flex>
		</Flex>
	);
}

function JudgeResultLine({ job }: { job: FrustrationJobStatus }) {
	const tt = useT();
	const { token } = theme.useToken();
	const line: CSSProperties = { margin: 0, color: token.colorTextSecondary };
	const progress = tt("frustration.result.progress", {
		done: formatInteger(job.done),
		total: formatInteger(job.total),
	});
	const failed = job.failed > 0 ? tt("frustration.result.failed", { count: formatInteger(job.failed) }) : "";
	const judge = job.judge ? tt("frustration.result.withJudge", { name: job.judge }) : "";
	const elapsed =
		job.startedAt !== null && job.finishedAt !== null
			? tt("frustration.result.inTime", { time: formatElapsed(job.finishedAt - job.startedAt) })
			: "";
	switch (job.state) {
		case "idle":
			return <p style={line}>{tt("frustration.result.idle")}</p>;
		case "running":
			return null;
		case "done":
			return (
				<p style={line}>
					{tt("frustration.result.done", { parts: `${progress}${failed}${judge}${elapsed}`, cost: formatCost(job.cost) })}
				</p>
			);
		case "cancelled":
			return (
				<p style={line}>
					{tt("frustration.result.cancelled", {
						parts: `${progress}${failed}`,
						cost: formatCost(job.cost),
					})}
				</p>
			);
		case "failed":
			return (
				<p style={line}>
					{tt("frustration.result.failedRun", {
						parts: `${progress}${failed}`,
						error: job.error ?? tt("frustration.result.unknownError"),
						cost: formatCost(job.cost),
					})}
				</p>
			);
	}
}

// ---------------------------------------------------------------------------
// Per-model chart + table
// ---------------------------------------------------------------------------

/** Chart/filter identity of a model family: `class/family`. */
function familyKey(row: FrustrationModelStats): string {
	return `${row.modelClass}/${row.family ?? "unclassified"}`;
}

function isMostlyRegex(row: FrustrationModelStats): boolean {
	return row.messages > 0 && row.judged / row.messages < MIN_JUDGED_SHARE;
}

/** FNV-1a: a stable preferred palette slot per family, independent of range. */
function hashString(value: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/**
 * Deterministic family → palette color. Each family starts at its hashed slot
 * and probes forward past taken slots, so families present together stay
 * distinct (until the palette runs out) and keep their hue across ranges.
 */
function assignFamilyColors(models: readonly FrustrationModelStats[]): Map<string, string> {
	const keys = [...new Set(models.map(familyKey))].sort();
	const taken = new Set<number>();
	const colors = new Map<string, string>();
	for (const key of keys) {
		let slot = hashString(key) % SERIES_COLORS.length;
		for (let probe = 0; probe < SERIES_COLORS.length && taken.has(slot); probe++) {
			slot = (slot + 1) % SERIES_COLORS.length;
		}
		taken.add(slot);
		colors.set(key, SERIES_COLORS[slot]);
	}
	return colors;
}

/**
 * Stack layers, bottom first. `annoyed ⊇ atAssistant ⊇ angry`, so stacking the
 * differences draws each bar to the `annoyed` height with the subsets inside.
 */
const LAYERS = [
	{ key: "angry", labelKey: "frustration.layers.angry" },
	{ key: "assistant", labelKey: "frustration.layers.assistant" },
	{ key: "other", labelKey: "frustration.layers.other" },
] as const;
type Layer = (typeof LAYERS)[number]["key"];

/** Shades of one family hue for the three stacked layers. */
function layerColor(hue: string, layer: Layer): string {
	if (layer === "angry") return `color-mix(in srgb, ${hue} 55%, black)`;
	if (layer === "other") return `color-mix(in srgb, ${hue} 32%, transparent)`;
	return hue;
}

function layerCount(row: FrustrationModelStats, layer: Layer): number {
	if (layer === "angry") return row.angry;
	if (layer === "assistant") return row.atAssistant - row.angry;
	return row.annoyed - row.atAssistant;
}

function percent(part: number, whole: number): number {
	return whole > 0 ? (part / whole) * 100 : 0;
}

interface FamilyOption {
	key: string;
	label: string;
	messages: number;
}

function FrustrationModelsSection({ models, stale }: { models: FrustrationModelStats[]; stale: boolean }) {
	const tt = useT();
	const [selectedClass, setSelectedClass] = useState<string | null>(null);
	const [hiddenFamilies, toggleFamily] = useHiddenSeries();
	const [showSmall, setShowSmall] = useState(false);
	const [hideRegex, setHideRegex] = useState(false);

	const familyColors = useMemo(() => assignFamilyColors(models), [models]);

	const classes = useMemo(() => {
		const totals = new Map<string, number>();
		for (const row of models) totals.set(row.modelClass, (totals.get(row.modelClass) ?? 0) + row.messages);
		return totals;
	}, [models]);

	const defaultClass = useMemo(() => {
		let best: string | null = null;
		let bestMessages = -1;
		for (const [modelClass, messages] of classes) {
			if (messages > bestMessages) {
				best = modelClass;
				bestMessages = messages;
			}
		}
		return best ?? ALL_CLASSES;
	}, [classes]);

	const activeClass =
		selectedClass !== null && (selectedClass === ALL_CLASSES || classes.has(selectedClass))
			? selectedClass
			: defaultClass;

	const classOptions = useMemo(
		() => [
			{ value: ALL_CLASSES, label: tt("frustration.classes.all"), title: tt("frustration.classes.all.title") },
			...[...classes].map(([modelClass, messages]) => ({
				value: modelClass,
				label: modelClass,
				title: tt("frustration.summary.messagesCount", { count: formatInteger(messages) }),
			})),
		],
		[classes, tt],
	);

	const inClass = useMemo(
		() => (activeClass === ALL_CLASSES ? models : models.filter(row => row.modelClass === activeClass)),
		[models, activeClass],
	);

	const families = useMemo(() => {
		const byKey = new Map<string, FamilyOption>();
		for (const row of inClass) {
			const key = familyKey(row);
			const existing = byKey.get(key);
			if (existing) {
				existing.messages += row.messages;
				continue;
			}
			const family = row.family ?? "unclassified";
			byKey.set(key, {
				key,
				label: activeClass === ALL_CLASSES ? `${row.modelClass} · ${family}` : family,
				messages: row.messages,
			});
		}
		return [...byKey.values()];
	}, [inClass, activeClass]);

	const visibleFamilies = useMemo(
		() => inClass.filter(row => !hiddenFamilies.has(familyKey(row))),
		[inClass, hiddenFamilies],
	);
	const smallCount = visibleFamilies.filter(row => row.messages < MIN_MESSAGES).length;
	const regexCount = visibleFamilies.filter(isMostlyRegex).length;
	const rows = useMemo(
		() =>
			visibleFamilies.filter(
				row => (showSmall || row.messages >= MIN_MESSAGES) && !(hideRegex && isMostlyRegex(row)),
			),
		[visibleFamilies, showSmall, hideRegex],
	);

	if (models.length === 0) {
		return (
			<Card index={2} title={tt("frustration.models.title")} stale={stale}>
				<EmptyState title={tt("frustration.models.empty")} hint={tt("frustration.models.emptyHint")} />
			</Card>
		);
	}

	const hasRegexRows = rows.some(isMostlyRegex);
	const includeSmallLabel =
		tt("frustration.filters.includeSmall", { min: MIN_MESSAGES }) +
		(smallCount > 0 ? tt("frustration.filters.includeSmallCount", { count: formatInteger(smallCount) }) : "");
	const hideRegexLabel =
		tt("frustration.filters.hideRegex") +
		(regexCount > 0 ? tt("frustration.filters.hideRegexCount", { count: formatInteger(regexCount) }) : "");

	return (
		<>
			<Card
				index={2}
				title={tt("frustration.models.title")}
				description={tt("frustration.models.description")}
				stale={stale}
			>
				<Flex vertical gap={14}>
					<div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
						<Segmented
							size="sm"
							aria-label={tt("frustration.classes.aria")}
							options={classOptions}
							value={activeClass}
							onChange={setSelectedClass}
						/>
					</div>
					<Flex wrap align="flex-start" gap="8px 16px">
						<Legend
							items={families.map(family => ({
								key: family.key,
								label: family.label,
								color: familyColors.get(family.key) ?? SERIES_COLORS[0],
								value: formatInteger(family.messages),
							}))}
							hidden={hiddenFamilies}
							onToggle={toggleFamily}
						/>
						<Flex flex={1} />
						<Checkbox
							checked={showSmall}
							onChange={e => setShowSmall(e.target.checked)}
							title={tt("frustration.filters.includeSmallTitle", { min: MIN_MESSAGES })}
						>
							{includeSmallLabel}
						</Checkbox>
						<Checkbox
							checked={hideRegex}
							onChange={e => setHideRegex(e.target.checked)}
							title={tt("frustration.filters.hideRegexTitle", { share: MIN_JUDGED_SHARE * 100 })}
						>
							{hideRegexLabel}
						</Checkbox>
					</Flex>
					<EncodingKey hasRegexRows={hasRegexRows} />
					<FrustrationChart rows={rows} familyColors={familyColors} />
				</Flex>
			</Card>
			<FrustrationTable rows={rows} familyColors={familyColors} stale={stale} />
		</>
	);
}

/** What the marks mean: layer shades, hatching and the trend line (hue = family). */
function EncodingKey({ hasRegexRows }: { hasRegexRows: boolean }) {
	const tt = useT();
	const { token } = theme.useToken();
	const layerTone = token.colorTextSecondary;
	const swatch = (background: string): CSSProperties => ({
		display: "inline-block",
		width: 10,
		height: 10,
		borderRadius: 3,
		background,
		flexShrink: 0,
	});
	const item: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6 };
	return (
		<Flex
			wrap
			align="center"
			gap="6px 16px"
			style={{
				paddingTop: 10,
				borderTop: `1px solid ${token.colorBorderSecondary}`,
				color: token.colorTextSecondary,
				fontSize: 12,
			}}
		>
			<span style={item}>
				<span style={swatch(`color-mix(in srgb, ${layerTone} 55%, black)`)} />
				{tt("frustration.layers.angry")}
			</span>
			<span style={item}>
				<span style={swatch(layerTone)} />
				{tt("frustration.layers.assistant")}
			</span>
			<span style={item}>
				<span style={swatch(`color-mix(in srgb, ${layerTone} 32%, transparent)`)} />
				{tt("frustration.layers.other")}
			</span>
			<span style={item}>
				<span style={{ width: 12, height: 2, borderRadius: 1, background: token.colorText, flexShrink: 0 }} />
				{tt("frustration.key.trend")}
			</span>
			<span
				style={{ ...item, maxWidth: "none" }}
				title={tt("frustration.key.hatchedTitle", { share: MIN_JUDGED_SHARE * 100 })}
			>
				<span
					style={swatch(
						`repeating-linear-gradient(45deg, ${layerTone} 0 1.6px, color-mix(in srgb, ${layerTone} 14%, transparent) 1.6px 3.5px)`,
					)}
				/>
				{hasRegexRows ? tt("frustration.key.hatched") : tt("frustration.key.hatchedNoRun")}
			</span>
			<span style={{ color: token.colorTextTertiary }}>{tt("frustration.key.hue")}</span>
		</Flex>
	);
}

function FrustrationChart({
	rows,
	familyColors,
}: {
	rows: FrustrationModelStats[];
	familyColors: Map<string, string>;
}) {
	const tt = useT();
	const { token } = theme.useToken();
	const series = useMemo((): ChartSeries[] => {
		// Bars take their family's hue, so every (layer, family, judged|regex)
		// combination is its own series with values only in that family's slots.
		const groups = new Map<string, { family: string; regex: boolean; slots: number[] }>();
		rows.forEach((row, i) => {
			const family = familyKey(row);
			const regex = isMostlyRegex(row);
			const id = `${family}|${regex ? "regex" : "judged"}`;
			const group = groups.get(id);
			if (group) group.slots.push(i);
			else groups.set(id, { family, regex, slots: [i] });
		});
		const out: ChartSeries[] = [];
		for (const layer of LAYERS) {
			for (const [id, group] of groups) {
				const values: (number | null)[] = rows.map(() => null);
				for (const i of group.slots) values[i] = percent(layerCount(rows[i], layer.key), rows[i].messages);
				out.push({
					key: `${layer.key}|${id}`,
					label: tt(layer.labelKey),
					color: layerColor(familyColors.get(group.family) ?? SERIES_COLORS[0], layer.key),
					values,
					pattern: group.regex ? "hatch" : undefined,
				});
			}
		}
		out.push({
			key: "trend",
			label: tt("frustration.chart.trend"),
			color: "var(--ink-1)",
			values: rows.map(row => percent(row.atAssistant, row.messages)),
			kind: "line",
			// Repeats the two at-assistant bar layers; the tooltip already lists them.
			tooltip: false,
		});
		return out;
	}, [rows, familyColors, tt]);

	if (rows.length === 0) {
		return (
			<Flex align="center" justify="center" style={{ height: 340 }}>
				<EmptyState title={tt("frustration.table.empty")} />
			</Flex>
		);
	}

	return (
		<Chart
			slots={rows.length}
			tickLabel={i => rows[i].label}
			series={series}
			height={340}
			format={v => `${v}%`}
			formatTooltip={v => `${v.toFixed(1)}%`}
			showTotal={false}
			emptyLabel={tt("frustration.chart.noFrustrated")}
			tooltipExtra={i => {
				const row = rows[i];
				return (
					<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<div className="chart-tooltip-row chart-tooltip-total">
							<span className="chart-tooltip-label">{tt("frustration.chart.tooltipAnnoyed")}</span>
							<span className="chart-tooltip-value">{rate(row.annoyed, row.messages)}</span>
						</div>
						<div style={{ fontSize: 12, color: token.colorTextTertiary }}>
							{tt("frustration.chart.tooltipMeta", {
								messages: formatInteger(row.messages),
								judged: formatInteger(row.judged),
								share: rate(row.judged, row.messages),
							})}
							{isMostlyRegex(row) ? tt("frustration.chart.tooltipRegex") : ""}
						</div>
					</div>
				);
			}}
		/>
	);
}

function FrustrationTable({
	rows,
	familyColors,
	stale,
}: {
	rows: FrustrationModelStats[];
	familyColors: Map<string, string>;
	stale: boolean;
}) {
	const tt = useT();
	const { token } = theme.useToken();
	const columns = useMemo(
		(): Column<FrustrationModelStats>[] => [
			{
				key: "model",
				header: tt("frustration.col.model"),
				sort: row => row.label,
				render: row => (
					<Flex align="center" gap={8} title={row.key}>
						<span
							style={{
								display: "inline-block",
								width: 10,
								height: 10,
								borderRadius: 3,
								background: familyColors.get(familyKey(row)) ?? SERIES_COLORS[0],
								flexShrink: 0,
							}}
						/>
						<span style={{ fontWeight: 500 }}>{row.label}</span>
					</Flex>
				),
			},
			{
				key: "ids",
				header: tt("frustration.col.ids"),
				wrap: true,
				render: row => (
					<span style={{ fontFamily: token.fontFamilyCode, fontSize: 12, color: token.colorTextTertiary }}>
						{row.models.join(", ")}
					</span>
				),
			},
			{
				key: "messages",
				header: tt("frustration.col.messages"),
				align: "right",
				sort: row => row.messages,
				render: row => <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatInteger(row.messages)}</span>,
			},
			{
				key: "judged",
				header: tt("frustration.col.judged"),
				align: "right",
				sort: row => (row.messages > 0 ? row.judged / row.messages : 0),
				render: row =>
					isMostlyRegex(row) ? (
						<Flex align="center" gap={6} justify="flex-end" title={tt("frustration.col.judged.title")}>
							<Badge tone="warn">{tt("frustration.col.regex")}</Badge>
							<span style={{ fontVariantNumeric: "tabular-nums", color: token.colorTextTertiary }}>
								{rate(row.judged, row.messages)}
							</span>
						</Flex>
					) : (
						<span style={{ fontVariantNumeric: "tabular-nums" }}>{rate(row.judged, row.messages)}</span>
					),
			},
			{
				key: "annoyed",
				header: tt("frustration.col.annoyed"),
				align: "right",
				sort: row => percent(row.annoyed, row.messages),
				render: row => (
					<span
						style={{ fontVariantNumeric: "tabular-nums" }}
						title={tt("frustration.summary.messagesCount", { count: formatInteger(row.annoyed) })}
					>
						{rate(row.annoyed, row.messages)}
					</span>
				),
			},
			{
				key: "atAssistant",
				header: tt("frustration.col.atAssistant"),
				align: "right",
				sort: row => percent(row.atAssistant, row.messages),
				render: row => (
					<span
						style={{ fontVariantNumeric: "tabular-nums" }}
						title={tt("frustration.summary.messagesCount", { count: formatInteger(row.atAssistant) })}
					>
						{rate(row.atAssistant, row.messages)}
					</span>
				),
			},
			{
				key: "angry",
				header: tt("frustration.col.angry"),
				align: "right",
				sort: row => percent(row.angry, row.messages),
				render: row => (
					<span
						style={{
							fontVariantNumeric: "tabular-nums",
							color: row.angry > 0 ? token.colorError : undefined,
						}}
						title={tt("frustration.summary.messagesCount", { count: formatInteger(row.angry) })}
					>
						{rate(row.angry, row.messages)}
					</span>
				),
			},
		],
		[familyColors, tt, token],
	);

	return (
		<Card
			index={3}
			title={tt("frustration.table.title")}
			description={tt("frustration.table.description")}
			flush
			stale={stale}
		>
			<Table
				rows={rows}
				rowKey={row => row.key}
				columns={columns}
				dense
				empty={<EmptyState title={tt("frustration.table.empty")} />}
			/>
		</Card>
	);
}
