import type { MessageDict } from "../index";

/** Gain page strings: snapcompact savings stats, daily chart, per-source table. */
export const en: MessageDict = {
	"gain.description": "Tokens snapcompact kept out of context in {range}.",
	"gain.descriptionProject": "Tokens snapcompact kept out of context for {name} in {range}.",

	"gain.project.aria": "Project",
	"gain.project.all": "All projects",

	"gain.empty": "No savings recorded in {range}",
	"gain.emptyProject": "No savings recorded for {name} in {range}",
	"gain.empty.hintFirst": "Savings appear here once snapcompact compacts tool output.",
	"gain.empty.hintLonger": "Try a longer range.",

	"gain.stat.savedTokens": "Saved tokens",
	"gain.stat.savedBytes": "Saved bytes",
	"gain.stat.reduction": "Reduction",
	"gain.stat.reduction.title": "Saved bytes ÷ original bytes, when the original size is known",
	"gain.stat.reduction.unknown": "original size not recorded",
	"gain.stat.hits": "Hits",
	"gain.stat.perHit": "Saved per hit",
	"gain.stat.perHit.hint": "tokens",

	"gain.chart.daily": "Saved per day",
	"gain.chart.cumulative": "Cumulative",
	"gain.chart.title": "Savings over time",
	"gain.chart.description": "Tokens saved per UTC day, with the running total",

	"gain.sources.title": "By source",
	"gain.sources.description": "Savings per subsystem",

	"gain.col.source": "Source",
	"gain.col.tokens": "Saved tokens",
	"gain.col.share": "Share",
	"gain.col.bytes": "Saved bytes",
	"gain.col.hits": "Hits",
	"gain.col.reduction": "Reduction",
};

export const ru: MessageDict = {
	"gain.description": "Токены, которые snapcompact удержал из контекста, за {range}.",
	"gain.descriptionProject": "Токены, которые snapcompact удержал из контекста для {name} за {range}.",

	"gain.project.aria": "Проект",
	"gain.project.all": "Все проекты",

	"gain.empty": "За {range} сбережений не записано",
	"gain.emptyProject": "Для {name} за {range} сбережений не записано",
	"gain.empty.hintFirst": "Сбережения появятся здесь, когда snapcompact сожмёт вывод инструментов.",
	"gain.empty.hintLonger": "Попробуйте более длинный диапазон.",

	"gain.stat.savedTokens": "Сэкономлено токенов",
	"gain.stat.savedBytes": "Сэкономлено байт",
	"gain.stat.reduction": "Сокращение",
	"gain.stat.reduction.title": "Сэкономлено байт ÷ исходные байты, когда исходный размер известен",
	"gain.stat.reduction.unknown": "исходный размер не записан",
	"gain.stat.hits": "Срабатывания",
	"gain.stat.perHit": "Сэкономлено за срабатывание",
	"gain.stat.perHit.hint": "токенов",

	"gain.chart.daily": "Сэкономлено в день",
	"gain.chart.cumulative": "Суммарно",
	"gain.chart.title": "Сбережения за период",
	"gain.chart.description": "Сэкономленные токены по дням UTC с накопленным итогом",

	"gain.sources.title": "По источнику",
	"gain.sources.description": "Сбережения по подсистемам",

	"gain.col.source": "Источник",
	"gain.col.tokens": "Сэкономлено токенов",
	"gain.col.share": "Доля",
	"gain.col.bytes": "Сэкономлено байт",
	"gain.col.hits": "Срабатывания",
	"gain.col.reduction": "Сокращение",
};
