import type { ReactNode } from "react";
import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	ReferenceLine as RefLineMark,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatCompact } from "../data/formatters";
import { t } from "../i18n";
import type { ChartKind, ChartSeries, ReferenceLine as RefLine } from "./types";
import { useWidth } from "./useWidth";

export interface ChartProps {
	/** Number of x positions; every series' `values` has this length. */
	slots: number;
	/** Axis label for a slot. */
	tickLabel: (index: number) => string;
	/** Tooltip heading for a slot; defaults to `tickLabel`. */
	tooltipTitle?: (index: number) => string;
	series: readonly ChartSeries[];
	/** Mark for series without their own `kind`. Default `"bars"`. */
	kind?: ChartKind;
	/** Stack left-axis bars/areas. Default true. */
	stacked?: boolean;
	/** Plot height in px (axes included). Default 220. */
	height?: number;
	/** Left-axis and tooltip formatter. Default compact number. */
	format?: (value: number) => string;
	formatRight?: (value: number) => string;
	/** Tooltip value formatter (left axis); defaults to `format`. Use for full precision. */
	formatTooltip?: (value: number) => string;
	/** Fixed axis maxima (e.g. 1 for fractions); otherwise nice-rounded from data. */
	yMax?: number;
	yMaxRight?: number;
	/** Series keys to omit (legend toggles). */
	hidden?: ReadonlySet<string>;
	/** Show a total row in the tooltip. Default: stacked with 2+ series. */
	showTotal?: boolean;
	references?: readonly RefLine[];
	onSelect?: (index: number) => void;
	/** Shown over empty axes when every visible value is zero. */
	emptyLabel?: ReactNode;
	/** Extra tooltip rows for a slot (below the series rows). */
	tooltipExtra?: (index: number) => ReactNode;
}

const PAD_TOP = 10;
const PAD_BOTTOM = 24;
const MIN_TICK_SPACING = 68;
const Y_TICKS = 4;

interface SlotRow {
	index: number;
	label: string;
	[key: string]: number | string | null;
}

export function Chart({
	slots,
	tickLabel,
	tooltipTitle,
	series,
	kind = "bars",
	stacked = true,
	height = 220,
	format = formatCompact,
	formatRight,
	formatTooltip,
	yMax,
	yMaxRight,
	hidden,
	showTotal,
	references,
	onSelect,
	emptyLabel = t("chart.empty"),
	tooltipExtra,
}: ChartProps) {
	const [ref, width] = useWidth<HTMLDivElement>();

	const visible = series.filter(s => !hidden?.has(s.key));
	const left = visible.filter(s => s.axis !== "right");
	const right = visible.filter(s => s.axis === "right");
	const stackable = (s: ChartSeries) => stacked && (s.kind ?? kind) !== "line";

	// Per-axis maxima (stacked left series count by their slot totals).
	const totals = Array.from({ length: slots }, () => 0);
	let leftMax = 0;
	for (const s of left) {
		if (stackable(s)) {
			for (let i = 0; i < slots; i++) totals[i] += s.values[i] ?? 0;
		} else {
			for (let i = 0; i < slots; i++) leftMax = Math.max(leftMax, s.values[i] ?? 0);
		}
	}
	for (const top of totals) leftMax = Math.max(leftMax, top);
	let rightMax = 0;
	for (const s of right) for (let i = 0; i < slots; i++) rightMax = Math.max(rightMax, s.values[i] ?? 0);
	for (const r of references ?? []) {
		if (r.axis === "right") rightMax = Math.max(rightMax, r.value);
		else leftMax = Math.max(leftMax, r.value);
	}
	const leftScale = niceScale(yMax ?? leftMax);
	const rightScale = right.length > 0 ? niceScale(yMaxRight ?? rightMax) : null;
	const empty = visible.every(s => s.values.every(v => !v));

	const data: SlotRow[] = Array.from({ length: slots }, (_, i) => {
		const row: SlotRow = { index: i, label: tickLabel(i) };
		for (const s of visible) row[s.key] = s.values[i] ?? null;
		return row;
	});

	const leftLabels = leftScale.ticks.map(tick => format(tick));
	const rightLabels = rightScale?.ticks.map(tick => (formatRight ?? format)(tick)) ?? [];
	const padLeft = Math.max(28, labelWidth(leftLabels) + 12);
	const padRight = rightScale ? Math.max(28, labelWidth(rightLabels) + 12) : 8;
	const plotW = Math.max(0, width - padLeft - padRight);
	const slotW = slots > 0 ? plotW / slots : 0;
	const barW = Math.max(1, Math.min(56, slotW * (slotW > 6 ? 0.72 : 0.9)));
	const tickEvery = Math.max(1, Math.ceil(slots / Math.max(1, Math.floor(plotW / MIN_TICK_SPACING))));
	const withTotal = showTotal ?? (stacked && left.length > 1);

	return (
		<div className="chart" ref={ref} style={{ height }}>
			{/* Hatch fills: referenced by url(#…) from Bar/Area marks. */}
			<svg width="0" height="0" aria-hidden="true">
				<defs>
					{visible
						.filter(s => s.pattern === "hatch")
						.map(s => (
							<pattern
								key={s.key}
								id={`hatch-${cssId(s.key)}`}
								width="5"
								height="5"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(45)"
							>
								<rect width="5" height="5" fill={s.color} fillOpacity="0.14" />
								<rect width="1.6" height="5" fill={s.color} />
							</pattern>
						))}
				</defs>
			</svg>

			{width > 0 && (
				<ComposedChart
					width={width}
					height={height}
					data={data}
					margin={{ top: PAD_TOP, right: padRight, bottom: PAD_BOTTOM, left: padLeft }}
					barCategoryGap="28%"
					role="img"
					onClick={state => {
						const index = state?.activeTooltipIndex;
						if (onSelect && typeof index === "number" && index >= 0 && index < slots) onSelect(index);
					}}
					style={{ cursor: onSelect ? "pointer" : "crosshair" }}
				>
					<CartesianGrid vertical={false} stroke="var(--chart-grid)" />
					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={{ stroke: "var(--line-4)" }}
						tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
						interval={tickEvery - 1}
						height={PAD_BOTTOM}
					/>
					<YAxis
						yAxisId="left"
						orientation="left"
						domain={[0, leftScale.max]}
						ticks={leftScale.ticks}
						tickFormatter={format}
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
						width={padLeft - 16}
					/>
					{rightScale && (
						<YAxis
							yAxisId="right"
							orientation="right"
							domain={[0, rightScale.max]}
							ticks={rightScale.ticks}
							tickFormatter={formatRight ?? format}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
							width={padRight - 8}
						/>
					)}

					{/* Areas first so bars and lines draw above them. */}
					{visible
						.filter(s => (s.kind ?? kind) === "area")
						.map(s => (
							<Area
								key={s.key}
								yAxisId={s.axis === "right" ? "right" : "left"}
								dataKey={s.key}
								name={s.label}
								stroke={s.color}
								strokeWidth={1.5}
								fill={s.pattern === "hatch" ? `url(#hatch-${cssId(s.key)})` : s.color}
								fillOpacity={s.pattern ? 1 : 0.2}
								stackId={stackable(s) ? "left" : undefined}
								connectNulls={false}
								isAnimationActive={false}
							/>
						))}

					{visible
						.filter(s => (s.kind ?? kind) === "bars")
						.map(s => (
							<Bar
								key={s.key}
								yAxisId={s.axis === "right" ? "right" : "left"}
								dataKey={s.key}
								name={s.label}
								fill={s.pattern === "hatch" ? `url(#hatch-${cssId(s.key)})` : s.color}
								stackId={stackable(s) && s.axis !== "right" ? "left" : undefined}
								barSize={barW}
								isAnimationActive={false}
							/>
						))}

					{visible
						.filter(s => (s.kind ?? kind) === "line")
						.map(s => (
							<Line
								key={s.key}
								yAxisId={s.axis === "right" ? "right" : "left"}
								dataKey={s.key}
								name={s.label}
								stroke={s.color}
								strokeWidth={1.5}
								strokeDasharray={s.dashed ? "4 3" : undefined}
								dot={{ r: 2, fill: s.color, strokeWidth: 0 }}
								connectNulls={false}
								isAnimationActive={false}
							/>
						))}

					{references?.map(r => (
						<RefLineMark
							key={`${r.axis ?? "left"}:${r.value}`}
							yAxisId={r.axis === "right" ? "right" : "left"}
							y={r.value}
							stroke="var(--line-4)"
							strokeDasharray="3 3"
							label={
								r.label
									? {
											value: r.label,
											position: "insideTopRight",
											fill: "var(--chart-axis)",
											fontSize: 11,
										}
									: undefined
							}
						/>
					))}

					<Tooltip
						cursor={{ fill: "var(--chart-cursor)" }}
						content={
							<ChartTooltip
								series={visible}
								tickLabel={tickLabel}
								tooltipTitle={tooltipTitle}
								format={format}
								formatRight={formatRight}
								formatTooltip={formatTooltip}
								withTotal={withTotal}
								tooltipExtra={tooltipExtra}
							/>
						}
					/>
				</ComposedChart>
			)}

			{empty && <div className="chart-empty">{emptyLabel}</div>}
		</div>
	);
}

interface TooltipEntry {
	name?: string;
	value?: number | null;
	color?: string;
	dataKey?: string | number;
}

interface ChartTooltipProps {
	active?: boolean;
	payload?: readonly TooltipEntry[];
	label?: string | number;
	series: readonly ChartSeries[];
	tickLabel: (index: number) => string;
	tooltipTitle?: (index: number) => string;
	format: (value: number) => string;
	formatRight?: (value: number) => string;
	formatTooltip?: (value: number) => string;
	withTotal: boolean;
	tooltipExtra?: (index: number) => ReactNode;
}

/** Floating slot tooltip: series rows sorted desc by value, optional total row. */
function ChartTooltip({
	active,
	payload,
	label,
	series,
	tickLabel,
	tooltipTitle,
	format,
	formatRight,
	formatTooltip,
	withTotal,
	tooltipExtra,
}: ChartTooltipProps) {
	if (!active || !payload || payload.length === 0) return null;
	const byKey = new Map(series.map(s => [s.key, s]));
	// Multi-series hides zero rows ("model X: 0" is noise); a lone series shows its zero.
	const rows = payload
		.map(entry => ({ s: byKey.get(String(entry.dataKey)), v: entry.value }))
		.filter(
			(row): row is { s: ChartSeries; v: number } =>
				row.s !== undefined && row.s.tooltip !== false && row.v !== null && row.v !== undefined &&
				(row.v !== 0 || series.length === 1),
		)
		.sort((a, b) => (series.length > 1 ? b.v - a.v : 0));
	if (rows.length === 0) return null;
	const index = Number(label);
	const total = rows.filter(r => r.s.axis !== "right").reduce((sum, r) => sum + r.v, 0);
	return (
		<div className="chart-tooltip">
			<div className="chart-tooltip-title">{tooltipTitle ? tooltipTitle(index) : tickLabel(index)}</div>
			{rows.map(({ s, v }) => (
				<div key={s.key} className="chart-tooltip-row">
					<span className="swatch" style={{ background: s.color }} />
					<span className="chart-tooltip-label">{s.label}</span>
					<span className="chart-tooltip-value">
						{s.axis === "right" ? (formatRight ?? format)(v) : (formatTooltip ?? format)(v)}
					</span>
				</div>
			))}
			{withTotal && rows.length > 1 && (
				<div className="chart-tooltip-row chart-tooltip-total">
					<span className="chart-tooltip-label">{t("chart.total")}</span>
					<span className="chart-tooltip-value">{(formatTooltip ?? format)(total)}</span>
				</div>
			)}
			{tooltipExtra && tooltipExtra(index)}
		</div>
	);
}

/** Round an axis maximum up to 1/2/2.5/5 × 10ⁿ and return evenly spaced ticks from 0. */
export function niceScale(max: number): { max: number; ticks: number[] } {
	if (!(max > 0)) return { max: 1, ticks: [0] };
	const rough = max / Y_TICKS;
	const magnitude = 10 ** Math.floor(Math.log10(rough));
	const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= rough) ?? 10 * magnitude;
	const top = Math.ceil(max / step) * step;
	const ticks: number[] = [];
	for (let tick = 0; tick <= top + step / 2; tick += step) ticks.push(Number(tick.toPrecision(12)));
	return { max: top, ticks };
}

function labelWidth(labels: readonly string[]): number {
	return labels.reduce((w, label) => Math.max(w, label.length * 6.3), 0);
}

function cssId(key: string): string {
	return key.replace(/[^a-zA-Z0-9_-]/g, "_");
}
