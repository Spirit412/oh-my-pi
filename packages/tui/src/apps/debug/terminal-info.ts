/**
 * Terminal state collection for the debug menu.
 *
 * Surfaces the detected terminal, the established subprotocols the renderer
 * negotiated (graphics, desktop notifications, hyperlinks, true color), the
 * scrollback/erase strategy, and the live geometry — the details that decide
 * which escape sequences the renderer emits.
 */
import { t } from "@oh-my-pi/pi-utils/i18n";
import {
	getCellDimensions,
	ImageProtocol,
	isOsc99Supported,
	NotifyProtocol,
	TERMINAL,
	TERMINAL_ID,
} from "../../terminal-capabilities";
import { classifyTerminalMultiplexer } from "../../terminal-multiplexer";

/** Live values the debug view reads off the running TUI, not the static capability table. */
export interface TerminalRuntimeState {
	columns: number;
	rows: number;
	/** Whether DEC 2026 synchronized-output wrappers are currently emitted. */
	synchronizedOutput: boolean;
}

/** Terminal capabilities, geometry, and detection environment. */
export interface TerminalStateInfo {
	detectedId: string;
	columns: number;
	rows: number;
	cellWidthPx: number;
	cellHeightPx: number;
	trueColor: boolean;
	imageProtocol: string;
	notifyProtocol: string;
	osc99Confirmed: boolean;
	hyperlinks: boolean;
	deccara: boolean;
	screenToScrollback: boolean;
	synchronizedOutput: boolean;
	multiplexer: string | null;
	env: { TERM?: string; TERM_PROGRAM?: string; TERM_PROGRAM_VERSION?: string; COLORTERM?: string };
}

function imageProtocolName(protocol: ImageProtocol): string {
	switch (protocol) {
		case ImageProtocol.Kitty:
			return t("tui.apps.terminalInfo.imageKitty", "Kitty graphics");
		case ImageProtocol.Iterm2:
			return t("tui.apps.terminalInfo.imageIterm2", "iTerm2 inline images");
		case ImageProtocol.Sixel:
			return t("tui.apps.terminalInfo.imageSixel", "Sixel");
	}
}

function notifyProtocolName(protocol: NotifyProtocol): string {
	switch (protocol) {
		case NotifyProtocol.Bell:
			return t("tui.apps.terminalInfo.notifyBell", "BEL (\\a)");
		case NotifyProtocol.Osc99:
			return t("tui.apps.terminalInfo.notifyOsc99", "OSC 99 (kitty desktop notifications)");
		case NotifyProtocol.Osc9:
			return t("tui.apps.terminalInfo.notifyOsc9", "OSC 9 (iTerm2/WezTerm)");
	}
}

/** Snapshot the active terminal capabilities and the live runtime geometry. */
export function collectTerminalState(runtime: TerminalRuntimeState): TerminalStateInfo {
	const env = Bun.env;
	const cell = getCellDimensions();
	return {
		detectedId: TERMINAL_ID,
		columns: runtime.columns,
		rows: runtime.rows,
		cellWidthPx: cell.widthPx,
		cellHeightPx: cell.heightPx,
		trueColor: TERMINAL.trueColor,
		imageProtocol:
			TERMINAL.imageProtocol === null
				? t("tui.apps.terminalInfo.imageNone", "none")
				: imageProtocolName(TERMINAL.imageProtocol),
		notifyProtocol: notifyProtocolName(TERMINAL.notifyProtocol),
		osc99Confirmed: isOsc99Supported(),
		hyperlinks: TERMINAL.hyperlinks,
		deccara: TERMINAL.deccara,
		screenToScrollback: TERMINAL.supportsScreenToScrollback,
		synchronizedOutput: runtime.synchronizedOutput,
		multiplexer: classifyTerminalMultiplexer(env),
		env: {
			TERM: env.TERM,
			TERM_PROGRAM: env.TERM_PROGRAM,
			TERM_PROGRAM_VERSION: env.TERM_PROGRAM_VERSION,
			COLORTERM: env.COLORTERM,
		},
	};
}

const yesNo = (value: boolean): string =>
	value ? t("tui.apps.terminalInfo.yes", "yes") : t("tui.apps.terminalInfo.no", "no");

/** Format terminal state for display in the debug menu. */
export function formatTerminalState(info: TerminalStateInfo): string {
	const lines = [
		t("tui.apps.terminalInfo.title", "Terminal State"),
		"━━━━━━━━━━━━━━",
		t("tui.apps.terminalInfo.detected", "Detected:     {id}", { id: info.detectedId }),
		t("tui.apps.terminalInfo.geometry", "Geometry:     {columns}x{rows} cells · cell {cellWidth}x{cellHeight}px", {
			columns: info.columns,
			rows: info.rows,
			cellWidth: info.cellWidthPx,
			cellHeight: info.cellHeightPx,
		}),
		info.multiplexer
			? t("tui.apps.terminalInfo.multiplexer", "Multiplexer:  {name}", { name: info.multiplexer })
			: t("tui.apps.terminalInfo.multiplexerNone", "Multiplexer:  none"),
		"",
		t("tui.apps.terminalInfo.subprotocols", "Subprotocols"),
		t("tui.apps.terminalInfo.graphics", "  Graphics:     {protocol}", { protocol: info.imageProtocol }),
		t("tui.apps.terminalInfo.notify", "  Notify:       {protocol}{confirmed}", {
			protocol: info.notifyProtocol,
			confirmed: info.osc99Confirmed ? t("tui.apps.terminalInfo.confirmedViaDa", " · confirmed via DA") : "",
		}),
		t("tui.apps.terminalInfo.hyperlinks", "  Hyperlinks:   {state} (OSC 8)", { state: yesNo(info.hyperlinks) }),
		t("tui.apps.terminalInfo.trueColor", "  True color:   {state} (24-bit SGR)", {
			state: yesNo(info.trueColor),
		}),
		t("tui.apps.terminalInfo.deccara", "  DECCARA:      {state} (rectangular-SGR background fills)", {
			state: yesNo(info.deccara),
		}),
		t("tui.apps.terminalInfo.syncOutput", "  Sync output:  {state} (DEC 2026)", {
			state: yesNo(info.synchronizedOutput),
		}),
		"",
		t("tui.apps.terminalInfo.scrollback", "Scrollback"),
		t("tui.apps.terminalInfo.screenToScrollback", "  Screen->history clear: {strategy}", {
			strategy: info.screenToScrollback ? "CSI 22 J" : "CSI 2 J (redraw)",
		}),
		"",
		t("tui.apps.terminalInfo.detectionSignals", "Detection signals"),
		t("tui.apps.terminalInfo.envTerm", "  TERM:                 {value}", {
			value: info.env.TERM ?? t("tui.apps.terminalInfo.unset", "(unset)"),
		}),
		t("tui.apps.terminalInfo.envTermProgram", "  TERM_PROGRAM:         {value}", {
			value: info.env.TERM_PROGRAM ?? t("tui.apps.terminalInfo.unset", "(unset)"),
		}),
		t("tui.apps.terminalInfo.envTermProgramVersion", "  TERM_PROGRAM_VERSION: {value}", {
			value: info.env.TERM_PROGRAM_VERSION ?? t("tui.apps.terminalInfo.unset", "(unset)"),
		}),
		t("tui.apps.terminalInfo.envColorterm", "  COLORTERM:            {value}", {
			value: info.env.COLORTERM ?? t("tui.apps.terminalInfo.unset", "(unset)"),
		}),
	];
	return lines.join("\n");
}
