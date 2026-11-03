import { Search } from "lucide-react";
import { Input } from "antd";
import { useT } from "../i18n";

export interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
	width?: number;
}

/** Text filter with a leading search glyph and a clear button. */
export function SearchInput({ value, onChange, placeholder, label, width }: SearchInputProps) {
	const t = useT();
	return (
		<Input
			allowClear
			prefix={<Search size={14} />}
			aria-label={label ?? t("ui.search.label")}
			value={value}
			placeholder={placeholder ?? t("ui.search.placeholder")}
			onChange={e => onChange(e.target.value)}
			style={width !== undefined ? { width } : undefined}
		/>
	);
}
