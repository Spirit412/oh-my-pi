import { t } from "../i18n";
import type { BuiltinSlashCommand, SubcommandDef } from "./types";

/**
 * Stable key for a builtin command description. Keys derive from the command
 * name — a reserved identifier that translation never changes — so shipped
 * catalogs survive copy edits to the inline English fallback.
 */
export function commandDescriptionKey(name: string): string {
	return `omp.slash.${name}.description`;
}

/** Stable key for the ACP-specific description of a builtin command. */
export function acpCommandDescriptionKey(name: string): string {
	return `omp.slash.${name}.acpDescription`;
}

/** Stable key for a builtin subcommand description. */
export function subcommandDescriptionKey(commandName: string, subcommandName: string): string {
	// Composite names such as `mm list` become `mm-list` so keys stay dot-delimited.
	return `omp.slash.${commandName}.sub.${subcommandName.trim().replace(/\s+/g, "-")}.description`;
}

/**
 * Resolve a builtin command description at read time. Callers hold this behind
 * a getter so a locale change applies without rebuilding the registry.
 */
export function resolveCommandDescription(command: Pick<BuiltinSlashCommand, "name" | "description">): string {
	return t(commandDescriptionKey(command.name), command.description);
}

/** Resolve the description an ACP client sees, honoring `acpDescription`. */
export function resolveAcpCommandDescription(
	command: Pick<BuiltinSlashCommand, "name" | "description"> & { acpDescription?: string },
): string {
	return command.acpDescription
		? t(acpCommandDescriptionKey(command.name), command.acpDescription)
		: resolveCommandDescription(command);
}

/** Localized on/off state for autocomplete status lines (`Fast: on`). */
export function stateLabel(enabled: boolean): string {
	return enabled ? t("omp.common.state.on", "on") : t("omp.common.state.off", "off");
}

/** Which non-builtin source a command or skill description came from. */
export type DynamicCommandDescriptionSource = "extension" | "command" | "skill";

/**
 * Stable key for a non-builtin command or skill description. These names come
 * from extensions, plugins, project commands, and skills, so the English
 * description stays the inline fallback and a core/user/project catalog may
 * translate it without touching the source file.
 */
export function dynamicCommandDescriptionKey(source: DynamicCommandDescriptionSource, name: string): string {
	return `omp.dynamic.${source}.${name}.description`;
}

/**
 * Resolve an extension, file/custom, or skill command description at read
 * time. The command palette, ACP command list, and extension `getCommands()`
 * surface all go through this so a catalog entry applies everywhere.
 */
export function resolveDynamicCommandDescription(
	source: DynamicCommandDescriptionSource,
	name: string,
	fallback: string,
): string {
	return t(dynamicCommandDescriptionKey(source, name), fallback);
}

/**
 * Wrap subcommand definitions so their descriptions translate at read time.
 * `usage` stays verbatim: it is invocation syntax, not prose.
 */
export function localizeSubcommands(
	commandName: string,
	subcommands: SubcommandDef[] | undefined,
): SubcommandDef[] | undefined {
	if (!subcommands) return undefined;
	return subcommands.map(subcommand => ({
		...subcommand,
		get description() {
			return t(subcommandDescriptionKey(commandName, subcommand.name), subcommand.description);
		},
	}));
}
