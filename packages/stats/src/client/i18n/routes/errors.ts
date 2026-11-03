import type { MessageDict } from "../index";

/**
 * Strings for the errors route: the failure stats, the error-signature table,
 * the by-model bar list, and the failure log.
 */

export const en: MessageDict = {
	"errors.title": "Errors",
	"errors.description":
		"Failed model requests in {window}, grouped by error signature. Open a failure for its full payload.",

	"errors.stat.failures": "Failures",
	"errors.stat.failures.complete": "in {window}",
	"errors.stat.failures.partial": { one: "latest {count} loaded", other: "latest {count} loaded" },
	"errors.stat.signatures": "Signatures",
	"errors.stat.signatures.title": "Distinct error messages after normalizing ids and numbers",
	"errors.stat.signatures.top": {
		one: "top: {count} failure",
		other: "top: {count} failures",
	},
	"errors.stat.models": "Affected models",
	"errors.stat.last": "Last failure",
	"errors.stat.last.noneIn": "none in {window}",

	"errors.sig.title": "Error signatures",
	"errors.sig.description": "Same message with ids and counters normalized. Select one to filter the failures below.",
	"errors.sig.empty": "No failures in {window}",
	"errors.sig.emptyHint": "Every request succeeded or was aborted.",
	"errors.sig.col.signature": "Signature",
	"errors.sig.col.models": "Models",
	"errors.sig.col.last": "Last seen",
	"errors.sig.col.count": "Failures",
	"errors.sig.more": "+{count} more",

	"errors.model.title": "By model",
	"errors.model.description": "Failures per model. Select one to filter.",
	"errors.model.empty": "No affected models",

	"errors.fail.title": "Failures",
	"errors.fail.loading": "Loading failures…",
	"errors.fail.count": "{shown} of {total} failures, newest first",
	"errors.fail.empty.range": "No failures in {window}",
	"errors.fail.empty.filter": "No failures match",
	"errors.fail.empty.hint": "Clear the search or the selected filters.",
	"errors.search.placeholder": "Message, model or project",
	"errors.footer.partial": {
		one: "Showing the latest {count} failure in {window}; older ones are not loaded.",
		other: "Showing the latest {count} failures in {window}; older ones are not loaded.",
	},
	"errors.loadMore": { one: "Load latest {count}", other: "Load latest {count}" },
	"errors.loadingMore": "Loading…",

	"errors.detail.unknown": "Unknown error",
	"errors.detail.meta": {
		one: "{count} failure · first {first} · last {last}",
		other: "{count} failures · first {first} · last {last}",
	},
	"errors.detail.openLatest": "Open latest",

	"errors.col.time": "When",
	"errors.col.model": "Model",
	"errors.col.error": "Error",
	"errors.col.project": "Project",
	"errors.col.tokens": "Tokens",
	"errors.col.cost": "Cost",
	"errors.col.cost.title": "API-equivalent estimate",
};

export const ru: MessageDict = {
	"errors.title": "Ошибки",
	"errors.description":
		"Неудачные запросы к моделям за {window}, сгруппированные по сигнатуре ошибки. Откройте сбой, чтобы увидеть полный payload.",

	"errors.stat.failures": "Сбои",
	"errors.stat.failures.complete": "за {window}",
	"errors.stat.failures.partial": {
		one: "загружен последний: {count}",
		few: "загружены последние: {count}",
		many: "загружены последние: {count}",
		other: "загружены последние: {count}",
	},
	"errors.stat.signatures": "Сигнатуры",
	"errors.stat.signatures.title": "Различные сообщения об ошибках после нормализации id и чисел",
	"errors.stat.signatures.top": {
		one: "максимум: {count} сбой",
		few: "максимум: {count} сбоя",
		many: "максимум: {count} сбоев",
		other: "максимум: {count} сбоев",
	},
	"errors.stat.models": "Затронутые модели",
	"errors.stat.last": "Последний сбой",
	"errors.stat.last.noneIn": "нет за {window}",

	"errors.sig.title": "Сигнатуры ошибок",
	"errors.sig.description": "Одно сообщение с нормализованными id и счётчиками. Выберите, чтобы отфильтровать сбои ниже.",
	"errors.sig.empty": "Нет сбоев за {window}",
	"errors.sig.emptyHint": "Все запросы завершились успешно или были прерваны.",
	"errors.sig.col.signature": "Сигнатура",
	"errors.sig.col.models": "Модели",
	"errors.sig.col.last": "Последний",
	"errors.sig.col.count": "Сбои",
	"errors.sig.more": "ещё {count}",

	"errors.model.title": "По моделям",
	"errors.model.description": "Сбои по моделям. Выберите, чтобы отфильтровать.",
	"errors.model.empty": "Нет затронутых моделей",

	"errors.fail.title": "Сбои",
	"errors.fail.loading": "Загрузка сбоев…",
	"errors.fail.count": "{shown} из {total} сбоев, сначала новые",
	"errors.fail.empty.range": "Нет сбоев за {window}",
	"errors.fail.empty.filter": "Нет подходящих сбоев",
	"errors.fail.empty.hint": "Сбросьте поиск или выбранные фильтры.",
	"errors.search.placeholder": "Сообщение, модель или проект",
	"errors.footer.partial": {
		one: "Показан последний сбой за {window}; более ранние не загружены.",
		few: "Показаны последние {count} сбоя за {window}; более ранние не загружены.",
		many: "Показаны последние {count} сбоев за {window}; более ранние не загружены.",
		other: "Показаны последние {count} сбоев за {window}; более ранние не загружены.",
	},
	"errors.loadMore": {
		one: "Загрузить последний {count}",
		few: "Загрузить последние {count}",
		many: "Загрузить последние {count}",
		other: "Загрузить последние {count}",
	},
	"errors.loadingMore": "Загрузка…",

	"errors.detail.unknown": "Неизвестная ошибка",
	"errors.detail.meta": {
		one: "{count} сбой · первый {first} · последний {last}",
		few: "{count} сбоя · первый {first} · последний {last}",
		many: "{count} сбоев · первый {first} · последний {last}",
		other: "{count} сбоев · первый {first} · последний {last}",
	},
	"errors.detail.openLatest": "Открыть последний",

	"errors.col.time": "Когда",
	"errors.col.model": "Модель",
	"errors.col.error": "Ошибка",
	"errors.col.project": "Проект",
	"errors.col.tokens": "Токены",
	"errors.col.cost": "Стоимость",
	"errors.col.cost.title": "Оценка по тарифам API",
};
