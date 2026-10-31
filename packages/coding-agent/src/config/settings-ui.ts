import { TERMINAL } from "@oh-my-pi/pi-tui";
import { isNativeRendering } from "@oh-my-pi/pi-tui/native/state";
import {
	SETTING_TABS,
	type SettingsDisplayEntry,
	type SettingsHost,
	type SubmenuOption,
} from "@oh-my-pi/pi-tui/overlays/settings-defs";
import { t } from "../i18n";
import { isSettingsInitialized, Settings, settings } from "./settings";
import { orderedSettings } from "./all-settings";
import { type AnySetting, lookup } from "./registry";

import { cfgPlanAutosave, cfgPlanEnabled } from "../plan-mode/settings";
import {
	cfgRetryUsageAwareFallback,
	cfgDefaultThinkingLevel,
	normalizeProviderMaxInFlightRequests,
	validateProviderMaxInFlightRequests,
} from "../session/settings";
import { cfgAutolearnEnabled } from "../autolearn/settings";
import { cfgMemoryBackend } from "../memory-backend/settings";
import { cfgTuiVimMode } from "../modes/settings";
import { cfgAdvisorEnabled } from "../advisor/settings";
import { cfgContextFilesExtra } from "../session/context-settings";
import { cfgToolsRestrictedFolders } from "../tools/settings";

/** Condition over the global settings; hidden (false) until they are initialized. */
function whenSettings(test: (settings: Settings) => boolean): () => boolean {
	return () => isSettingsInitialized() && test(Settings.instance);
}

const CONDITIONS: Record<string, () => boolean> = {
	macOS: () => process.platform === "darwin",
	hasImageProtocol: () => !!TERMINAL.imageProtocol,
	nativeRendering: () => isNativeRendering(),
	advisorEnabled: whenSettings(s => cfgAdvisorEnabled.get(s) === true),
	vimModeEnabled: whenSettings(s => cfgTuiVimMode.get(s) === true),
	hindsightActive: whenSettings(s => cfgMemoryBackend.get(s) === "hindsight"),
	mnemopiActive: whenSettings(s => cfgMemoryBackend.get(s) === "mnemopi"),
	autolearnActive: whenSettings(s => cfgAutolearnEnabled.get(s) === true),
	autoThinkingActive: whenSettings(s => cfgDefaultThinkingLevel.get(s) === "auto"),
	usageAwareFallbackEnabled: whenSettings(s => cfgRetryUsageAwareFallback.get(s) === true),
	planModeEnabled: whenSettings(s => cfgPlanEnabled.get(s)),
	planAutosaveEnabled: whenSettings(s => cfgPlanEnabled.get(s) && cfgPlanAutosave.get(s)),
	// These editors write the global layer; hide them so a project-supplied list is never promoted to global.
	contextFilesExtraNotProject: whenSettings(s => cfgContextFilesExtra.provenance(s) !== "project"),
	restrictedFoldersNotProject: whenSettings(s => cfgToolsRestrictedFolders.provenance(s) !== "project"),
};

/** Description suffix telling the panel user that an environment variable is in play. */
function envNote(setting: AnySetting): string {
	if (!setting.envName || setting.envValue() === undefined) return "";
	return setting.envFallback
		? t("omp.setting.env.fallback", " Unset, it falls back to ${name}.", { name: setting.envName })
		: t("omp.setting.env.overrides", " ${name} overrides this setting while it is set.", {
				name: setting.envName,
			});
}

/**
 * Localize submenu choices at read time. Values stay verbatim — they are the
 * persisted setting value; only the displayed label/description translate.
 */
function localizeOptions(
	settingId: string,
	options: ReadonlyArray<SubmenuOption> | "runtime" | undefined,
): ReadonlyArray<SubmenuOption> | "runtime" | undefined {
	if (!options || options === "runtime") return options;
	return options.map(option => ({
		...option,
		get label() {
			return t(`omp.setting.${settingId}.option.${option.value}.label`, option.label);
		},
		get description() {
			return option.description
				? t(`omp.setting.${settingId}.option.${option.value}.description`, option.description)
				: undefined;
		},
	}));
}

/**
 * Adapt the application schema and settings store to the terminal overlay. The panel shows and
 * edits the value of the settings layers, never an environment-supplied one (so an env credential
 * is never pre-filled or written to config); descriptions note an active environment variable.
 */
export function createSettingsHost(): SettingsHost {
	const entries: SettingsDisplayEntry[] = [];
	for (const tab of SETTING_TABS) {
		for (const setting of orderedSettings()) {
			const ui = setting.ui;
			if (ui?.tab !== tab) continue;
			const note = envNote(setting);
			const warning = ui.warning;
			entries.push({
				path: setting.id,
				type: setting.type,
				defaultValue: setting.default,
				ui: {
					...ui,
					// Getters: the panel may outlive a locale change.
					get label() {
						return t(`omp.setting.${setting.id}.label`, ui.label);
					},
					get description() {
						return `${t(`omp.setting.${setting.id}.description`, ui.description)}${note}`;
					},
					...(warning
						? {
								get warning() {
									return t(`omp.setting.${setting.id}.warning`, warning);
								},
							}
						: {}),
					options: localizeOptions(setting.id, ui.options as ReadonlyArray<SubmenuOption> | "runtime" | undefined),
				},
				enumValues: setting.enumValues,
				credential: setting.isCredential,
				condition: ui.condition ? CONDITIONS[ui.condition] : undefined,
			});
		}
	}
	const resolve = (path: string): AnySetting => {
		const setting = lookup(path);
		if (!setting) throw new Error(`Unknown setting: ${path}`);
		return setting;
	};
	return {
		entries,
		get: path => lookup(path)?.layered(settings),
		set: (path, value) => resolve(path).set(settings, value),
		unset: path => resolve(path).unset(settings),
		normalizeProviderLimits: normalizeProviderMaxInFlightRequests,
		validateProviderLimits: validateProviderMaxInFlightRequests,
	};
}
