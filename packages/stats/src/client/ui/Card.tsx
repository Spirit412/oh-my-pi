import { Card as AntdCard } from "antd";
import type { ReactNode } from "react";

export interface CardProps {
	title?: ReactNode;
	description?: ReactNode;
	/** Right-aligned header controls (segmented toggles, selects, buttons). */
	actions?: ReactNode;
	/** Body without padding — for full-bleed tables and lists. */
	flush?: boolean;
	footer?: ReactNode;
	className?: string;
	/** Stagger index for the entrance animation. */
	index?: number;
	/** Dim the body while previous data is on screen (see `useQuery().stale`). */
	stale?: boolean;
	children: ReactNode;
}

/** The dashboard's container: header with title/description/controls plus an optional footer. */
export function Card({ title, description, actions, flush, footer, className, stale, children }: CardProps) {
	return (
		<AntdCard
			className={className}
			variant="outlined"
			title={
				title !== undefined || description !== undefined ? (
					<div>
						{title !== undefined && <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>}
						{description !== undefined && (
							<div style={{ fontSize: 12, fontWeight: 400, color: "rgba(128,128,128,1)", marginTop: 2 }}>
								{description}
							</div>
						)}
					</div>
				) : undefined
			}
			extra={actions}
			styles={{
				header: title !== undefined || description !== undefined ? { minHeight: 0, padding: "14px 16px" } : { display: "none" },
				body: {
					padding: flush ? 0 : undefined,
					opacity: stale ? 0.55 : 1,
					transition: "opacity 200ms",
				},
			}}
		>
			{children}
			{footer !== undefined && (
				<div style={{ borderTop: "1px solid rgba(128,128,128,0.15)", paddingTop: 12, marginTop: 12 }}>{footer}</div>
			)}
		</AntdCard>
	);
}

export interface PageHeaderProps {
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
}

/** Title band at the top of every page. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<header
			style={{
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: 16,
				flexWrap: "wrap",
				marginBottom: 20,
			}}
		>
			<div>
				<h1 style={{ fontSize: 22, fontWeight: 650, margin: 0, letterSpacing: "-0.01em" }}>{title}</h1>
				{description !== undefined && (
					<p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(128,128,128,1)" }}>{description}</p>
				)}
			</div>
			{actions !== undefined && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
		</header>
	);
}
