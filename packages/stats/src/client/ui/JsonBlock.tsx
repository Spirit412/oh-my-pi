import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { Button, theme } from "antd";
import { useEffect, useRef, useState } from "react";
import { useT } from "../i18n";

export interface JsonBlockProps {
	data: unknown;
	title?: string;
	initialCollapsed?: boolean;
}

/** Collapsible, copyable pretty-printed JSON. */
export function JsonBlock({ data, title = "JSON", initialCollapsed = false }: JsonBlockProps) {
	const t = useT();
	const { token } = theme.useToken();
	const [collapsed, setCollapsed] = useState(initialCollapsed);
	const [copied, setCopied] = useState(false);
	const copyResetRef = useRef<number>(0);
	const json = JSON.stringify(data, null, 2);

	// Clear the pending "Copied" reset if the block unmounts (e.g. drawer close).
	useEffect(() => () => window.clearTimeout(copyResetRef.current), []);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(json);
			setCopied(true);
			window.clearTimeout(copyResetRef.current);
			copyResetRef.current = window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard API unavailable (e.g. insecure context); silently no-op.
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<Button
					type="text"
					size="small"
					icon={collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
					onClick={() => setCollapsed(c => !c)}
					aria-expanded={!collapsed}
				>
					{title}
				</Button>
				<Button type="text" size="small" icon={copied ? <Check size={13} /> : <Copy size={13} />} onClick={copy}>
					{copied ? t("ui.json.copied") : t("ui.json.copy")}
				</Button>
			</div>
			{!collapsed && (
				<pre
					style={{
						margin: 0,
						padding: 12,
						borderRadius: token.borderRadius,
						background: token.colorFillQuaternary,
						border: `1px solid ${token.colorBorderSecondary}`,
						fontFamily: token.fontFamilyCode,
						fontSize: 12,
						lineHeight: 1.55,
						whiteSpace: "pre-wrap",
						overflowWrap: "anywhere",
						maxHeight: 420,
						overflow: "auto",
					}}
				>
					<code>{json}</code>
				</pre>
			)}
		</div>
	);
}
