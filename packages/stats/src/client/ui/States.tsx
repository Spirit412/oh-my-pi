import { Alert, Button, Empty, Skeleton as AntdSkeleton } from "antd";
import { Inbox, RotateCw } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useT } from "../i18n";

export function EmptyState({ title, hint }: { title?: ReactNode; hint?: ReactNode }) {
	const t = useT();
	return (
		<div style={{ padding: "24px 0" }}>
			<Empty image={<Inbox size={28} strokeWidth={1.5} />} description={title ?? t("state.empty")} />
			{hint !== undefined && (
				<div style={{ textAlign: "center", fontSize: 12, color: "rgba(128,128,128,1)", marginTop: 8 }}>{hint}</div>
			)}
		</div>
	);
}

export function ErrorState({ error, onRetry }: { error: Error | string; onRetry?: () => void }) {
	const t = useT();
	return (
		<Alert
			type="error"
			showIcon
			title={typeof error === "string" ? error : error.message}
			style={{ marginBottom: 12 }}
			action={
				onRetry ? (
					<Button size="small" type="text" icon={<RotateCw size={13} />} onClick={onRetry}>
						{t("state.retry")}
					</Button>
				) : undefined
			}
		/>
	);
}

export function Skeleton({
	width = "100%",
	height = 14,
	style,
}: {
	width?: number | string;
	height?: number | string;
	style?: CSSProperties;
}) {
	return <AntdSkeleton.Node active style={{ width, height, ...style }} children={false} />;
}

/** Placeholder block matching a chart's footprint. */
export function ChartSkeleton({ height = 220 }: { height?: number }) {
	return <Skeleton height={height} style={{ borderRadius: 8 }} />;
}

/** Placeholder rows matching a table's footprint. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 16px 16px" }}>
			{Array.from({ length: rows }, (_, i) => (
				<Skeleton key={i} height={16} width={`${92 - ((i * 13) % 30)}%`} />
			))}
		</div>
	);
}

export interface QueryViewProps<T> {
	query: { data: T | null; error: Error | null; loading: boolean; refetch: () => void };
	/** Rendered on first load. */
	skeleton: ReactNode;
	/** Treat loaded data as empty (renders `empty`). */
	isEmpty?: (data: T) => boolean;
	empty?: ReactNode;
	children: (data: T) => ReactNode;
}

/**
 * Standard load/error/empty switch for one `useQuery` result. Errors with
 * data already on screen keep the data and show the error above it.
 */
export function QueryView<T>({ query, skeleton, isEmpty, empty, children }: QueryViewProps<T>) {
	if (query.data === null) {
		if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
		return <>{skeleton}</>;
	}
	return (
		<>
			{query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
			{isEmpty?.(query.data) ? (empty ?? <EmptyState />) : children(query.data)}
		</>
	);
}
