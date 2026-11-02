import { Button, Drawer, Layout, Menu, Segmented, theme as antdTheme, type MenuProps } from "antd";
import { Menu as MenuIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useLiveStatus } from "../data/live";
import { rangeLabel, rangeWindowLabel, TIME_RANGES } from "../data/range";
import { useT } from "../i18n";
import type { TimeRange } from "../types";
import { useSystemTheme } from "../useSystemTheme";
import { LiveChip } from "./LiveChip";
import { type DashboardSection, NAV } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export interface ShellProps {
	section: DashboardSection;
	onSectionChange: (section: DashboardSection) => void;
	range: TimeRange;
	onRangeChange: (range: TimeRange) => void;
	children: ReactNode;
}

const SIDER_WIDTH = 224;

/** Below this the sidebar collapses into a drawer opened from the header. */
const NARROW_QUERY = "(max-width: 900px)";

const RANGE_OPTIONS = TIME_RANGES.map((range, i) => ({
	value: range,
	label: rangeLabel(range),
	title: `${rangeWindowLabel(range)} (${i + 1})`,
}));

const PROGRESS_KEYFRAMES = "@keyframes omp-sync-slide { 0% { margin-left: -40%; } 100% { margin-left: 100%; } }";

/**
 * AntD Layout frame: inline-menu sidebar, sticky header with brand, live chip,
 * range segmented, and theme toggle. Owns the global keyboard shortcuts: `1`–`6`
 * pick a range, `g` then a letter jumps to a page.
 */
export function Shell({ section, onSectionChange, range, onRangeChange, children }: ShellProps) {
	const t = useT();
	const [menuOpen, setMenuOpen] = useState(false);
	const scrolled = useScrolled();
	const narrow = useMediaQuery(NARROW_QUERY);
	const { token } = antdTheme.useToken();
	const resolvedTheme = useSystemTheme();
	const { sync } = useLiveStatus();
	useShortcuts(onSectionChange, onRangeChange);

	const go = (next: DashboardSection) => {
		onSectionChange(next);
		setMenuOpen(false);
		window.scrollTo({ top: 0 });
	};

	const progress = sync.phase === "syncing" ? (sync.total > 0 ? sync.current / sync.total : null) : undefined;

	const menuItems: NonNullable<MenuProps["items"]> = NAV.map(group => ({
		type: "group" as const,
		key: group.headingKey,
		label: t(group.headingKey),
		children: group.items.map(item => ({
			key: item.id,
			icon: <item.icon size={15} />,
			label: (
				<span style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
					<span style={{ flex: 1 }}>{t(item.labelKey)}</span>
					<span style={{ fontSize: 11, opacity: 0.45, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
						G {item.hotkey.toUpperCase()}
					</span>
				</span>
			),
		})),
	}));

	const menu = (
		<Menu
			mode="inline"
			theme={resolvedTheme}
			selectedKeys={[section]}
			items={menuItems}
			onClick={info => go(info.key as DashboardSection)}
			style={{ borderInlineEnd: "none", flex: 1 }}
		/>
	);

	const sidebarBody = (
		<>
			{menu}
			<div
				style={{
					padding: "12px 16px",
					display: "flex",
					flexDirection: "column",
					gap: 4,
					fontSize: 12,
					opacity: 0.55,
				}}
			>
				<span>{t("shell.hintRanges")}</span>
				<span>{t("shell.hintJump")}</span>
			</div>
		</>
	);

	const sidebar = (
		<nav aria-label={t("shell.navAria")} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			{sidebarBody}
		</nav>
	);

	return (
		<Layout style={{ minHeight: "100vh" }}>
			{narrow ? (
				<Drawer
					placement="left"
					open={menuOpen}
					onClose={() => setMenuOpen(false)}
					width={SIDER_WIDTH}
					aria-label={t("shell.openNav")}
					styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
				>
					{sidebar}
				</Drawer>
			) : (
				<Layout.Sider
					width={SIDER_WIDTH}
					theme={resolvedTheme}
					style={{ position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}
				>
					{sidebar}
				</Layout.Sider>
			)}
			<Layout>
				<Layout.Header
					data-scrolled={scrolled}
					style={{
						position: "sticky",
						top: 0,
						zIndex: 20,
						display: "flex",
						alignItems: "center",
						gap: 12,
						paddingInline: 16,
						boxShadow: scrolled ? `inset 0 -1px 0 0 ${token.colorBorderSecondary}` : undefined,
					}}
				>
					{narrow && (
						<Button
							type="text"
							icon={<MenuIcon size={16} />}
							onClick={() => setMenuOpen(true)}
							aria-label={t("shell.openNav")}
						/>
					)}
					<div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
						<svg viewBox="0 0 64 64" width="22" height="22" aria-hidden="true">
							<defs>
								<linearGradient id="omp-mark-grad" x1="0" y1="0" x2="1" y2="1">
									<stop offset="0" stopColor="oklch(0.7 0.24 340)" />
									<stop offset=".5" stopColor="oklch(0.62 0.21 295)" />
									<stop offset="1" stopColor="oklch(0.81 0.14 200)" />
								</linearGradient>
							</defs>
							<path fill="url(#omp-mark-grad)" d="M10 14h44v9H43v33h-9V23h-9v22h-9V23H10z" />
						</svg>
						<span>omp</span>
						<span style={{ opacity: 0.4 }}>/</span>
						<span style={{ fontWeight: 400, opacity: 0.75 }}>stats</span>
					</div>
					<div style={{ flex: 1 }} />
					{!narrow && <LiveChip />}
					<Segmented
						options={RANGE_OPTIONS}
						value={range}
						onChange={value => onRangeChange(value as TimeRange)}
						aria-label={t("shell.rangeAria")}
					/>
					<ThemeToggle />
					{progress !== undefined && (
						<div
							aria-hidden="true"
							style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, overflow: "hidden" }}
						>
							<style>{PROGRESS_KEYFRAMES}</style>
							<div
								style={{
									height: "100%",
									background: token.colorPrimary,
									width: progress === null ? "40%" : `${progress * 100}%`,
									transition: progress === null ? undefined : "width 0.2s ease",
									animation: progress === null ? "omp-sync-slide 1.1s ease-in-out infinite" : undefined,
								}}
							/>
						</div>
					)}
				</Layout.Header>
				<Layout.Content style={{ padding: 16 }}>{children}</Layout.Content>
			</Layout>
		</Layout>
	);
}

function useScrolled(): boolean {
	const [scrolled, setScrolled] = useState(false);
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 4);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return scrolled;
}

function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
	useEffect(() => {
		const mq = window.matchMedia(query);
		const update = () => setMatches(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, [query]);
	return matches;
}

function useShortcuts(onSection: (section: DashboardSection) => void, onRange: (range: TimeRange) => void): void {
	useEffect(() => {
		let pendingG = 0;
		const onKey = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
			const target = e.target;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable ||
					target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.tagName === "SELECT")
			) {
				return;
			}
			if (document.querySelector('[aria-modal="true"]')) return;
			const key = e.key.toLowerCase();
			if (pendingG && Date.now() - pendingG < 1200) {
				pendingG = 0;
				const item = NAV.flatMap(group => group.items).find(i => i.hotkey === key);
				if (item) {
					e.preventDefault();
					onSection(item.id);
					window.scrollTo({ top: 0 });
				}
				return;
			}
			if (key === "g") {
				pendingG = Date.now();
				return;
			}
			const index = Number(key) - 1;
			if (Number.isInteger(index) && index >= 0 && index < TIME_RANGES.length) {
				e.preventDefault();
				onRange(TIME_RANGES[index]);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onSection, onRange]);
}
