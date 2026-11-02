import type { MessageDict } from "../index";

/** Frustration page strings: summary stats, judge control, per-model chart and table. */
export const en: MessageDict = {
	"frustration.subtitle": "How often your messages sound annoyed, per model version, in {window}.",

	"frustration.judge.title": "Judge classification",
	"frustration.judge.description":
		"Cached LLM verdicts replace the regex heuristics; unjudged messages fall back to regex signals.",
	"frustration.judge.run": "Classify with judge",
	"frustration.judge.title.unavailable":
		"Judging needs the omp host process: open the dashboard with omp stats and configure a judge model. Until then messages are classified by regex signals.",
	"frustration.judge.title.running": "A judge run is in progress",
	"frustration.judge.title.quote": "Quote the cost of judging every unjudged message in range",
	"frustration.judge.unavailable":
		"Judging needs the omp host process: open the dashboard with omp stats and configure a judge model. Until then messages are classified by regex signals.",
	"frustration.judge.modalTitle": "Classify with judge",
	"frustration.judge.proceed": "Proceed",
	"frustration.judge.starting": "Starting…",
	"frustration.judge.estimating": "Estimating cost…",
	"frustration.judge.allJudged":
		"Everything in this range is already judged. There is nothing left to classify.",
	"frustration.judge.quoteLabel": "Estimated cost",
	"frustration.judge.approx": "≈ {cost}",
	"frustration.judge.unjudgedMessages": "Unjudged unique messages",
	"frustration.judge.proseChars": "Prose characters",
	"frustration.judge.estimatedTokens": "Estimated input tokens",
	"frustration.judge.judgeLabel": "Judge",
	"frustration.judge.footnote":
		"Identical messages share one verdict, and verdicts are cached, so later runs only pay for new messages. Nothing is spent until you proceed.",

	"frustration.badge.running": "Running",
	"frustration.badge.done": "Last run done",
	"frustration.badge.cancelled": "Last run cancelled",
	"frustration.badge.failed": "Last run failed",
	"frustration.badge.notRun": "Not run yet",
	"frustration.badge.regexOnly": "Regex only",

	"frustration.summary.messages": "User messages",
	"frustration.summary.messages.title": "User messages with prose in range",
	"frustration.summary.coverage": "Judge coverage",
	"frustration.summary.coverage.title":
		"Messages with a cached judge verdict; the rest use regex signals",
	"frustration.summary.coverage.hint": "{judged} judged · {regex} regex",
	"frustration.summary.annoyed": "Annoyed",
	"frustration.summary.annoyed.title": "Messages annoyed at any target",
	"frustration.summary.atAssistant": "At assistant",
	"frustration.summary.atAssistant.title": "Messages annoyed at the assistant",
	"frustration.summary.angry": "Angry",
	"frustration.summary.angry.title": "Messages angry or hostile toward the assistant",
	"frustration.summary.messagesCount": { one: "{count} message", other: "{count} messages" },

	"frustration.progress.judged": "{done}/{total} judged",
	"frustration.progress.cancel": "Cancel run",
	"frustration.progress.cancelling": "Cancelling…",
	"frustration.progress.failed": { one: "{count} failed", other: "{count} failed" },
	"frustration.progress.costSoFar": "cost so far",
	"frustration.progress.elapsed": "elapsed",
	"frustration.progress.perSecond": "{rate}/s",
	"frustration.progress.inFlight": { one: "{count} in flight", other: "{count} in flight" },

	"frustration.result.idle":
		"No judge run yet. Classify the unjudged messages to replace regex estimates with verdicts.",
	"frustration.result.progress": "{done}/{total} messages",
	"frustration.result.failed": { one: ", {count} failed", other: ", {count} failed" },
	"frustration.result.withJudge": " with {name}",
	"frustration.result.inTime": " in {time}",
	"frustration.result.done": "Last run judged {parts} for {cost}.",
	"frustration.result.cancelled": "Last run cancelled after {parts}{failed}; spent {cost}.",
	"frustration.result.failedRun": "Last run failed after {parts}{failed}: {error}. Spent {cost}.",
	"frustration.result.unknownError": "unknown error",

	"frustration.models.title": "Frustration by model version",
	"frustration.models.description":
		"Share of user messages per model version. Each bar reaches the annoyed rate; the subsets aimed at the assistant stack inside it.",
	"frustration.models.empty": "No user messages in this range",
	"frustration.models.emptyHint": "Try a longer range.",
	"frustration.classes.aria": "Model class",
	"frustration.classes.all": "All",
	"frustration.classes.all.title": "Every model class",
	"frustration.filters.includeSmall": "Include < {min} messages",
	"frustration.filters.includeSmallCount": " ({count})",
	"frustration.filters.includeSmallTitle": "Models with fewer than {min} messages have noisy rates",
	"frustration.filters.hideRegex": "Hide mostly regex",
	"frustration.filters.hideRegexCount": " ({count})",
	"frustration.filters.hideRegexTitle":
		"Hide models with under {share}% judged messages (rates from regex signals)",

	"frustration.layers.angry": "Angry at assistant",
	"frustration.layers.assistant": "At assistant, not angry",
	"frustration.layers.other": "Annoyed at other targets",

	"frustration.chart.trend": "At assistant (total)",
	"frustration.chart.noFrustrated": "No frustrated messages for these models",
	"frustration.chart.tooltipAnnoyed": "Annoyed, any target",
	"frustration.chart.tooltipMeta": "{messages} messages · judged {judged} ({share})",
	"frustration.chart.tooltipRegex": " · mostly regex fallback",

	"frustration.key.trend": "At assistant trend",
	"frustration.key.hatched": "Hatched: mostly regex fallback (run the judge)",
	"frustration.key.hatchedTitle":
		"Under {share}% of these messages are judged; their rates come from regex signals",
	"frustration.key.hue": "Hue = model family",

	"frustration.table.title": "Model versions",
	"frustration.table.description":
		"Rates are shares of user messages; rows follow the chart filters.",
	"frustration.table.empty": "No model versions match the filters",
	"frustration.col.model": "Model",
	"frustration.col.ids": "Model IDs",
	"frustration.col.messages": "Messages",
	"frustration.col.judged": "Judged",
	"frustration.col.regex": "regex",
	"frustration.col.judged.title":
		"Mostly regex fallback: run the judge for accurate rates",
	"frustration.col.annoyed": "Annoyed",
	"frustration.col.atAssistant": "At assistant",
	"frustration.col.angry": "Angry",
};

export const ru: MessageDict = {
	"frustration.subtitle": "Как часто ваши сообщения звучат раздражённо, по версиям моделей, за {window}.",

	"frustration.judge.title": "Классификация судьёй",
	"frustration.judge.description":
		"Кэшированные вердикты LLM заменяют эвристики regex; неоценённые сообщения классифицируются regex-сигналами.",
	"frustration.judge.run": "Классифицировать судьёй",
	"frustration.judge.title.unavailable":
		"Для оценки нужен процесс omp: откройте дашборд через omp stats и настройте модель-судью. До этого сообщения классифицируются regex-сигналами.",
	"frustration.judge.title.running": "Идёт прогон судьи",
	"frustration.judge.title.quote": "Оценить стоимость классификации всех неоценённых сообщений в диапазоне",
	"frustration.judge.unavailable":
		"Для оценки нужен процесс omp: откройте дашборд через omp stats и настройте модель-судью. До этого сообщения классифицируются regex-сигналами.",
	"frustration.judge.modalTitle": "Классифицировать судьёй",
	"frustration.judge.proceed": "Продолжить",
	"frustration.judge.starting": "Запуск…",
	"frustration.judge.estimating": "Оценка стоимости…",
	"frustration.judge.allJudged":
		"Всё в этом диапазоне уже оценено. Классифицировать больше нечего.",
	"frustration.judge.quoteLabel": "Оценка стоимости",
	"frustration.judge.approx": "≈ {cost}",
	"frustration.judge.unjudgedMessages": "Неоценённые уникальные сообщения",
	"frustration.judge.proseChars": "Символов прозы",
	"frustration.judge.estimatedTokens": "Оценка входных токенов",
	"frustration.judge.judgeLabel": "Судья",
	"frustration.judge.footnote":
		"Одинаковые сообщения получают один вердикт, вердикты кэшируются, поэтому последующие прогоны платят только за новые сообщения. Средства не тратятся, пока вы не продолжите.",

	"frustration.badge.running": "Выполняется",
	"frustration.badge.done": "Последний прогон завершён",
	"frustration.badge.cancelled": "Последний прогон отменён",
	"frustration.badge.failed": "Последний прогон завершился ошибкой",
	"frustration.badge.notRun": "Ещё не запускался",
	"frustration.badge.regexOnly": "Только regex",

	"frustration.summary.messages": "Сообщения пользователя",
	"frustration.summary.messages.title": "Сообщения пользователя с прозой в диапазоне",
	"frustration.summary.coverage": "Охват судьи",
	"frustration.summary.coverage.title":
		"Сообщения с кэшированным вердиктом судьи; остальные оцениваются regex-сигналами",
	"frustration.summary.coverage.hint": "оценено: {judged} · regex: {regex}",
	"frustration.summary.annoyed": "Раздражённые",
	"frustration.summary.annoyed.title": "Сообщения с раздражением по любому адресату",
	"frustration.summary.atAssistant": "На ассистента",
	"frustration.summary.atAssistant.title": "Сообщения с раздражением на ассистента",
	"frustration.summary.angry": "Злые",
	"frustration.summary.angry.title": "Сообщения с злостью или враждебностью к ассистенту",
	"frustration.summary.messagesCount": { one: "{count} сообщение", few: "{count} сообщения", many: "{count} сообщений" },

	"frustration.progress.judged": "оценено {done} из {total}",
	"frustration.progress.cancel": "Отменить прогон",
	"frustration.progress.cancelling": "Отмена…",
	"frustration.progress.failed": { one: "{count} сбой", few: "{count} сбоя", many: "{count} сбоев" },
	"frustration.progress.costSoFar": "потрачено",
	"frustration.progress.elapsed": "прошло",
	"frustration.progress.perSecond": "{rate}/с",
	"frustration.progress.inFlight": { one: "{count} в обработке", few: "{count} в обработке", many: "{count} в обработке" },

	"frustration.result.idle":
		"Судья пока не запускался. Классифицируйте неоценённые сообщения, чтобы заменить оценки regex вердиктами.",
	"frustration.result.progress": "{done}/{total} сообщ.",
	"frustration.result.failed": { one: ", сбой: {count}", few: ", сбоя: {count}", many: ", сбоев: {count}" },
	"frustration.result.withJudge": " · {name}",
	"frustration.result.inTime": " за {time}",
	"frustration.result.done": "Последний прогон оценил {parts} за {cost}.",
	"frustration.result.cancelled": "Последний прогон отменён после {parts}{failed}; потрачено {cost}.",
	"frustration.result.failedRun": "Последний прогон завершился ошибкой после {parts}{failed}: {error}. Потрачено {cost}.",
	"frustration.result.unknownError": "неизвестная ошибка",

	"frustration.models.title": "Раздражение по версиям моделей",
	"frustration.models.description":
		"Доля пользовательских сообщений по версиям моделей. Каждый столбец достигает доли раздражённых; подмножества «на ассистента» сложены внутри него.",
	"frustration.models.empty": "В этом диапазоне нет сообщений пользователя",
	"frustration.models.emptyHint": "Попробуйте более длинный диапазон.",
	"frustration.classes.aria": "Класс моделей",
	"frustration.classes.all": "Все",
	"frustration.classes.all.title": "Все классы моделей",
	"frustration.filters.includeSmall": "Показывать < {min} сообщений",
	"frustration.filters.includeSmallCount": " ({count})",
	"frustration.filters.includeSmallTitle": "У моделей с менее чем {min} сообщениями показатели шумные",
	"frustration.filters.hideRegex": "Скрыть в основном regex",
	"frustration.filters.hideRegexCount": " ({count})",
	"frustration.filters.hideRegexTitle":
		"Скрывать модели, у которых оценено менее {share}% сообщений (показатели по regex-сигналам)",

	"frustration.layers.angry": "Злость на ассистента",
	"frustration.layers.assistant": "На ассистента, без злости",
	"frustration.layers.other": "Раздражение на другие цели",

	"frustration.chart.trend": "На ассистента (всего)",
	"frustration.chart.noFrustrated": "Нет раздражённых сообщений для этих моделей",
	"frustration.chart.tooltipAnnoyed": "Раздражение, любая цель",
	"frustration.chart.tooltipMeta": "{messages} сообщ. · оценено: {judged} ({share})",
	"frustration.chart.tooltipRegex": " · в основном regex",

	"frustration.key.trend": "Тренд «на ассистента»",
	"frustration.key.hatched": "Штриховка: в основном regex (запустите судью)",
	"frustration.key.hatchedTitle":
		"Менее {share}% этих сообщений оценено; их показатели получены по regex-сигналам",
	"frustration.key.hue": "Оттенок = семейство моделей",

	"frustration.table.title": "Версии моделей",
	"frustration.table.description":
		"Показатели — доли пользовательских сообщений; строки следуют фильтрам графика.",
	"frustration.table.empty": "Нет версий моделей, подходящих под фильтры",
	"frustration.col.model": "Модель",
	"frustration.col.ids": "ID моделей",
	"frustration.col.messages": "Сообщения",
	"frustration.col.judged": "Оценено",
	"frustration.col.regex": "regex",
	"frustration.col.judged.title":
		"В основном regex-оценка: запустите судью для точных показателей",
	"frustration.col.annoyed": "Раздражённые",
	"frustration.col.atAssistant": "На ассистента",
	"frustration.col.angry": "Злые",
};
