import type { MessageDict } from "../index";

/** Chart slice strings. `chart.empty` lives in the common dictionary. */
export const en: MessageDict = {
	"chart.total": "Total",
	"chart.otherSeries": { one: "Other ({count})", other: "Other ({count})" },
};

export const ru: MessageDict = {
	"chart.total": "Итого",
	"chart.otherSeries": { one: "Прочие ({count})", few: "Прочие ({count})", many: "Прочие ({count})", other: "Прочие ({count})" },
};
