/**
 * Keyboard shortcuts sheet of the git TUI (`?`).
 *
 * The keys are the git TUI's own (see `git-tui.ts` and `sidebar.ts`); this
 * sheet only lists them. ANSI draws grouped `key  description` rows; the
 * native render is the hotkeys sheet (NATIVE_REDESIGN §9.7): a glass sheet
 * titled "Keyboard shortcuts" with one section per group and a two-column
 * table whose key cells carry the `key` span token, so Tern draws keycaps.
 */
import { t } from "@oh-my-pi/pi-utils/i18n";
import { formatKeyHint } from "../../app-keybindings";
import type { KeyName } from "../../key-hint-format";
import { matchesKey } from "../../keys";
import { col, node, span } from "../../native/describe";
import type { NativeNode, NativeUiEvent } from "../../native/node";
import { actionBar, actionButton } from "../../native/overlay";
import { theme } from "../../theme/theme";
import type { Component } from "../../tui";
import { truncateToWidth, visibleWidth } from "../../utils";

interface Shortcut {
	readonly keys: readonly KeyName[];
	readonly label: string;
}

/** Shortcut groups; labels resolve through {@link t} so the sheet follows the active locale. */
function shortcutGroups(): readonly { readonly title: string; readonly rows: readonly Shortcut[] }[] {
	return [
		{
			title: t("tui.apps.gitHelp.groupMove", "Move"),
			rows: [
				{ keys: ["up", "down"], label: t("tui.apps.gitHelp.moveSelection", "Move the selection") },
				{
					keys: ["left", "right"],
					label: t("tui.apps.gitHelp.foldSection", "Fold or unfold a folder or section"),
				},
				{ keys: ["enter"], label: t("tui.apps.gitHelp.openFile", "Open the file in the diff") },
				{
					keys: ["tab"],
					label: t("tui.apps.gitHelp.switchPanes", "Switch between the diff and the changes"),
				},
				{ keys: ["]", "["], label: t("tui.apps.gitHelp.nextFile", "Next or previous file") },
				{ keys: ["alt+down", "alt+up"], label: t("tui.apps.gitHelp.nextChange", "Next or previous change") },
				{ keys: ["g", "shift+g"], label: t("tui.apps.gitHelp.firstLastRow", "First or last row") },
			],
		},
		{
			title: t("tui.apps.gitHelp.groupStage", "Stage"),
			rows: [
				{ keys: ["space"], label: t("tui.apps.gitHelp.stageRow", "Stage or unstage the row") },
				{
					keys: ["s", "u"],
					label: t("tui.apps.gitHelp.stageHunk", "Stage or unstage (the hunk or selected lines in the diff)"),
				},
				{ keys: ["shift+up", "shift+down"], label: t("tui.apps.gitHelp.selectLines", "Select lines in the diff") },
				{
					keys: ["x"],
					label: t("tui.apps.gitHelp.discardHunk", "Discard the hunk or selected lines (press twice)"),
				},
				{
					keys: ["delete"],
					label: t("tui.apps.gitHelp.discardFile", "Discard the file or folder (press twice)"),
				},
			],
		},
		{
			title: t("tui.apps.gitHelp.groupView", "View"),
			rows: [
				{ keys: ["v"], label: t("tui.apps.gitHelp.cycleView", "Cycle the diff view") },
				{ keys: ["1", "2", "3", "4"], label: t("tui.apps.gitHelp.viewModes", "File, split, inline or hunk view") },
				{ keys: ["w"], label: t("tui.apps.gitHelp.wrapLines", "Wrap long lines") },
				{ keys: ["b"], label: t("tui.apps.gitHelp.ignoreWhitespace", "Ignore whitespace, then formatting") },
				{ keys: ["t"], label: t("tui.apps.gitHelp.pathsTree", "Paths or folder tree") },
				{ keys: ["r"], label: t("tui.apps.gitHelp.refresh", "Refresh") },
			],
		},
		{
			title: t("tui.apps.gitHelp.groupCommit", "Commit"),
			rows: [
				{
					keys: ["c"],
					label: t("tui.apps.gitHelp.writeCommit", "Write the commit message (empty: generate one)"),
				},
				{ keys: ["escape"], label: t("tui.apps.gitHelp.leaveField", "Leave the field") },
				{ keys: ["q"], label: t("tui.apps.gitHelp.quit", "Quit") },
			],
		},
	];
}

/** The shortcuts overlay; any of `?`, escape or `q` closes it. */
export class GitHelpSheet implements Component {
	readonly nativeOverlay = {
		role: "omp.overlay.hotkeys",
		head: t("tui.apps.gitHelp.title", "Keyboard shortcuts"),
		size: "lg",
	} as const;
	readonly #close: () => void;
	#native: NativeNode | undefined;

	constructor(close: () => void) {
		this.#close = close;
	}

	handleInput(data: string): void {
		if (data === "?" || data === "q" || matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) this.#close();
	}

	/** Close runs what Esc runs. */
	handleNativeEvent(event: NativeUiEvent): void {
		if (event.type === "action" && event.act === "close") this.#close();
	}

	describe(): NativeNode {
		const groups = shortcutGroups();
		this.#native ??= col(
			[
				...groups.map(group =>
					node(
						"section",
						{ head: group.title, role: "omp.hotkeys.group" },
						[
							node("table", {
								role: "omp.hotkeys.table",
								cols: [
									{ id: "keys", head: t("tui.apps.gitHelp.headKeys", "Keys") },
									{ id: "does", head: t("tui.apps.gitHelp.headAction", "Action"), grow: 1 },
								],
								rows: group.rows.map((row, index) => ({
									id: String(index),
									cells: { keys: row.keys.map(key => span(formatKeyHint(key), "key")), does: row.label },
								})),
							}),
						],
						group.title,
					),
				),
				actionBar([null, actionButton(t("tui.apps.gitHelp.closeButton", "Close"), "close", { keys: "escape" })]),
			],
			{ gap: "lg", role: "omp.app.git.help" },
		);
		return this.#native;
	}

	render(width: number): readonly string[] {
		const groups = shortcutGroups();
		const keyWidth = Math.max(
			...groups.flatMap(group => group.rows.map(row => visibleWidth(row.keys.map(formatKeyHint).join(" ")))),
		);
		const lines = [truncateToWidth(` ${theme.bold(t("tui.apps.gitHelp.title", "Keyboard shortcuts"))}`, width), ""];
		for (const group of groups) {
			for (const row of group.rows) {
				const keys = row.keys.map(formatKeyHint).join(" ");
				const pad = " ".repeat(Math.max(1, keyWidth - visibleWidth(keys) + 2));
				lines.push(truncateToWidth(`   ${theme.fg("accent", keys)}${pad}${row.label}`, width));
			}
			lines.push("");
		}
		lines.push(
			truncateToWidth(
				` ${theme.fg("dim", `${formatKeyHint("escape")} ${t("tui.apps.gitHelp.closeHint", "close")}`)}`,
				width,
			),
		);
		return lines;
	}

	invalidate(): void {
		this.#native = undefined;
	}
}
