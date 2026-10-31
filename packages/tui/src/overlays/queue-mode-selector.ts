import { type SelectItem, SelectList, type SgrMouseEvent } from "../index";
import { t } from "@oh-my-pi/pi-utils/i18n";
import { getSelectListTheme } from "../theme/theme";
import { OverlayPanel } from "../chrome/overlay-box";
import { routeSelectListMouseWithTopBorder } from "../chrome/select-list-mouse-routing";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node";
import { SelectListSheet } from "../native/picker";

/**
 * Component that renders a queue mode selector with borders
 */
export class QueueModeSelectorComponent extends OverlayPanel {
	#selectList: SelectList;
	#sheet: SelectListSheet;

	constructor(
		currentMode: "all" | "one-at-a-time",
		onSelect: (mode: "all" | "one-at-a-time") => void,
		onCancel: () => void,
	) {
		super(t("tui.overlays.queueMode.title", "Queue Mode"), "omp.overlay.queue-mode");

		const queueModes: SelectItem[] = [
			{
				value: "one-at-a-time",
				label: "one-at-a-time",
				description: t(
					"tui.overlays.queueMode.descriptionOneAtATime",
					"Process queued messages one by one (recommended)",
				),
			},
			{
				value: "all",
				label: "all",
				description: t("tui.overlays.queueMode.descriptionAll", "Process all queued messages at once"),
			},
		];

		// Create selector
		this.#selectList = new SelectList(queueModes, 2, getSelectListTheme());

		// Preselect current mode
		const currentIndex = queueModes.findIndex(item => item.value === currentMode);
		if (currentIndex !== -1) {
			this.#selectList.setSelectedIndex(currentIndex);
		}

		this.#selectList.onSelect = item => {
			onSelect(item.value as "all" | "one-at-a-time");
		};

		this.#selectList.onCancel = () => {
			onCancel();
		};

		this.addChild(this.#selectList);
		this.#sheet = new SelectListSheet(this.#selectList, {
			title: t("tui.overlays.queueMode.sheetTitle", "Queue mode"),
			subtitle: t("tui.overlays.queueMode.subtitle", "How messages you send while omp works are delivered"),
			icon: "list",
			noun: t("tui.overlays.queueMode.noun", "modes"),
			current: [currentMode],
			// The terminal list shows the setting's values; the sheet names them for people.
			decorate: item =>
				item.value === "one-at-a-time"
					? {
							label: t("tui.overlays.queueMode.oneAtATime", "One at a time"),
							detail: t("tui.overlays.queueMode.oneAtATimeDetail", "Each queued message gets its own turn"),
							badges: [{ text: t("tui.overlays.queueMode.recommended", "recommended") }],
						}
					: {
							label: t("tui.overlays.queueMode.allAtOnce", "All at once"),
							detail: t(
								"tui.overlays.queueMode.allAtOnceDetail",
								"Queued messages are sent together in one turn",
							),
						},
		});
	}

	override describe(cx: DescribeContext): NativeNode | null {
		return cx.supports("picker") ? this.#sheet.describe() : super.describe(cx);
	}

	/** Picker pointer events drive the list exactly as its keys do. */
	handleNativeEvent(event: NativeUiEvent): void {
		this.#sheet.handle(event);
	}

	getSelectList(): SelectList {
		return this.#selectList;
	}

	routeMouse(event: SgrMouseEvent, line: number, col: number): void {
		routeSelectListMouseWithTopBorder(this.#selectList, event, line, col);
	}
}
