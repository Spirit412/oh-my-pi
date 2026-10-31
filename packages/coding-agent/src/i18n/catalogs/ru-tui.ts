import { ruTuiStatus } from "./ru-tui-status";
import { ruTuiComponents } from "./ru-tui-components";
import { ruTuiChat } from "./ru-tui-chat";
import { ruTuiPrompt } from "./ru-tui-prompt";
import { ruTuiSetup } from "./ru-tui-setup";
import { ruTuiApps } from "./ru-tui-apps";
import { ruTuiTools } from "./ru-tui-tools";
import { ruTuiOverlays } from "./ru-tui-overlays";
import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the TUI, composed from one module per migrated area. */
export const ruTui: TranslationCatalog = {
	...ruTuiStatus,
	...ruTuiComponents,
	...ruTuiChat,
	...ruTuiPrompt,
	...ruTuiSetup,
	...ruTuiApps,
	...ruTuiTools,
	...ruTuiOverlays,
};
