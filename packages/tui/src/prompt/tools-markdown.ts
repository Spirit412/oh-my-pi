import { t } from "@oh-my-pi/pi-utils/i18n";

export interface ToolsMarkdownBindings {
	tools: ReadonlyArray<{ description: string; name: string }>;
	/** Tools mounted under `xd://` URLs, listed after the active set. */
	xdevTools?: ReadonlyArray<{ name: string; summary: string }>;
}

function escapeTableCell(value: string): string {
	return value
		.replace(/\|/g, "\\|")
		.replace(/\r?\n+/g, " ")
		.trim();
}

export function buildToolsMarkdown(bindings: ToolsMarkdownBindings): string {
	if (bindings.tools.length === 0 && !bindings.xdevTools?.length) {
		return t("tui.prompt.tools.none", "No tools are currently visible to the agent.");
	}

	const rows: string[] = [];
	for (const tool of bindings.tools) {
		const description =
			escapeTableCell(tool.description) || t("tui.prompt.tools.noDescription", "No description provided.");
		rows.push(`| \`${tool.name}\` | ${description} |`);
	}
	for (const mounted of bindings.xdevTools ?? []) {
		const summary =
			escapeTableCell(mounted.summary) || t("tui.prompt.tools.noDescription", "No description provided.");
		rows.push(`| \`xd://${mounted.name}\` | ${summary} |`);
	}

	return [
		`| ${t("tui.prompt.tools.headerTool", "Tool")} | ${t("tui.prompt.tools.headerDescription", "Description")} |`,
		"|------|-------------|",
		...rows,
	].join("\n");
}
