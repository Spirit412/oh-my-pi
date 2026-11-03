import { Button } from "antd";
import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useT } from "../i18n";
import { type ThemePreference, useThemePreference } from "../useSystemTheme";

const NEXT_PREFERENCE: Record<ThemePreference, ThemePreference> = {
	system: "light",
	light: "dark",
	dark: "system",
};

const PREFERENCE_ICON: Record<ThemePreference, LucideIcon> = {
	system: Monitor,
	light: Sun,
	dark: Moon,
};

/** Cycles system → light → dark. */
export function ThemeToggle() {
	const t = useT();
	const { preference, setPreference } = useThemePreference();
	const Icon = PREFERENCE_ICON[preference];
	const label = `${t(`theme.${preference}`)} — ${t("theme.switch")}`;

	return (
		<Button
			type="text"
			aria-label={label}
			title={label}
			onClick={() => setPreference(NEXT_PREFERENCE[preference])}
			icon={<Icon size={15} />}
		/>
	);
}
