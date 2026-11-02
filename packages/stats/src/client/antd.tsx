import { ConfigProvider, theme as antdTheme, type ThemeConfig } from "antd";
import enUS from "antd/locale/en_US";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { ReactNode } from "react";
import { getLocale } from "./i18n";
import { useSystemTheme } from "./useSystemTheme";

/**
 * Brand palette, kept from the pre-AntD design system: omp cyan → pink accent,
 * one ramp per resolved theme. Charts and traces read these tokens through
 * CSS variables (`--accent`, `--chart-*`) defined in `styles.css`.
 */
const BRAND: Record<"light" | "dark", { colorPrimary: string; colorInfo: string }> = {
	light: { colorPrimary: "#c42596", colorInfo: "#1fa9bb" },
	dark: { colorPrimary: "#f068c8", colorInfo: "#5ad8e6" },
};

function dashboardTheme(resolved: "light" | "dark"): ThemeConfig {
	const brand = BRAND[resolved];
	const dark = resolved === "dark";
	return {
		algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
		token: {
			colorPrimary: brand.colorPrimary,
			colorInfo: brand.colorInfo,
			fontFamily: '"Inter var", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
			borderRadius: 8,
		},
		components: {
			Layout: {
				siderBg: dark ? "#0e0e10" : "#ffffff",
				headerBg: "transparent",
				bodyBg: "transparent",
			},
			Menu: {
				darkItemBg: "transparent",
				darkSubMenuItemBg: "transparent",
			},
		},
	};
}

let dayjsLocaleApplied = false;

/** AntD root provider: brand theme follows the dashboard dark/light switch. */
export function AntdProvider({ children }: { children: ReactNode }) {
	const resolved = useSystemTheme();
	const locale = getLocale();
	if (!dayjsLocaleApplied) {
		dayjsLocaleApplied = true;
		dayjs.locale(locale === "ru" ? "ru" : "en");
	}
	return (
		<ConfigProvider locale={locale === "ru" ? ruRU : enUS} theme={dashboardTheme(resolved)}>
			{children}
		</ConfigProvider>
	);
}
