import { theme } from "antd";
import type { CSSProperties, ReactNode } from "react";

export type Tone = "neutral" | "ok" | "warn" | "bad" | "accent";

/** Token fields these primitives read from the AntD theme. */
interface ToneToken {
	colorSuccess: string;
	colorWarning: string;
	colorError: string;
	colorPrimary: string;
	colorTextSecondary: string;
}

function toneColor(tone: Tone | "live", token: ToneToken): string {
	switch (tone) {
		case "ok":
			return token.colorSuccess;
		case "warn":
			return token.colorWarning;
		case "bad":
			return token.colorError;
		case "accent":
			return token.colorPrimary;
		case "live":
			return token.colorSuccess;
		default:
			return token.colorTextSecondary;
	}
}

/** Pill label; status badges always carry a word, never color alone. */
export function Badge({ tone = "neutral", mono, children }: { tone?: Tone; mono?: boolean; children: ReactNode }) {
	const { token } = theme.useToken();
	const color = toneColor(tone, token);
	const style: CSSProperties = {
		display: "inline-flex",
		alignItems: "center",
		gap: 4,
		padding: "1px 8px",
		borderRadius: 999,
		fontSize: 11,
		fontWeight: 550,
		lineHeight: "16px",
		fontFamily: mono ? token.fontFamilyCode : undefined,
		color,
		background: `color-mix(in srgb, ${color} 12%, transparent)`,
		border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
		whiteSpace: "nowrap",
	};
	return <span style={style}>{children}</span>;
}

/** Round status dot; `pulse` for things happening right now. */
export function Dot({ tone = "neutral", pulse }: { tone?: Tone | "live"; pulse?: boolean }) {
	const { token } = theme.useToken();
	const color = toneColor(tone, token);
	const style: CSSProperties = {
		display: "inline-block",
		width: 8,
		height: 8,
		borderRadius: "50%",
		background: color,
		flexShrink: 0,
		animation: pulse ? "ui-dot-pulse 1.6s ease-in-out infinite" : undefined,
	};
	return (
		<>
			{pulse && <style>{`@keyframes ui-dot-pulse { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, ${token.colorSuccess} 45%, transparent); } 50% { box-shadow: 0 0 0 4px transparent; } }`}</style>}
			<span style={style} />
		</>
	);
}

/** Color square matching a chart series. */
export function Swatch({ color }: { color: string }) {
	return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: color }} />;
}

/** Badge tone for an error rate (fraction). */
export function errorRateTone(rate: number): Tone {
	if (rate >= 0.05) return "bad";
	if (rate >= 0.01) return "warn";
	return "ok";
}
