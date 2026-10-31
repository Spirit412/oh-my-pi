import { type ComposerStyle, registerComposerStyle } from "../index";
import type { SubmenuOption } from "./settings-defs";
import { t } from "@oh-my-pi/pi-utils/i18n";

/** Composer shape id; extensions may register additional values at runtime. */
export type ComposerShape = string;

/** Built-in composer choices and their shared settings/setup copy. */
export function builtinComposerShapes(): readonly SubmenuOption[] {
	return [
		{
			value: "band",
			label: t("tui.overlays.composerShape.bandLabel", "Status Band (Default)"),
			description: t(
				"tui.overlays.composerShape.bandDescription",
				"Flush soft-capped status band above a curved prompt, no frame",
			),
		},
		{
			value: "box",
			label: t("tui.overlays.composerShape.boxLabel", "Rounded Box"),
			description: t(
				"tui.overlays.composerShape.boxDescription",
				"Status line embedded in top border, compact 2-line prompt",
			),
		},
		{
			value: "claude",
			label: t("tui.overlays.composerShape.claudeLabel", "Claude Code"),
			description: t(
				"tui.overlays.composerShape.claudeDescription",
				"Full-width horizontal rules above and below, status line at bottom",
			),
		},
		{
			value: "pi",
			label: t("tui.overlays.composerShape.piLabel", "Pi"),
			description: t(
				"tui.overlays.composerShape.piDescription",
				"Framed horizontal rules with status line at bottom",
			),
		},
		{
			value: "borderless",
			label: t("tui.overlays.composerShape.borderlessLabel", "Borderless"),
			description: t(
				"tui.overlays.composerShape.borderlessDescription",
				"Clean prompt glyph with status line at bottom, no box borders",
			),
		},
		{
			value: "rule",
			label: t("tui.overlays.composerShape.ruleLabel", "Top Rule Dock"),
			description: t(
				"tui.overlays.composerShape.ruleDescription",
				"Single top rule with status docked onto it and below",
			),
		},
		{
			value: "field",
			label: t("tui.overlays.composerShape.fieldLabel", "Compact Field"),
			description: t("tui.overlays.composerShape.fieldDescription", "Filled one-row field with accent end caps"),
		},
		{
			value: "rail",
			label: t("tui.overlays.composerShape.railLabel", "Accent Rail"),
			description: t(
				"tui.overlays.composerShape.railDescription",
				"Filled one-row field anchored by a single accent rail",
			),
		},
	];
}

/** Built-in composer ids used by tests and non-runtime consumers. */
export const COMPOSER_SHAPE_VALUES = builtinComposerShapes().map(shape => shape.value);

/** Visual composer style and selector copy registered by an extension. */
export interface ComposerShapeDefinition {
	label: string;
	description?: string;
	style: ComposerStyle;
}

const extensionComposerShapes = new Map<string, SubmenuOption>();

/** Install one extension composer shape into rendering and selector registries. */
export function installExtensionComposerShape(definition: ComposerShapeDefinition): () => void {
	const unregisterStyle = registerComposerStyle(definition.style);
	const id = definition.style.id;
	const option: SubmenuOption = {
		value: id,
		label: definition.label,
		description: definition.description,
	};
	extensionComposerShapes.set(id, option);
	return () => {
		if (extensionComposerShapes.get(id) === option) extensionComposerShapes.delete(id);
		unregisterStyle();
	};
}

/** Available built-in and extension composer choices in selector order. */
export function getComposerShapeOptions(): readonly SubmenuOption[] {
	return [...builtinComposerShapes(), ...extensionComposerShapes.values()];
}
