import type { MessageDict } from "../index";

/** Costs page strings: estimate stats, daily chart, component breakdown, per-model table. */
export const en: MessageDict = {
	"costs.subtitle":
		"What {window} of usage would cost at public API rates. Subscription usage without a public price is counted as unpriced, not free.",

	"costs.empty.title": "No usage in this range",
	"costs.empty.hint": "Pick a wider range in the top bar.",

	"costs.split.model": "By model",
	"costs.split.component": "By component",
	"costs.split.aria": "Split by",

	"costs.daily.title": "Daily estimate",
	"costs.daily.desc.model": "Per UTC day, stacked by model",
	"costs.daily.desc.component": "Per UTC day, stacked by billing component",
	"costs.chart.empty": "No priced usage in this range",
	"costs.tooltip.unpriced": "Unpriced requests",

	"costs.went.title": "Where it went",
	"costs.went.desc": "Estimate by billing component",

	"costs.table.title": "By model",
	"costs.table.desc": "Estimate per model with its input, output and cache split",

	"costs.component.input": "Input",
	"costs.component.output": "Output",
	"costs.component.cacheRead": "Cache read",
	"costs.component.cacheWrite": "Cache write",

	"costs.stat.estimate": "API-equivalent estimate",
	"costs.stat.estimate.title": "What this usage would cost at public API rates",
	"costs.stat.estimate.requests": { one: "{count} requests", other: "{count} requests" },
	"costs.stat.avgPerDay": "Average per day",
	"costs.stat.avgPerDay.title": "Estimate ÷ days with any usage",
	"costs.stat.avgPerDay.days": { one: "over {count} active day", other: "over {count} active days" },
	"costs.stat.topModel": "Top model",
	"costs.stat.topModel.empty": "Nothing priced yet",
	"costs.stat.topModel.hint": "{cost} · {share} of estimate",
	"costs.stat.perRequest": "Per priced request",
	"costs.stat.perRequest.title": "Estimate ÷ requests that have a public price",
	"costs.stat.perRequest.priced": { one: "{count} priced", other: "{count} priced" },
	"costs.stat.unpriced": "Unpriced requests",
	"costs.stat.unpriced.title": "Subscription usage with no public-equivalent price; excluded from the estimate",
	"costs.hint.excluded": "excluded from the estimate",
	"costs.hint.allPriced": "all usage priced",

	"costs.breakdown.total": "Total",
	"costs.breakdown.unpricedNote": {
		one: "{count} unpriced subscription request is not included.",
		other: "{count} unpriced subscription requests are not included.",
	},

	"costs.col.model": "Model",
	"costs.col.requests": "Requests",
	"costs.col.estimate": "Estimate",
	"costs.col.estimate.title": "API-equivalent estimate at public rates",
	"costs.col.share": "Share",
	"costs.col.split": "Split",
	"costs.col.split.title": "Input · output · cache read · cache write",
	"costs.col.perRequest": "Per request",
	"costs.col.perRequest.title": "Estimate ÷ priced requests",
	"costs.col.unpriced": "Unpriced",
	"costs.col.unpriced.title": "Requests with no public-equivalent price",

	/** Per-request cost bound below the 4-digit precision. */
	"costs.unitCost.bound": "<$0.0001",
};

export const ru: MessageDict = {
	"costs.subtitle":
		"Сколько бы стоило использование {window} по публичным API-тарифам. Использование по подписке без публичной цены учитывается как не имеющее цены, а не как бесплатное.",

	"costs.empty.title": "Нет использования за этот период",
	"costs.empty.hint": "Выберите более широкий диапазон в верхней панели.",

	"costs.split.model": "По моделям",
	"costs.split.component": "По компонентам",
	"costs.split.aria": "Разбивка",

	"costs.daily.title": "Суточная оценка",
	"costs.daily.desc.model": "По дням UTC с разбивкой по моделям",
	"costs.daily.desc.component": "По дням UTC с разбивкой по компонентам оплаты",
	"costs.chart.empty": "Нет оценённого использования за этот период",
	"costs.tooltip.unpriced": "Запросы без цены",

	"costs.went.title": "Куда ушло",
	"costs.went.desc": "Оценка по компонентам оплаты",

	"costs.table.title": "По моделям",
	"costs.table.desc": "Оценка по каждой модели с разбивкой на вход, вывод и кэш",

	"costs.component.input": "Вход",
	"costs.component.output": "Вывод",
	"costs.component.cacheRead": "Чтение кэша",
	"costs.component.cacheWrite": "Запись в кэш",

	"costs.stat.estimate": "Оценка в API-эквиваленте",
	"costs.stat.estimate.title": "Стоимость этого использования по публичным API-тарифам",
	"costs.stat.estimate.requests": { one: "запросов: {count}", few: "запросов: {count}", many: "запросов: {count}", other: "запросов: {count}" },
	"costs.stat.avgPerDay": "В среднем за день",
	"costs.stat.avgPerDay.title": "Оценка ÷ дни с использованием",
	"costs.stat.avgPerDay.days": {
		one: "за {count} активный день",
		few: "за {count} активных дня",
		many: "за {count} активных дней",
		other: "за {count} активных дней",
	},
	"costs.stat.topModel": "Топ-модель",
	"costs.stat.topModel.empty": "Пока нет оценённых",
	"costs.stat.topModel.hint": "{cost} · {share} оценки",
	"costs.stat.perRequest": "На запрос с ценой",
	"costs.stat.perRequest.title": "Оценка ÷ запросы с публичной ценой",
	"costs.stat.perRequest.priced": { one: "с ценой: {count}", few: "с ценой: {count}", many: "с ценой: {count}", other: "с ценой: {count}" },
	"costs.stat.unpriced": "Запросы без цены",
	"costs.stat.unpriced.title": "Использование по подписке без публичной цены; исключено из оценки",
	"costs.hint.excluded": "исключено из оценки",
	"costs.hint.allPriced": "всё использование оценено",

	"costs.breakdown.total": "Итого",
	"costs.breakdown.unpricedNote": {
		one: "{count} запрос по подписке без цены не учтён.",
		few: "{count} запроса по подписке без цены не учтены.",
		many: "{count} запросов по подписке без цены не учтены.",
		other: "{count} запросов по подписке без цены не учтены.",
	},

	"costs.col.model": "Модель",
	"costs.col.requests": "Запросы",
	"costs.col.estimate": "Оценка",
	"costs.col.estimate.title": "Оценка в API-эквиваленте по публичным тарифам",
	"costs.col.share": "Доля",
	"costs.col.split": "Разбивка",
	"costs.col.split.title": "Вход · вывод · чтение кэша · запись в кэш",
	"costs.col.perRequest": "На запрос",
	"costs.col.perRequest.title": "Оценка ÷ запросы с ценой",
	"costs.col.unpriced": "Без цены",
	"costs.col.unpriced.title": "Запросы без публичной цены",

	"costs.unitCost.bound": "<$0,0001",
};
