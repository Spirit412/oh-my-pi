import { type SelectItem, SelectList, type SgrMouseEvent } from "../index";
import { t } from "@oh-my-pi/pi-utils/i18n";
import { getSelectListTheme } from "../theme/theme";
import { OverlayPanel } from "../chrome/overlay-box";
import { routeSelectListMouseWithTopBorder } from "../chrome/select-list-mouse-routing";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node";
import { SelectListSheet } from "../native/picker";

/** One selectable UI localization: a locale tag, `auto`, or `en`. */
export interface LocalizationChoice {
	value: string;
	label: string;
	description?: string;
}

/**
 * Component that renders a UI localization (language) selector.
 * Choices must be resolved by the caller so the overlay stays free of
 * catalog/registry knowledge.
 */
export class LocalizationSelectorComponent extends OverlayPanel {
	#selectList: SelectList;
	#sheet: SelectListSheet;

	constructor(
		choices: readonly LocalizationChoice[],
		current: string,
		onSelect: (value: string) => void,
		onCancel: () => void,
	) {
		super(t("tui.overlays.localization.title", "Localization"), "omp.overlay.localization");

		const items: SelectItem[] = choices.map(choice => ({
			value: choice.value,
			label: choice.label,
			description: choice.description,
		}));

		this.#selectList = new SelectList(items, 10, getSelectListTheme());

		const currentIndex = items.findIndex(item => item.value === current);
		if (currentIndex !== -1) {
			this.#selectList.setSelectedIndex(currentIndex);
		}

		this.#selectList.onSelect = item => {
			onSelect(item.value);
		};

		this.#selectList.onCancel = () => {
			onCancel();
		};

		this.addChild(this.#selectList);
		this.#sheet = new SelectListSheet(this.#selectList, {
			title: t("tui.overlays.localization.title", "Localization"),
			icon: "globe",
			noun: t("tui.overlays.localization.noun", "localizations"),
			current: [current],
			searchable: true,
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
