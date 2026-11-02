import { Drawer as AntdDrawer, Typography } from "antd";
import type { ReactNode } from "react";

export interface DrawerProps {
	open: boolean;
	onClose: () => void;
	title: ReactNode;
	subtitle?: ReactNode;
	/** Header controls left of the close button. */
	actions?: ReactNode;
	/** Sheet width in px. Default 560. */
	width?: number;
	children: ReactNode;
}

/** Right-side detail sheet over a scrim. Esc and scrim clicks close it. */
export function Drawer({ open, onClose, title, subtitle, actions, width = 560, children }: DrawerProps) {
	return (
		<AntdDrawer
			open={open}
			onClose={onClose}
			size={width}
			title={
				<div>
					<Typography.Text strong style={{ fontSize: 15 }}>
						{title}
					</Typography.Text>
					{subtitle !== undefined && (
						<div style={{ fontSize: 12, color: "rgba(128,128,128,1)", marginTop: 2 }}>{subtitle}</div>
					)}
				</div>
			}
			extra={actions}
			styles={{ body: { display: "flex", flexDirection: "column", gap: 16 } }}
		>
			{children}
		</AntdDrawer>
	);
}

/** Label/value grid for detail panels. */
export function KeyValues({ items }: { items: readonly { key: string; label: ReactNode; value: ReactNode }[] }) {
	return (
		<dl style={{ margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
			{items.map(item => (
				<div key={item.key}>
					<dt style={{ fontSize: 12, color: "rgba(128,128,128,1)", margin: 0 }}>{item.label}</dt>
					<dd style={{ margin: "2px 0 0", fontSize: 13 }}>{item.value}</dd>
				</div>
			))}
		</dl>
	);
}
