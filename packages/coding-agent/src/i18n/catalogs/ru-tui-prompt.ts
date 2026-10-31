import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the TUI prompt surface. */
export const ruTuiPrompt: TranslationCatalog = {
	"tui.prompt.actions.copyCurrentLine": "Скопировать текущую строку",
	"tui.prompt.actions.copyWholePrompt": "Скопировать весь промпт",
	"tui.prompt.actions.currentMessage": "Текущее сообщение",
	"tui.prompt.actions.lineEnd": "Переместить курсор в конец строки",
	"tui.prompt.actions.lineStart": "Переместить курсор в начало строки",
	"tui.prompt.actions.messageEnd": "Переместить курсор в конец сообщения",
	"tui.prompt.actions.messageStart": "Переместить курсор в начало сообщения",
	"tui.prompt.actions.undo": "Отменить",
	"tui.prompt.chips.chars": "{count} симв.",
	"tui.prompt.chips.lines": "+{count} стр.",
	"tui.prompt.composer.backToMain": "Назад в основную сессию  {key}",
	"tui.prompt.composer.cancelDictation": "Отменить диктовку",
	"tui.prompt.composer.finishDictation": "Завершите диктовку перед отправкой",
	"tui.prompt.composer.generationRate": "Скорость генерации",
	"tui.prompt.composer.mainSession": "основная",
	"tui.prompt.composer.messageAgent": "Сообщение для {agent}",
	"tui.prompt.composer.modeExcluded": "{runs} · не отправляется модели",
	"tui.prompt.composer.notSentToModel": "Не отправляется модели",
	"tui.prompt.composer.placeholder": "Что готовим?",
	"tui.prompt.composer.queueing": "В очереди {icon}",
	"tui.prompt.composer.recordingStop": "Запись · Стоп",
	"tui.prompt.composer.runsInPython": "Выполняется в Python",
	"tui.prompt.composer.runsInShell": "Выполняется в вашей оболочке",
	"tui.prompt.composer.sendWithKey": "Отправить  {key}",
	"tui.prompt.composer.startDictation": "Начать диктовку",
	"tui.prompt.composer.starting": "Запуск…",
	"tui.prompt.composer.stop": "Остановить",
	"tui.prompt.composer.stopRecording": "Остановить запись и расшифровать",
	"tui.prompt.composer.stopWithKey": "Остановить  {key}",
	"tui.prompt.composer.switchModel": "Сменить модель",
	"tui.prompt.composer.switchModelWithKey": "Сменить модель  {key}",
	"tui.prompt.composer.thinkingEffort": "Усилия рассуждения{hint}",
	"tui.prompt.composer.thinkingEffortLevel": "Усилия рассуждения: {level}{hint}",
	"tui.prompt.composer.transcribing": "Расшифровка…",
	"tui.prompt.composer.transcribingDictation": "Расшифровка диктовки",
	"tui.prompt.composer.viewCrumb": "Открыть {id}",
	"tui.prompt.composer.viewing": "Просмотр",
	"tui.prompt.composer.viewingSubagent": "Просмотр субагента {agent}: отправленное уйдёт ему",
	"tui.prompt.githubRef.issue": "Задача GitHub",
	"tui.prompt.githubRef.issueBadge": "Задача",
	"tui.prompt.githubRef.pullRequest": "Pull request на GitHub",
	"tui.prompt.githubRef.pullRequestBadge": "PR",
	"tui.prompt.hints.runningAgents": "посмотреть запущенных агентов: {count}",
	"tui.prompt.hints.thinkingEffort": "чтобы сменить уровень рассуждений",
	"tui.prompt.queue.count": "{count} в очереди",
	"tui.prompt.queue.countTitle": "Сообщений в очереди: {count}",
	"tui.prompt.queue.edit": "Изменить",
	"tui.prompt.queue.editTooltip": "Изменить  {key}",
	"tui.prompt.queue.toEdit": "для редактирования",
	"tui.prompt.tools.headerDescription": "Описание",
	"tui.prompt.tools.headerTool": "Инструмент",
	"tui.prompt.tools.noDescription": "Описание не предоставлено.",
	"tui.prompt.tools.none": "Агенту сейчас не видно ни одного инструмента.",
	"tui.prompt.usage.remaining": "осталось {amount}",
	"tui.prompt.usage.used": "использовано {amount}",
	"tui.prompt.welcome.nerdfontNag": "Пожалуйста, используйте nerdfont 😭.",
	"tui.prompt.welcome.newBadge": "Новое",
	"tui.prompt.welcome.newTag": "НОВОЕ!",
	"tui.prompt.welcome.tip1": "Устали печатать \"keep going\"? Просто отправьте '.'",
	"tui.prompt.welcome.tip10": "Попробуйте изоляцию задач, чтобы создавать CoW-worktree",
	"tui.prompt.welcome.tip11":
		"Нужен дешёвый вложенный вызов модели? Используйте `completion(x...)`. Большая пачка задач? Попросите clanker применить его!",
	"tui.prompt.welcome.tip12": "Код-спагетти? Попробуйте пожаловаться через /omfg",
	"tui.prompt.welcome.tip13":
		"Знаете ли вы? Каждое разделение kitty/tmux/cmux/zellij/wezterm хранит свою сессию — `omp -c` возобновляет нужную",
	"tui.prompt.welcome.tip14":
		"Добавьте слово `ultrathink` в сообщение для более сложных многошаговых рассуждений — оно засветится радугой при вводе",
	"tui.prompt.welcome.tip15":
		"Скажите `orchestrate` в сообщении, чтобы вести многофазную задачу параллельными субагентами — оно засветится при вводе",
	"tui.prompt.welcome.tip16":
		"Скажите `workflowz` в сообщении, чтобы вести задачу параллельными субагентами в eval — оно засветится при вводе",
	"tui.prompt.welcome.tip17":
		"Масса данных для классификации или триажа? Скажите `jevify` в сообщении — `judge()` ядра eval обработает пачку, и вы прочитаете только отмеченное — оно засветится при вводе",
	"tui.prompt.welcome.tip18":
		"Войдите в несколько аккаунтов одного провайдера — снова `/login` — и omp автоматически распределит нагрузку между ними",
	"tui.prompt.welcome.tip19":
		"Запустите `omp auth-broker serve` один раз, и каждая машина будет получать живые токены по сети — ключи обновления никогда не покидают хост; `omp auth-gateway` выставляет его как drop-in прокси, доступный любому OpenAI-совместимому клиенту",
	"tui.prompt.welcome.tip2":
		"Введите `#` в любом месте промпта для быстрых действий — скопировать строку или весь промпт, отменить, переместить курсор",
	"tui.prompt.welcome.tip20":
		"Нажмите {key:alt+p} (или /switch), чтобы сменить провайдера, и {key:ctrl+p}, чтобы переключать ролевые модели smol -> slow -> etc",
	"tui.prompt.welcome.tip21":
		"Нажмите {key:ctrl+r}, чтобы искать по истории промптов и переиспользовать прошлое сообщение",
	"tui.prompt.welcome.tip22":
		"`/force read` привязывает следующий ход к конкретному инструменту, когда модель упорно тянется не к тому",
	"tui.prompt.welcome.tip23":
		"`/copy code` копирует последний блок кода в буфер обмена — `/copy cmd` копирует последнюю команду shell/python",
	"tui.prompt.welcome.tip24":
		"`/shake` вырывает тяжёлые результаты инструментов из контекста, чтобы вернуть токены без полного /compact — `/shake images` удаляет только изображения",
	"tui.prompt.welcome.tip25":
		"Работайте в паре вживую: `/collab` делится вашей сессией через сквозной зашифрованный relay-линк — коллега запускает `/join <link>`, чтобы смотреть поток вызовов инструментов и давать промпты агенту из своего omp",
	"tui.prompt.welcome.tip26":
		"Нажмите {tap:left}, чтобы зайти в работающего или завершённого агента и изучить его вызовы инструментов и транскрипт",
	"tui.prompt.welcome.tip27":
		"Уперлись в лимит Codex? `/usage reset` тратит сохранённый кредит сброса, чтобы сразу восстановить квоту",
	"tui.prompt.welcome.tip28":
		"Нет нативного tool_calling? Провайдер инференса плохо их парсит? `PI_DIALECT=glm|kimi|anthropic…` скрутит его локально за них!",
	"tui.prompt.welcome.tip29":
		"Включите `/advisor`, чтобы подключить вторую модель, которая проверяет каждый ход и тихо вставляет советы",
	"tui.prompt.welcome.tip3": "Введите `/` в начале промпта, чтобы просмотреть все команды",
	"tui.prompt.welcome.tip30": "Попробуйте начать промпт с -> и написать список (1. Сделать X, 2. Сделать Y)",
	"tui.prompt.welcome.tip31": "Нажмите {key:shift+tab}, чтобы переключать уровни усилий рассуждения",
	"tui.prompt.welcome.tip32": "omp умеет перенастраивать и расширять себя — задавайте любые вопросы!",
	"tui.prompt.welcome.tip33":
		"Копятся ошибки линтера/типов? `omp cleanse` (или /cleanse прямо здесь) ищет диагностику проекта и исправляет её параллельными субагентами — {key:escape} отменяет",
	"tui.prompt.welcome.tip34": "Псс, у omp есть естественная среда обитания 🐦 [tern](https://scl.so/tern)",
	"tui.prompt.welcome.tip4":
		"Начните промпт с `!`, чтобы выполнить его как bash — `!!` выполняет без добавления вывода в контекст",
	"tui.prompt.welcome.tip5":
		"Начните промпт с `$ `, чтобы выполнить Python — `$$ ` выполняет без добавления вывода в контекст",
	"tui.prompt.welcome.tip6": "Можно /btw, чтобы задать вопрос в сторону",
	"tui.prompt.welcome.tip7": "Используйте /tan, чтобы ответвить текущий разговор в фонового агента",
	"tui.prompt.welcome.tip8":
		"С настройками клавиш по умолчанию {key:ctrl+d} удаляет символ под курсором вместо выхода из черновика — вашу клавишу выхода смотрите в /hotkeys",
	"tui.prompt.welcome.tip9":
		"Узнайте, над какой моделью вы эмоционально издеваетесь чаще всего, с помощью `omp stats`",
	"tui.prompt.welcome.tipLabel": "Совет: ",
};
