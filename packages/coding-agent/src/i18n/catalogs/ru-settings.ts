import { ruSettingsAppearance } from "./ru-settings-appearance";
import { ruSettingsModel } from "./ru-settings-model";
import { ruSettingsInteraction } from "./ru-settings-interaction";
import { ruSettingsContext } from "./ru-settings-context";
import { ruSettingsMemory } from "./ru-settings-memory";
import { ruSettingsFiles } from "./ru-settings-files";
import { ruSettingsShell } from "./ru-settings-shell";
import { ruSettingsTools } from "./ru-settings-tools";
import { ruSettingsTasks } from "./ru-settings-tasks";
import { ruSettingsProviders } from "./ru-settings-providers";
import { ruSettingsChrome } from "./ru-settings-chrome";
import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the settings panel, composed from one module per tab. */
export const ruSettings: TranslationCatalog = {
	...ruSettingsChrome,
	...ruSettingsAppearance,
	...ruSettingsModel,
	...ruSettingsInteraction,
	...ruSettingsContext,
	...ruSettingsMemory,
	...ruSettingsFiles,
	...ruSettingsShell,
	...ruSettingsTools,
	...ruSettingsTasks,
	...ruSettingsProviders,
};
