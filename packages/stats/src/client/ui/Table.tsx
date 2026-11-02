import { Button, Table as AntdTable, theme } from "antd";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { formatInteger } from "../data/formatters";
import { useT } from "../i18n";
import { EmptyState } from "./States";

export interface Column<T> {
	key: string;
	header: ReactNode;
	render: (row: T) => ReactNode;
	/** Sort key; the column header becomes clickable when present. */
	sort?: (row: T) => number | string;
	align?: "left" | "right" | "center";
	width?: number | string;
	/** Allow the cell to wrap (cells are single-line by default). */
	wrap?: boolean;
	/** Header tooltip. */
	title?: string;
}

export type SortDir = "asc" | "desc";

export interface TableProps<T> {
	columns: readonly Column<T>[];
	rows: readonly T[];
	rowKey: (row: T) => string | number;
	onRowClick?: (row: T) => void;
	selectedKey?: string | number | null;
	/** Initial sort; numeric columns usually start `desc`. */
	initialSort?: { key: string; dir: SortDir };
	/** Show the first `limit` rows; "Show more" reveals `limit` × 4 more at a time (rendering stays cheap for huge tables). */
	limit?: number;
	dense?: boolean;
	empty?: ReactNode;
	/** Detail row rendered below a row (return `null` for collapsed rows). */
	expanded?: (row: T) => ReactNode | null;
}

/** Sortable data table. Clicking a sorted header flips its direction. */
export function Table<T>({
	columns,
	rows,
	rowKey,
	onRowClick,
	selectedKey,
	initialSort,
	limit,
	dense,
	empty,
	expanded,
}: TableProps<T>) {
	const t = useT();
	const { token } = theme.useToken();
	const [sort, setSort] = useState(initialSort ?? null);
	const [shown, setShown] = useState(limit ?? Number.POSITIVE_INFINITY);

	const sorted = useMemo(() => {
		const column = sort ? columns.find(c => c.key === sort.key) : undefined;
		if (!sort || !column?.sort) return rows;
		const valueOf = column.sort;
		const dir = sort.dir === "asc" ? 1 : -1;
		return [...rows].sort((a, b) => {
			const va = valueOf(a);
			const vb = valueOf(b);
			if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
			return String(va).localeCompare(String(vb)) * dir;
		});
	}, [rows, columns, sort]);

	if (rows.length === 0) return <>{empty ?? <EmptyState />}</>;

	const visible = sorted.length > shown ? sorted.slice(0, shown) : sorted;

	const toggleSort = (column: Column<T>) => {
		if (!column.sort) return;
		setSort(prev =>
			prev?.key === column.key
				? { key: column.key, dir: prev.dir === "asc" ? "desc" : "asc" }
				: { key: column.key, dir: column.align === "right" ? "desc" : "asc" },
		);
	};

	const antdColumns: ColumnsType<T> = columns.map(column => {
		const sortedDir = sort?.key === column.key ? sort.dir : undefined;
		return {
			key: column.key,
			title: (
				<span
					style={{ cursor: column.sort !== undefined ? "pointer" : undefined, whiteSpace: "nowrap" }}
					onClick={() => toggleSort(column)}
				>
					{column.header}
					{sortedDir && (
						<span style={{ marginLeft: 4, fontSize: 10 }}>
							{sortedDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
						</span>
					)}
				</span>
			),
			align: column.align,
			width: column.width,
			onHeaderCell: () => ({ title: column.title }),
			onCell: column.wrap ? () => ({ style: { whiteSpace: "normal" } }) : undefined,
			render: (_: unknown, row: T) => column.render(row),
		};
	});

	return (
		<>
			<AntdTable<T>
				columns={antdColumns}
				dataSource={visible as T[]}
				rowKey={rowKey as (row: T) => string}
				pagination={false}
				size={dense ? "small" : "middle"}
				showSorterTooltip={false}
				rowClassName={row =>
					selectedKey === rowKey(row)
						? "ui-table-row-selected"
						: onRowClick !== undefined
							? "ui-table-row-clickable"
							: ""
				}
				onRow={
					onRowClick !== undefined
						? row => ({
								onClick: () => onRowClick(row),
								onKeyDown: (e: React.KeyboardEvent) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onRowClick(row);
									}
								},
								tabIndex: 0,
							})
						: undefined
				}
				expandable={
					expanded !== undefined
						? {
								expandedRowRender: row => expanded(row),
								rowExpandable: row => expanded(row) !== null,
							}
						: undefined
				}
				locale={{ emptyText: empty ?? <EmptyState /> }}
			/>
			<style>{`
.ui-table-row-clickable { cursor: pointer; }
.ui-table-row-selected > td { background: color-mix(in srgb, ${token.colorPrimary} 8%, transparent) !important; }
`}</style>
			{limit !== undefined && sorted.length > limit && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 8,
						padding: "8px 16px",
					}}
				>
					<span style={{ fontSize: 12, color: token.colorTextTertiary }}>
						{t("ui.table.shownOf", { shown: formatInteger(visible.length), total: formatInteger(sorted.length) })}
					</span>
					<span style={{ display: "flex", gap: 8 }}>
						{sorted.length > shown && (
							<Button type="link" size="small" onClick={() => setShown(n => n + limit * 4)}>
								{t("ui.table.showMore")}
							</Button>
						)}
						{shown > limit && (
							<Button type="link" size="small" onClick={() => setShown(limit)}>
								{t("ui.table.showFewer")}
							</Button>
						)}
					</span>
				</div>
			)}
		</>
	);
}

/** Right-aligned value with a proportional bar, for ranked numeric columns. */
export function MeterCell({
	value,
	max,
	display,
	color,
}: {
	value: number;
	max: number;
	display: ReactNode;
	color?: string;
}) {
	const { token } = theme.useToken();
	const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
	const fill = color ?? token.colorInfo;
	return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, minWidth: 90 }}>
			<span>{display}</span>
			<div
				style={{
					width: 64,
					height: 4,
					borderRadius: 2,
					background: token.colorFillTertiary,
					overflow: "hidden",
				}}
			>
				<div style={{ width: `${pct}%`, height: "100%", background: fill, borderRadius: 2 }} />
			</div>
		</div>
	);
}

/** Two-line cell: primary label and a dim secondary line. */
export function LabelCell({
	primary,
	secondary,
	lead,
}: {
	primary: ReactNode;
	secondary?: ReactNode;
	lead?: ReactNode;
}) {
	const { token } = theme.useToken();
	return (
		<div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
			{lead}
			<div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
				<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{primary}</span>
				{secondary !== undefined && (
					<span style={{ fontSize: 12, color: token.colorTextSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{secondary}
					</span>
				)}
			</div>
		</div>
	);
}
