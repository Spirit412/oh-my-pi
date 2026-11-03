import { theme } from "antd";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { Sparkline } from "../charts/Sparkline";
import { useT } from "../i18n";

export interface StatDelta {
	/** Relative change vs the previous period (0.12 = +12%). `null` when there is no baseline. */
	change: number | null;
	/** Which direction is good news. Default `"up"`. */
	good?: "up" | "down";
}

export interface StatProps {
	label: ReactNode;
	value: ReactNode;
	/** Small print under the value. */
	hint?: ReactNode;
	delta?: StatDelta;
	/** Trend under the value. */
	spark?: readonly number[];
	sparkColor?: string;
	size?: "md" | "sm";
	/** Title tooltip explaining the metric. */
	title?: string;
}

/** One metric tile. The value highlights briefly when it changes after mount. */
export function Stat({ label, value, hint, delta, spark, sparkColor, size = "md", title }: StatProps) {
	const { token } = theme.useToken();
	const flash = useChangeFlash(typeof value === "string" || typeof value === "number" ? value : null);
	const valueStyle: CSSProperties = {
		fontSize: size === "sm" ? 18 : 24,
		fontWeight: 650,
		letterSpacing: "-0.02em",
		lineHeight: 1.2,
		transition: "color 600ms",
		color: flash ? token.colorPrimary : token.colorText,
	};
	return (
		<div title={title} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
			<div style={{ fontSize: 12, color: token.colorTextSecondary }}>{label}</div>
			<div style={valueStyle}>{value}</div>
			{(hint !== undefined || delta) && (
				<div style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 12, color: token.colorTextSecondary, minWidth: 0 }}>
					{delta && <Delta {...delta} />}
					{hint !== undefined && (
						<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hint}</span>
					)}
				</div>
			)}
			{spark && spark.length > 1 && (
				<div style={{ marginTop: 6 }}>
					<Sparkline values={spark} color={sparkColor} />
				</div>
			)}
		</div>
	);
}

export interface StatGridProps {
	/** Minimum tile width before wrapping. Default 170px. */
	min?: number;
	children: ReactNode;
}

/** Tiles sharing one card, separated by hairlines. */
export function StatGrid({ min = 170, children }: StatGridProps) {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
				rowGap: 16,
				columnGap: 24,
			}}
		>
			{children}
		</div>
	);
}

/** Signed percentage change pill, green when the move is good news. */
export function Delta({ change, good = "up" }: StatDelta) {
	const { token } = theme.useToken();
	const t = useT();
	if (change === null || !Number.isFinite(change)) {
		return (
			<span style={{ color: token.colorTextTertiary, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
				{t("ui.delta.new")}
			</span>
		);
	}
	const rounded = Math.abs(change) < 0.0005 ? 0 : change;
	const goodNews = rounded === 0 ? undefined : rounded > 0 === (good === "up");
	const color = goodNews === undefined ? token.colorTextTertiary : goodNews ? token.colorSuccess : token.colorError;
	const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "±";
	const pct = Math.abs(rounded) * 100;
	return (
		<span style={{ color, fontWeight: 550, fontSize: 12, whiteSpace: "nowrap" }}>
			{sign}
			{pct >= 100 ? pct.toFixed(0) : pct.toFixed(1)}%
		</span>
	);
}

/** Relative change from `previous` to `current`; `null` when there is no baseline. */
export function relativeChange(current: number, previous: number): number | null {
	if (previous === 0) return current === 0 ? 0 : null;
	return (current - previous) / previous;
}

function useChangeFlash(value: string | number | null): boolean {
	const previous = useRef(value);
	const [flash, setFlash] = useState(false);
	useEffect(() => {
		if (previous.current === value) return;
		const hadValue = previous.current !== null;
		previous.current = value;
		if (!hadValue) return;
		setFlash(true);
		const timer = setTimeout(() => setFlash(false), 900);
		return () => clearTimeout(timer);
	}, [value]);
	return flash;
}
