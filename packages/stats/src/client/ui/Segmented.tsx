import { Segmented as AntdSegmented } from "antd";
import type { ReactNode } from "react";

export interface SegmentedOption<T extends string> {
	value: T;
	label: ReactNode;
	title?: string;
}

export interface SegmentedProps<T extends string> {
	options: readonly SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	size?: "md" | "sm";
	"aria-label"?: string;
}

/** Pill toggle backed by AntD Segmented. */
export function Segmented<T extends string>({
	options,
	value,
	onChange,
	size = "md",
	"aria-label": ariaLabel,
}: SegmentedProps<T>) {
	return (
		<span role="radiogroup" aria-label={ariaLabel}>
			<AntdSegmented<T>
				options={options.map(option => ({ value: option.value, label: option.label, title: option.title }))}
				value={value}
				onChange={next => onChange(next)}
				size={size === "sm" ? "small" : "middle"}
			/>
		</span>
	);
}
