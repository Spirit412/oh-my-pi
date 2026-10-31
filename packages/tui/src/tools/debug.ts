import { t } from "@oh-my-pi/pi-utils/i18n";
import type { Component } from "../tui";
import { Text } from "../components/text";
import type { Theme } from "../theme/theme";
import { renderStatusLine } from "../render/status-line";
import { framedToolCard } from "../render/tool-card";
import {
	formatExpandHint,
	formatStatusIcon,
	PREVIEW_LIMITS,
	replaceTabs,
	TRUNCATE_LENGTHS,
	truncateToWidth,
	clipCollapsed,
} from "../render/render-utils";
import type { NativeToolView, RenderResultOptions, ToolRenderer, ToolRenderResult } from "./renderer";
import { ansi, kv } from "../native/describe";
import type { NativeChild } from "../native/node";
import { OwnerMemo } from "../native/memo";
import { errorView, noteText, resultText, toolHead } from "./native-view";

/** Display fields captured from a debugger session. */
export interface DebugSessionSnapshot {
	id: string;
	adapter: string;
	status: string;
	cwd: string;
	program?: string;
	stopReason?: string;
	frameName?: string;
	instructionPointerReference?: string;
	source?: { path?: string };
	line?: number;
	column?: number;
	needsConfigurationDone: boolean;
	exitCode?: number;
}

/** Debug execution metadata consumed by the transcript. */
export interface DebugToolDetails {
	action: string;
	success: boolean;
	snapshot?: DebugSessionSnapshot;
}

/** Debug arguments used to describe a pending request. */
export interface DebugRenderArgs {
	action?: string;
	program?: string;
	file?: string;
	line?: number;
	function?: string;
	expression?: string;
	command?: string;
	memory_reference?: string;
	instruction_reference?: string;
	data_id?: string;
	name?: string;
}

/** Formats a debugger stop location as a source path and coordinates. */
export function formatLocation(snapshot: DebugSessionSnapshot | undefined): string | null {
	if (!snapshot?.source?.path || snapshot.line === undefined) {
		return null;
	}
	return `${snapshot.source.path}:${snapshot.line}${snapshot.column !== undefined ? `:${snapshot.column}` : ""}`;
}

/** Formats the debugger session snapshot for model and terminal output. */
export function formatSessionSnapshot(snapshot: DebugSessionSnapshot): string[] {
	const lines = [
		t("tui.tools.debug.session", "Session {id}", { id: snapshot.id }),
		t("tui.tools.debug.adapter", "Adapter: {adapter}", { adapter: snapshot.adapter }),
		t("tui.tools.debug.status", "Status: {status}", { status: snapshot.status }),
		t("tui.tools.debug.cwd", "CWD: {cwd}", { cwd: snapshot.cwd }),
	];
	if (snapshot.program) lines.push(t("tui.tools.debug.program", "Program: {program}", { program: snapshot.program }));
	if (snapshot.stopReason)
		lines.push(t("tui.tools.debug.stopReason", "Stop reason: {reason}", { reason: snapshot.stopReason }));
	if (snapshot.frameName) lines.push(t("tui.tools.debug.frame", "Frame: {frame}", { frame: snapshot.frameName }));
	if (snapshot.instructionPointerReference) {
		lines.push(
			t("tui.tools.debug.instructionPointer", "Instruction pointer: {pointer}", {
				pointer: snapshot.instructionPointerReference,
			}),
		);
	}
	const location = formatLocation(snapshot);
	if (location) lines.push(t("tui.tools.debug.location", "Location: {location}", { location }));
	if (snapshot.needsConfigurationDone) {
		lines.push(
			t(
				"tui.tools.debug.configuration",
				"Configuration: pending configurationDone; set breakpoints, then continue.",
			),
		);
	}
	if (snapshot.exitCode !== undefined)
		lines.push(t("tui.tools.debug.exitCode", "Exit code: {code}", { code: snapshot.exitCode }));
	return lines;
}

function summarizeDebugCall(args: DebugRenderArgs): string {
	const action = args.action ? args.action.replaceAll("_", " ") : t("tui.tools.debug.request", "request");
	if (args.program) {
		return `${action} ${truncateToWidth(args.program, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.file && args.line !== undefined) {
		return `${action} ${truncateToWidth(`${args.file}:${args.line}`, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.function) {
		return `${action} ${truncateToWidth(args.function, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.expression) {
		return `${action} ${truncateToWidth(args.expression, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.command) {
		return `${action} ${truncateToWidth(args.command, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.memory_reference) {
		return `${action} ${truncateToWidth(args.memory_reference, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.instruction_reference) {
		return `${action} ${truncateToWidth(args.instruction_reference, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.data_id) {
		return `${action} ${truncateToWidth(args.data_id, TRUNCATE_LENGTHS.TITLE)}`;
	}
	if (args.name) {
		return `${action} ${truncateToWidth(args.name, TRUNCATE_LENGTHS.TITLE)}`;
	}
	return action;
}

/** Untruncated `[action, target]` for native heads; mirrors {@link summarizeDebugCall}'s field precedence. */
function debugCallParts(args: DebugRenderArgs | undefined, fallbackAction: string): [string, string | undefined] {
	const action = (args?.action ?? fallbackAction).replaceAll("_", " ");
	if (!args) return [action, undefined];
	const target =
		args.program ||
		(args.file && args.line !== undefined ? `${args.file}:${args.line}` : undefined) ||
		args.function ||
		args.expression ||
		args.command ||
		args.memory_reference ||
		args.instruction_reference ||
		args.data_id ||
		args.name ||
		undefined;
	return [action, target];
}

function describeDebugResult(
	result: ToolRenderResult<DebugToolDetails>,
	args: DebugRenderArgs | undefined,
): NativeToolView {
	const [action, target] = debugCallParts(args, result.details?.action ?? t("tui.tools.debug.action", "debug"));
	const output = resultText(result);
	if (result.isError) return errorView("Debug", output || t("tui.tools.debug.failed", "Debug failed"), action, target);
	const snapshot = result.details?.snapshot;
	const body: NativeChild[] = [];
	let sessionRows = 0;
	if (snapshot) {
		const location = formatLocation(snapshot);
		const rows: [string, string | undefined][] = [
			[t("tui.tools.debug.label.session", "Session"), snapshot.id],
			[t("tui.tools.debug.label.adapter", "Adapter"), snapshot.adapter],
			[t("tui.tools.debug.label.status", "Status"), snapshot.status],
			[t("tui.tools.debug.label.cwd", "CWD"), snapshot.cwd],
			[t("tui.tools.debug.label.program", "Program"), snapshot.program],
			[t("tui.tools.debug.label.stopReason", "Stop reason"), snapshot.stopReason],
			[t("tui.tools.debug.label.frame", "Frame"), snapshot.frameName],
			[t("tui.tools.debug.label.instructionPointer", "Instruction pointer"), snapshot.instructionPointerReference],
			[t("tui.tools.debug.label.location", "Location"), location ?? undefined],
			[
				t("tui.tools.debug.label.configuration", "Configuration"),
				snapshot.needsConfigurationDone
					? t("tui.tools.debug.configurationPending", "pending configurationDone; set breakpoints, then continue.")
					: undefined,
			],
			[
				t("tui.tools.debug.label.exitCode", "Exit code"),
				snapshot.exitCode !== undefined ? String(snapshot.exitCode) : undefined,
			],
		];
		const grid = kv(rows);
		if (grid) {
			body.push(grid);
			sessionRows = rows.filter(([, value]) => value).length;
		}
	}
	body.push(output ? ansi(output) : noteText(t("tui.tools.debug.noOutput", "No output")));
	return {
		head: toolHead("Debug", action, target),
		body,
		preview: { lines: sessionRows + PREVIEW_LIMITS.COLLAPSED_LINES },
	};
}

const debugResultMemo = new OwnerMemo<NativeToolView | undefined>();

/** Renders debugger calls and captured execution snapshots. */
export const debugToolRenderer = {
	animatedPartialResult: true,
	renderCall(args: DebugRenderArgs, _options: RenderResultOptions, theme: Theme): Component {
		const text = renderStatusLine({ icon: "pending", title: "Debug", description: summarizeDebugCall(args) }, theme);
		return new Text(text, 0, 0);
	},

	renderResult(
		result: { content: Array<{ type: string; text?: string }>; details?: DebugToolDetails; isError?: boolean },
		options: RenderResultOptions,
		theme: Theme,
		args?: DebugRenderArgs,
	): Component {
		return framedToolCard(theme, () => {
			const action = (args?.action ?? result.details?.action ?? t("tui.tools.debug.action", "debug")).replaceAll(
				"_",
				" ",
			);
			const success = !options.isPartial && !result.isError;
			const statusIcon = success
				? theme.styledSymbol("tool.debug", "accent")
				: formatStatusIcon(options.isPartial ? "running" : "error", theme, options.spinnerFrame);
			const header = `${statusIcon} Debug ${action}`;
			const summaryLines = result.details?.snapshot
				? formatSessionSnapshot(result.details.snapshot).map(line => replaceTabs(line))
				: [];
			const text =
				result.content.find(block => block.type === "text")?.text ?? t("tui.tools.debug.noOutput", "No output");
			const rawLines = replaceTabs(text).split("\n");
			const previewLimit = options.expanded ? PREVIEW_LIMITS.EXPANDED_LINES : PREVIEW_LIMITS.COLLAPSED_LINES;
			const displayedLines = rawLines
				.slice(0, previewLimit)
				.map(line => clipCollapsed(line, TRUNCATE_LENGTHS.LINE, options.expanded));
			const remaining = rawLines.length - displayedLines.length;
			if (remaining > 0) {
				displayedLines.push(
					theme.fg(
						"muted",
						`… ${t("tui.tools.debug.moreLines", { one: "{count} more line", other: "{count} more lines" }, { count: remaining })} ${formatExpandHint(theme, options.expanded, true)}`,
					),
				);
			}
			return {
				header,
				phase: options.isPartial ? "partial" : result.isError ? "error" : "success",
				sections: [
					...(summaryLines.length > 0
						? [
								{
									label: theme.fg("toolTitle", t("tui.tools.debug.section.session", "Session")),
									content: summaryLines,
								},
							]
						: []),
					{ label: theme.fg("toolTitle", t("tui.tools.debug.section.output", "Output")), content: displayedLines },
				],
				applyBg: false,
			};
		});
	},
	describeCall(args: DebugRenderArgs): NativeToolView {
		const [action, target] = debugCallParts(args, t("tui.tools.debug.request", "request"));
		return { head: toolHead("Debug", action, target) };
	},
	describeResult(
		result: ToolRenderResult<DebugToolDetails>,
		_options: RenderResultOptions,
		args?: DebugRenderArgs,
	): NativeToolView | undefined {
		return debugResultMemo.get(result, [], () => describeDebugResult(result, args));
	},
	mergeCallAndResult: true,
	inline: true,
} satisfies ToolRenderer<DebugRenderArgs, DebugToolDetails>;
