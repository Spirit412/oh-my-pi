import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the tasks settings tab. */
export const ruSettingsTasks: TranslationCatalog = {
	"omp.setting.task.isolation.enabled.label": "Allow Isolated Subagents",
	"omp.setting.task.isolation.enabled.description":
		"Разрешать изоляцию на уровне задачи через `isolated: true`; задачи без этого флага выполняются в общей рабочей копии",
	"omp.setting.isolation.backend.label": "Isolation Backend",
	"omp.setting.isolation.backend.description": "Бэкенд для изоляции субагентов и клонирования worktree",
	"omp.setting.isolation.backend.option.auto.label": "Auto",
	"omp.setting.isolation.backend.option.auto.description": "Позволить PAL выбрать лучший доступный бэкенд",
	"omp.setting.isolation.backend.option.apfs.label": "APFS",
	"omp.setting.isolation.backend.option.apfs.description": "reflink clonefile в macOS (APFS)",
	"omp.setting.isolation.backend.option.btrfs.label": "btrfs",
	"omp.setting.isolation.backend.option.btrfs.description": "снимок subvolume btrfs",
	"omp.setting.isolation.backend.option.zfs.label": "ZFS",
	"omp.setting.isolation.backend.option.zfs.description": "снимок ZFS + клонирование",
	"omp.setting.isolation.backend.option.reflink.label": "Reflink",
	"omp.setting.isolation.backend.option.reflink.description": "пофайловый reflink FICLONE в Linux",
	"omp.setting.isolation.backend.option.overlayfs.label": "Overlayfs",
	"omp.setting.isolation.backend.option.overlayfs.description": "overlay ядра Linux (или резервный fuse-overlayfs)",
	"omp.setting.isolation.backend.option.projfs.label": "ProjFS",
	"omp.setting.isolation.backend.option.projfs.description":
		"Проецируемая файловая система Windows (Projected File System)",
	"omp.setting.isolation.backend.option.block-clone.label": "Block clone",
	"omp.setting.isolation.backend.option.block-clone.description":
		"Windows FSCTL_DUPLICATE_EXTENTS_TO_FILE (NTFS/ReFS)",
	"omp.setting.isolation.backend.option.rcopy.label": "Recursive copy",
	"omp.setting.isolation.backend.option.rcopy.description":
		"git worktree, если доступен, иначе рекурсивное копирование",
	"omp.setting.worktree.clone.label": "Clone Checkout into Worktrees",
	"omp.setting.worktree.clone.description":
		"Новые worktree, создаваемые через `github pr_checkout` и `git worktree add` в bash, начинаются как копия текущей рабочей копии с копированием при записи, поэтому игнорируемые артефакты сборки (node_modules, target) переносятся; если файловая система не поддерживает клонирование, используется обычная рабочая копия",
	"omp.setting.worktree.cleanSource.label": "Clean Source Checkout on /wt",
	"omp.setting.worktree.cleanSource.description":
		"При создании worktree через `/wt` сбрасывать отслеживаемые изменения и удалять неотслеживаемые файлы из исходной рабочей копии после их переноса",
	"omp.setting.worktree.onStart.label": "Worktree on Start",
	"omp.setting.worktree.onStart.description": "Начинать ли новые интерактивные сессии в новом связанном worktree",
	"omp.setting.worktree.onStart.option.off.label": "Off",
	"omp.setting.worktree.onStart.option.off.description": "Запуск в текущей рабочей копии",
	"omp.setting.worktree.onStart.option.ask.label": "Ask",
	"omp.setting.worktree.onStart.option.ask.description": "Спрашивать при запуске сессии",
	"omp.setting.worktree.onStart.option.create.label": "Create",
	"omp.setting.worktree.onStart.option.create.description": "Всегда запускать в новом worktree в ветке `wt/*`",
	"omp.setting.worktree.onExit.label": "Worktree on Exit",
	"omp.setting.worktree.onExit.description":
		"Что делать при выходе с worktree, созданными с момента запуска omp (при старте или через `/wt`)",
	"omp.setting.worktree.onExit.option.keep.label": "Keep",
	"omp.setting.worktree.onExit.option.keep.description": "Оставлять worktree на месте",
	"omp.setting.worktree.onExit.option.ask.label": "Ask",
	"omp.setting.worktree.onExit.option.ask.description": "Спрашивать при выходе",
	"omp.setting.worktree.onExit.option.remove.label": "Remove",
	"omp.setting.worktree.onExit.option.remove.description":
		"Удалять чистые worktree; спрашивать, если есть незакоммиченные изменения или новые коммиты. Файлы из .gitignore (например, `.env`) тоже удаляются",
	"omp.setting.task.isolation.apply.label": "Apply Isolated Changes",
	"omp.setting.task.isolation.apply.description":
		"Автоматически применять успешные изменения изолированных задач к родительской рабочей копии; отключите, чтобы сохранять артефакты патча или ветки",
	"omp.setting.task.isolation.merge.label": "Isolation Merge Strategy",
	"omp.setting.task.isolation.merge.description":
		"Как интегрируются изменения изолированных задач (применение патча или слияние ветки)",
	"omp.setting.task.isolation.merge.option.patch.label": "Patch",
	"omp.setting.task.isolation.merge.option.patch.description": "Объединить диффы и применить через git apply",
	"omp.setting.task.isolation.merge.option.branch.label": "Branch",
	"omp.setting.task.isolation.merge.option.branch.description": "Коммит на задачу, слияние с --no-ff",
	"omp.setting.task.isolation.commits.label": "Isolation Commit Style",
	"omp.setting.task.isolation.commits.description":
		"Стиль сообщений коммитов для изменений во вложенных репозиториях (обычный или сгенерированный ИИ)",
	"omp.setting.task.isolation.commits.option.generic.label": "Generic",
	"omp.setting.task.isolation.commits.option.generic.description": "Статичное сообщение коммита",
	"omp.setting.task.isolation.commits.option.ai.label": "AI",
	"omp.setting.task.isolation.commits.option.ai.description": "Сообщение коммита, сгенерированное ИИ по диффу",
	"omp.setting.worktree.base.label": "Worktree Base Directory",
	"omp.setting.worktree.base.description":
		"Базовый каталог для worktree под управлением агента — здесь размещаются копии для изоляции задач, рабочие копии PR из `github` и очистка `omp worktree`. Если не задан, используется ~/.omp/wt. Путь должен быть абсолютным или относительным к ~; относительные пути игнорируются. Переменная окружения OMP_WORKTREE_DIR переопределяет это значение.",
	"omp.setting.task.eager.label": "Prefer Task Delegation",
	"omp.setting.task.eager.description": "Насколько настойчиво подталкивать к делегированию работы субагентам",
	"omp.setting.task.eager.option.default.label": "Default",
	"omp.setting.task.eager.option.default.description":
		"Использует политику выбранной модели; некоторые модели требуют явного запроса на делегирование",
	"omp.setting.task.eager.option.preferred.label": "Preferred",
	"omp.setting.task.eager.option.preferred.description": "Добавляет указания о делегировании в системный промпт",
	"omp.setting.task.eager.option.always.label": "Always",
	"omp.setting.task.eager.option.always.description":
		"Указания в промпте плюс напоминание о делегировании на первом ходу",
	"omp.setting.task.batch.label": "Batch Task Calls",
	"omp.setting.task.batch.description":
		"Переключить инструмент task в пакетный режим: один вызов содержит { context, tasks[] } — по одному субагенту на элемент, с необязательным агентом для каждого элемента (по умолчанию агент из политики порождения сессии), изоляцией для каждого элемента и обязательным общим контекстом, добавляемым в начало каждого задания. При async.enabled=true каждый запуск выполняется как независимый фоновый агент с обычным жизненным циклом idle/parked; иначе вызов блокируется до получения объединённых результатов. Отключите, чтобы вернуть плоскую схему с одним запуском.",
	"omp.setting.task.file.label": "Task Instructions from Files",
	"omp.setting.task.file.description":
		"Разрешить инструменту task читать инструкции субагента из файла (taskFile), записывая его путь и SHA-256.",
	"omp.setting.task.structured.label": "Structured Task Results",
	"omp.setting.task.structured.description":
		"Открыть outputSchema/schemaMode в инструменте task и возвращать результаты субагентов через инструмент yield с проверкой по выходным схемам вызывающего кода или агента. Выкл.: у субагентов task нет инструмента yield, и они возвращают финальное сообщение как обычный текст, кроме агентов, в определении которых указано structured: true. Запуски agent()/workpool в eval всегда сохраняют структурированные результаты.",
	"omp.setting.task.speculativeLaunch.label": "Speculative Task Launch",
	"omp.setting.task.speculativeLaunch.description":
		"Запускать каждого пакетного субагента сразу после завершения потоковой передачи его элемента tasks[], не дожидаясь всего вызова task. Запущенные агенты прерываются, если завершённый вызов не проходит проверку, блокируется или его аргументы меняются. Требует авторазрешения для task и отсутствия обработчиков жизненного цикла инструментов в расширениях.",
	"omp.setting.task.enableEffort.label": "Per-Task Effort",
	"omp.setting.task.enableEffort.description":
		"Открыть необязательный параметр effort при запуске task, позволяя вызывающему коду переопределять уровень рассуждений каждого субагента",
	"omp.setting.task.maxConcurrency.label": "Max Concurrent Tasks",
	"omp.setting.task.maxConcurrency.description": "Максимальное число одновременно работающих субагентов",
	"omp.setting.task.maxConcurrency.option.0.label": "Unlimited",
	"omp.setting.task.maxConcurrency.option.1.label": "1 task",
	"omp.setting.task.maxConcurrency.option.2.label": "2 tasks",
	"omp.setting.task.maxConcurrency.option.4.label": "4 tasks",
	"omp.setting.task.maxConcurrency.option.8.label": "8 tasks",
	"omp.setting.task.maxConcurrency.option.16.label": "16 tasks",
	"omp.setting.task.maxConcurrency.option.32.label": "32 tasks",
	"omp.setting.task.maxConcurrency.option.64.label": "64 tasks",
	"omp.setting.task.enableLsp.label": "LSP in Subagents",
	"omp.setting.task.enableLsp.description":
		"Разрешать субагентам, запущенным через инструмент task, использовать инструмент lsp. По умолчанию выключено, чтобы субагенты оставались дешёвыми; включайте, когда делегирование с поддержкой LSP стоит дополнительных токенов.",
	"omp.setting.task.maxRecursionDepth.label": "Max Task Recursion",
	"omp.setting.task.maxRecursionDepth.description":
		"На сколько уровней вглубь субагенты могут порождать собственных субагентов",
	"omp.setting.task.maxRecursionDepth.option.-1.label": "Unlimited",
	"omp.setting.task.maxRecursionDepth.option.0.label": "None",
	"omp.setting.task.maxRecursionDepth.option.1.label": "Single",
	"omp.setting.task.maxRecursionDepth.option.2.label": "Double",
	"omp.setting.task.maxRecursionDepth.option.3.label": "Triple",
	"omp.setting.task.maxRuntimeMs.label": "Max Subagent Runtime",
	"omp.setting.task.maxRuntimeMs.description":
		"Жёсткий лимит реального времени на субагента (мс). 0 отключает его. Дополнительная защита от зависаний потока на стороне провайдера, которые проходят мимо сторожевого таймера слоя инференса; вызывает обычное прерывание субагента с причиной «timed out».",
	"omp.setting.task.maxRuntimeMs.option.0.label": "Unlimited",
	"omp.setting.task.maxRuntimeMs.option.0.description": "По умолчанию",
	"omp.setting.task.maxRuntimeMs.option.300000.label": "5 minutes",
	"omp.setting.task.maxRuntimeMs.option.900000.label": "15 minutes",
	"omp.setting.task.maxRuntimeMs.option.1800000.label": "30 minutes",
	"omp.setting.task.maxRuntimeMs.option.3600000.label": "1 hour",
	"omp.setting.task.completionProbe.label": "Subagent Completion Probe",
	"omp.setting.task.completionProbe.description":
		"Спрашивать работающего субагента через кешированный побочный запрос вроде /btw, насколько выполнена его задача: через 2, 5, 10 и 30 минут, затем ежечасно. Оценка показывается рядом с субагентом в представлениях wait и task. Опрашиваются только субагенты, запущенные главным агентом интерактивной сессии; запуски print, RPC, ACP и SDK никогда не опрашиваются.",
	"omp.setting.task.agentIdleTtlMs.label": "Agent Idle TTL",
	"omp.setting.task.agentIdleTtlMs.description":
		"Сколько времени простаивающий субагент остаётся в памяти, прежде чем будет выгружен на диск (мс). Выгруженные агенты автоматически возрождаются при отправке сообщения или возобновлении. 0 сохраняет простаивающих агентов в памяти до выхода.",
	"omp.setting.task.softRequestBudget.label": "Soft Subagent Request Budget",
	"omp.setting.task.softRequestBudget.description":
		"Мягкий бюджет запросов на субагента (запросы ассистента за запуск). При его превышении внедряется уведомление о необходимости завершать работу (см. task.softRequestBudgetNotice); при 1.5x бюджета запуск принудительно останавливается, и агент должен вернуть частичные находки. 0 отключает защиту. Встроенные агенты scout/sonic ограничены более низким встроенным бюджетом, поэтому значение ниже этого предела всё равно применяется к ним. Запись task.agentSoftRequestBudget заменяет этот бюджет для указанного в ней агента.",
	"omp.setting.task.softRequestBudget.option.0.label": "Disabled",
	"omp.setting.task.softRequestBudget.option.90.label": "90 requests",
	"omp.setting.task.softRequestBudget.option.150.label": "150 requests",
	"omp.setting.task.softRequestBudget.option.200.label": "200 requests",
	"omp.setting.task.softRequestBudget.option.200.description": "По умолчанию",
	"omp.setting.task.softRequestBudgetNotice.label": "Soft Request Budget Notice",
	"omp.setting.task.softRequestBudgetNotice.description":
		"Внедрять одно направляющее уведомление, когда субагент превышает мягкий бюджет запросов, с просьбой завершить работу до принудительной остановки на 1.5x.",
	"omp.setting.task.maxEffort.label": "Maximum Per-Spawn Effort",
	"omp.setting.task.maxEffort.description":
		"Максимальное усилие рассуждений, допустимое для подсказки effort при запуске в инструменте task. Меньшие значения не позволяют вызывающему коду поднимать субагентов выше этого потолка; значение по умолчанию сохраняет полный диапазон модели.",
	"omp.setting.task.maxEffort.option.minimal.label": "min",
	"omp.setting.task.maxEffort.option.minimal.description": "Очень краткие рассуждения (~1k токенов)",
	"omp.setting.task.maxEffort.option.low.label": "low",
	"omp.setting.task.maxEffort.option.low.description": "Лёгкие рассуждения (~2k токенов)",
	"omp.setting.task.maxEffort.option.medium.label": "medium",
	"omp.setting.task.maxEffort.option.medium.description": "Умеренные рассуждения (~8k токенов)",
	"omp.setting.task.maxEffort.option.high.label": "high",
	"omp.setting.task.maxEffort.option.high.description": "Глубокие рассуждения (~16k токенов)",
	"omp.setting.task.maxEffort.option.xhigh.label": "xhigh",
	"omp.setting.task.maxEffort.option.xhigh.description": "Расширенные рассуждения (~32k токенов)",
	"omp.setting.task.maxEffort.option.max.label": "max",
	"omp.setting.task.maxEffort.option.max.description": "Максимальные рассуждения, поддерживаемые моделью",
	"omp.setting.task.prewalk.label": "Generic Task Prewalk",
	"omp.setting.task.prewalk.description":
		"Включать prewalk для встроенного универсального субагента `task`: он стартует на своей решённой модели, планирует и начинает реализацию, затем передаёт работу роли 'smol' при первом редактировании/записи. Переопределения для отдельных агентов (task.agentPrewalk, настраивается в панели /agents) и frontmatter `prewalk` пользовательских агентов действуют независимо от этого переключателя.",
	"omp.setting.plan.enabled.label": "Plan Mode",
	"omp.setting.plan.enabled.description":
		"Включать режим планирования для исследования только для чтения и планирования перед выполнением",
	"omp.setting.plan.defaultOnStartup.label": "Start in Plan Mode",
	"omp.setting.plan.defaultOnStartup.description":
		"Автоматически входить в режим планирования в начале каждой новой сессии",
	"omp.setting.plan.autosave.label": "Autosave Plans",
	"omp.setting.plan.autosave.description":
		"Автоматически сохранять утверждённые планы на диск при завершении режима планирования",
	"omp.setting.plan.autosaveDir.label": "Autosave Directory",
	"omp.setting.plan.autosaveDir.description":
		"Каталог для автосохраняемых планов. Поддерживает пути с ~, абсолютные и относительные к cwd. Пустое значение использует <project>/.omp/plans/.",
	"omp.setting.goal.enabled.label": "Goal Mode",
	"omp.setting.goal.enabled.description": "Включать режим цели для сессии и скрытый инструмент goal",
	"omp.setting.goal.statusInFooter.label": "Goal Status in Footer",
	"omp.setting.goal.statusInFooter.description":
		"Показывать бюджет токенов рядом с индикатором цели в строке состояния",
	"omp.setting.goal.continuationModes.label": "Goal Continuation Modes",
	"omp.setting.goal.continuationModes.description":
		"Режимы запуска, в которых активные цели могут автоматически продолжаться между ходами («interactive», «rpc»)",
	"omp.setting.title.generator.label": "Title Generator",
	"omp.setting.title.generator.description": "Что задаёт имя сессии без заголовка по сообщениям пользователя",
	"omp.setting.title.generator.option.fork.label": "Fork",
	"omp.setting.title.generator.option.fork.description":
		"Побочный ход ответа на модели сессии: читает её кеш промпта, добавляет значок карточки (по умолчанию)",
	"omp.setting.title.generator.option.tiny.label": "Tiny",
	"omp.setting.title.generator.option.tiny.description":
		"Только роль модели заголовков; простые заголовки без карточки",
	"omp.setting.title.refreshOnReplan.label": "Refresh Title on Replan",
	"omp.setting.title.refreshOnReplan.description":
		"Обновлять сгенерированные заголовки сессий после перепланирования при инициализации todo, если заголовок не задан пользователем",
	"omp.setting.title.refreshAfterPrompts.label": "Refresh Title After Prompts",
	"omp.setting.title.refreshAfterPrompts.description":
		"Каждые столько промптов оператора спрашивать оценочную модель, соответствует ли сгенерированный заголовок сессии беседе, и перегенерировать его, если нет",
	"omp.setting.title.refreshAfterPrompts.option.0.label": "Off",
	"omp.setting.title.refreshAfterPrompts.option.0.description": "По умолчанию",
	"omp.setting.title.refreshAfterPrompts.option.1.label": "Every prompt",
	"omp.setting.title.refreshAfterPrompts.option.3.label": "Every 3 prompts",
	"omp.setting.title.refreshAfterPrompts.option.5.label": "Every 5 prompts",
	"omp.setting.title.refreshAfterPrompts.option.10.label": "Every 10 prompts",
	"omp.setting.skills.enableSkillCommands.label": "Skill Commands",
	"omp.setting.skills.enableSkillCommands.description": "Регистрировать навыки как команды /skill:name",
	"omp.setting.commands.enableClaudeUser.label": "Claude User Commands",
	"omp.setting.commands.enableClaudeUser.description": "Загружать команды из ~/.claude/commands/",
	"omp.setting.commands.enableClaudeProject.label": "Claude Project Commands",
	"omp.setting.commands.enableClaudeProject.description": "Загружать команды из .claude/commands/",
	"omp.setting.commands.enableOpencodeUser.label": "OpenCode User Commands",
	"omp.setting.commands.enableOpencodeUser.description": "Загружать команды из ~/.config/opencode/commands/",
	"omp.setting.commands.enableOpencodeProject.label": "OpenCode Project Commands",
	"omp.setting.commands.enableOpencodeProject.description": "Загружать команды из .opencode/commands/",
};
