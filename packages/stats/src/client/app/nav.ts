import {
	Activity,
	CircleAlert,
	Coins,
	Cpu,
	FolderGit2,
	Frown,
	LayoutGrid,
	type LucideIcon,
	PlugZap,
	Sparkles,
	SquareChartGantt,
	Wrench,
} from "lucide-react";

export type DashboardSection =
	| "overview"
	| "models"
	| "providers"
	| "costs"
	| "requests"
	| "errors"
	| "traces"
	| "tools"
	| "frustration"
	| "projects"
	| "gain";

export interface NavItem {
	id: DashboardSection;
	/** i18n key for the item label (`nav.<section>` in the shared dictionary). */
	labelKey: `nav.${DashboardSection}`;
	icon: LucideIcon;
	/** Second key of the `g <key>` jump shortcut. */
	hotkey: string;
}

export interface NavGroup {
	/** i18n key for the group heading (`nav.group.*`). */
	headingKey: "nav.group.usage" | "nav.group.activity" | "nav.group.insights";
	items: readonly NavItem[];
}

/** Sidebar structure; the order here is the order on screen. */
export const NAV: readonly NavGroup[] = [
	{
		headingKey: "nav.group.usage",
		items: [
			{ id: "overview", labelKey: "nav.overview", icon: LayoutGrid, hotkey: "o" },
			{ id: "models", labelKey: "nav.models", icon: Cpu, hotkey: "m" },
			{ id: "providers", labelKey: "nav.providers", icon: PlugZap, hotkey: "p" },
			{ id: "costs", labelKey: "nav.costs", icon: Coins, hotkey: "c" },
		],
	},
	{
		headingKey: "nav.group.activity",
		items: [
			{ id: "requests", labelKey: "nav.requests", icon: Activity, hotkey: "r" },
			{ id: "errors", labelKey: "nav.errors", icon: CircleAlert, hotkey: "e" },
			{ id: "traces", labelKey: "nav.traces", icon: SquareChartGantt, hotkey: "t" },
		],
	},
	{
		headingKey: "nav.group.insights",
		items: [
			{ id: "tools", labelKey: "nav.tools", icon: Wrench, hotkey: "l" },
			{ id: "frustration", labelKey: "nav.frustration", icon: Frown, hotkey: "f" },
			{ id: "projects", labelKey: "nav.projects", icon: FolderGit2, hotkey: "j" },
			{ id: "gain", labelKey: "nav.gain", icon: Sparkles, hotkey: "g" },
		],
	},
];

export const NAV_ITEMS: readonly NavItem[] = NAV.flatMap(group => group.items);

export const SECTIONS: readonly DashboardSection[] = NAV_ITEMS.map(item => item.id);

export function navItem(section: DashboardSection): NavItem {
	return NAV_ITEMS.find(item => item.id === section) ?? NAV_ITEMS[0];
}
