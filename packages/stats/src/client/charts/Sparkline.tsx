import { Area, AreaChart } from "recharts";
import { useWidth } from "./useWidth";

export interface SparklineProps {
	values: readonly number[];
	color?: string;
	height?: number;
	/** Fixed width; omit to fill the container. */
	width?: number;
	/** Fill under the line. Default true. */
	area?: boolean;
}

/** Axis-free trend line for stat tiles and table cells. */
export function Sparkline({ values, color = "var(--chart-primary)", height = 28, width, area = true }: SparklineProps) {
	const [ref, measured] = useWidth<HTMLDivElement>();
	const w = width ?? measured;
	const data = values.map((v, i) => ({ i, v }));
	return (
		<div ref={ref} className="sparkline" style={{ width: width ?? "100%", height }}>
			{w > 0 && values.length > 0 && (
				<AreaChart width={w} height={height} data={data} margin={{ top: 1, right: 1, bottom: 1, left: 1 }}>
					<Area
						type="linear"
						dataKey="v"
						stroke={color}
						strokeWidth={1.5}
						fill={color}
						fillOpacity={area ? 0.2 : 0}
						isAnimationActive={false}
						dot={false}
					/>
				</AreaChart>
			)}
		</div>
	);
}
