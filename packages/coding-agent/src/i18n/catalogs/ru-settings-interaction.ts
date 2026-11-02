import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the interaction settings tab. */
export const ruSettingsInteraction: TranslationCatalog = {
	"omp.setting.autoResume.label": "Auto Resume",
	"omp.setting.autoResume.description":
		"Автоматически продолжать последнюю сессию в текущем каталоге. Если её модель нельзя восстановить и резервный вариант модели отключён, интерактивный запуск выводит предупреждение и начинает новую сессию без сохранённой истории",
	"omp.setting.git.enabled.label": "Enable Git Integration",
	"omp.setting.git.enabled.description":
		"Показывать ветку, статус и информацию о PR в TUI и отслеживать метаданные репозитория.",
	"omp.setting.steeringMode.label": "Steering Mode",
	"omp.setting.steeringMode.description": "Как обрабатывать поставленные в очередь сообщения, пока агент работает",
	"omp.setting.followUpMode.label": "Follow-Up Mode",
	"omp.setting.followUpMode.description": "Как разбирать сообщения-продолжения после завершения хода",
	"omp.setting.interruptMode.label": "Interrupt Mode",
	"omp.setting.interruptMode.description": "Когда сообщения-указания прерывают выполнение инструментов",
	"omp.setting.tui.vimMode.label": "Vim Editing Mode",
	"omp.setting.tui.vimMode.description":
		"Модальное редактирование промпта. Esc выходит из режима Insert; в режиме Normal доступны hjkl, 0, $, ^, w, b, e, gg, G, счётчики, x/D/C, dd/yy, p и u; операторы принимают движения или текстовые объекты (diw, ca(, dap); v/V начинают выделение Visual, которое y копирует, а d удаляет",
	"omp.setting.tui.vimModeDisplay.label": "Vim Mode Indicator",
	"omp.setting.tui.vimModeDisplay.description": "Как текущий режим Vim отображается в строке состояния",
	"omp.setting.tui.vimModeDisplay.option.text.label": "Text",
	"omp.setting.tui.vimModeDisplay.option.text.description":
		"Полное название режима — NORMAL, INSERT, VISUAL, V-LINE, REPLACE",
	"omp.setting.tui.vimModeDisplay.option.icon.label": "Icon",
	"omp.setting.tui.vimModeDisplay.option.icon.description": "Один компактный символ на режим",
	"omp.setting.tui.vimModeDisplay.option.none.label": "Hidden",
	"omp.setting.tui.vimModeDisplay.option.none.description": "Не показывать режим в строке состояния",
	"omp.setting.loop.mode.label": "Loop Mode",
	"omp.setting.loop.mode.description": "Что происходит между итерациями /loop перед повторной отправкой промпта",
	"omp.setting.loop.mode.option.prompt.label": "Prompt",
	"omp.setting.loop.mode.option.prompt.description":
		"Повторно отправлять промпт как сообщение-продолжение (текущее поведение)",
	"omp.setting.loop.mode.option.compact.label": "Compact",
	"omp.setting.loop.mode.option.compact.description": "Сжимать контекст сессии, затем повторно отправлять промпт",
	"omp.setting.loop.mode.option.reset.label": "Reset",
	"omp.setting.loop.mode.option.reset.description": "Начинать новую сессию, затем повторно отправлять промпт",
	"omp.setting.loop.conditionTimeoutMs.label": "Loop Condition Timeout (ms)",
	"omp.setting.loop.conditionTimeoutMs.description":
		"Максимальное ожидание команды условия `/loop --while` / `--until`, после которого она считается сломанной и цикл останавливается. Установите 0, чтобы ждать бесконечно",
	"omp.setting.loop.conditionTimeoutMs.option.0.label": "Unlimited",
	"omp.setting.loop.conditionTimeoutMs.option.10000.label": "10 seconds",
	"omp.setting.loop.conditionTimeoutMs.option.30000.label": "30 seconds",
	"omp.setting.loop.conditionTimeoutMs.option.120000.label": "2 minutes",
	"omp.setting.composer.recallClearedDrafts.label": "Recall Cleared Drafts",
	"omp.setting.composer.recallClearedDrafts.description":
		"Сохранять черновики, очищенные через Ctrl+C, в локальной истории Up/Down до выхода; отключение влияет только на будущие очистки",
	"omp.setting.doubleEscapeAction.label": "Double-Escape Action",
	"omp.setting.doubleEscapeAction.description":
		"Что делает двойное нажатие Esc в пустом редакторе: открывает выбор перемотки транскрипта, открывает дерево сессий или ничего",
	"omp.setting.input.bareExitOnEmptySession.label": "Bare Exit on Empty Session",
	"omp.setting.input.bareExitOnEmptySession.description":
		"Отправка ровно `exit`, `quit` или `q` (в любом регистре) до первого сообщения завершает работу вместо обращения к модели",
	"omp.setting.input.bareSlashCommands.label": "Bare Slash Commands",
	"omp.setting.input.bareSlashCommands.description":
		"Отправка ровно имени команды без ведущего `/` (например, `model`, `compact`) выполняет эту слэш-команду; если в сессии уже есть сообщения, нажмите Enter дважды для подтверждения",
	"omp.setting.treeFilterMode.label": "Session Tree Filter",
	"omp.setting.treeFilterMode.description": "Режим фильтра по умолчанию при открытии дерева сессий",
	"omp.setting.autocompleteMaxVisible.label": "Autocomplete Items",
	"omp.setting.autocompleteMaxVisible.description":
		"Максимум видимых элементов в выпадающем списке автодополнения (3-20)",
	"omp.setting.autocompleteMaxVisible.option.3.label": "3 items",
	"omp.setting.autocompleteMaxVisible.option.5.label": "5 items",
	"omp.setting.autocompleteMaxVisible.option.7.label": "7 items",
	"omp.setting.autocompleteMaxVisible.option.10.label": "10 items",
	"omp.setting.autocompleteMaxVisible.option.15.label": "15 items",
	"omp.setting.autocompleteMaxVisible.option.20.label": "20 items",
	"omp.setting.spelling.typoDetection.label": "Typo Detection (macOS)",
	"omp.setting.spelling.typoDetection.description":
		"Помечать слова с ошибками в промпте с помощью активных словарей macOS",
	"omp.setting.spelling.autocomplete.label": "Word Autocomplete",
	"omp.setting.spelling.autocomplete.description":
		"Показывать предсказанные варианты слов как встроенные подсказки: Tab принимает с пробелом, Right — без",
	"omp.setting.spelling.autocomplete.option.off.label": "Off",
	"omp.setting.spelling.autocomplete.option.off.description": "Без автодополнения слов",
	"omp.setting.spelling.autocomplete.option.auto.label": "Auto",
	"omp.setting.spelling.autocomplete.option.auto.description": "N-граммы (ничего скачивать не нужно)",
	"omp.setting.spelling.autocomplete.option.ngram.label": "N-gram",
	"omp.setting.spelling.autocomplete.option.ngram.description": "Изучает ваш словарь по истории промптов",
	"omp.setting.spelling.autocomplete.option.smollm.label": "SmolLM",
	"omp.setting.spelling.autocomplete.option.smollm.description":
		"Небольшая локальная языковая модель в сочетании с N-граммами (скачивает веса при первом использовании)",
	"omp.setting.composer.predictions.label": "Composer Predictions",
	"omp.setting.composer.predictions.description":
		"После завершённого хода просить активную модель предсказать ваше следующее сообщение и показывать его призрачным текстом в пустом редакторе; Tab или Right вставляют его без отправки. Дополнительный расход: каждый завершённый ход отправляет ещё один оплачиваемый запрос по всей переписке (учитывается в /stats)",
	"omp.setting.spelling.autocorrect.label": "Autocorrect (macOS)",
	"omp.setting.spelling.autocorrect.description":
		"Применять уверенные исправления орфографии macOS после завершённых слов",
	"omp.setting.emojiAutocomplete.label": "Emoji Autocomplete",
	"omp.setting.emojiAutocomplete.description":
		"Предлагать эмодзи по коротким кодам `:name:` и раскрывать текстовые смайлы вроде `:D` или `:-)`",
	"omp.setting.paste.largeMenuThreshold.label": "Large Paste Menu",
	"omp.setting.paste.largeMenuThreshold.description":
		"Когда вставка достигает стольких строк, предлагать меню: обернуть в блок кода, обернуть в XML-теги или сохранить в файл. 0 отключает меню (большие вставки всё равно сворачиваются в маркер [Paste]).",
	"omp.setting.paste.largeMenuThreshold.option.0.label": "Off",
	"omp.setting.paste.largeMenuThreshold.option.100.label": "100 lines",
	"omp.setting.paste.largeMenuThreshold.option.250.label": "250 lines",
	"omp.setting.paste.largeMenuThreshold.option.500.label": "500 lines",
	"omp.setting.paste.largeMenuThreshold.option.1000.label": "1000 lines",
	"omp.setting.startup.quiet.label": "Quiet Startup",
	"omp.setting.startup.quiet.description": "Пропускать экран приветствия и сообщения о состоянии при запуске",
	"omp.setting.startup.showSplash.label": "Show Startup Splash",
	"omp.setting.startup.showSplash.description":
		"Показывать полную анимированную заставку настройки при обычном интерактивном запуске без повторной настройки. «Тихий запуск» всё равно её подавляет.",
	"omp.setting.startup.setupWizard.label": "Setup Wizard",
	"omp.setting.startup.setupWizard.description": "Показывать новые шаги знакомства один раз на версию настройки",
	"omp.setting.startup.checkUpdate.label": "Check for Updates",
	"omp.setting.startup.checkUpdate.description": "Проверять обновления omp при запуске",
	"omp.setting.update.channel.label": "Update Channel",
	"omp.setting.update.channel.description":
		"Канал обновлений, используемый omp update и проверкой обновлений при запуске",
	"omp.setting.update.channel.option.stable.label": "Stable",
	"omp.setting.update.channel.option.canary.label": "Canary",
	"omp.setting.marketplace.autoUpdate.label": "Marketplace Auto-Update",
	"omp.setting.marketplace.autoUpdate.description": "Проверять обновления плагинов при запуске",
	"omp.setting.marketplace.autoUpdate.option.off.label": "Off",
	"omp.setting.marketplace.autoUpdate.option.off.description": "Не проверять обновления плагинов",
	"omp.setting.marketplace.autoUpdate.option.notify.label": "Notify",
	"omp.setting.marketplace.autoUpdate.option.notify.description":
		"Проверять при запуске и уведомлять о доступных обновлениях",
	"omp.setting.marketplace.autoUpdate.option.auto.label": "Auto",
	"omp.setting.marketplace.autoUpdate.option.auto.description":
		"Проверять при запуске и автоматически устанавливать обновления",
	"omp.setting.startup.changelogMode.label": "Startup Changelog",
	"omp.setting.startup.changelogMode.description":
		"Выберите, показывать заметки об обновлении кратко, полностью или скрывать их",
	"omp.setting.startup.changelogMode.option.summary.label": "Summary",
	"omp.setting.startup.changelogMode.option.summary.description":
		"Показывать число релизов и изменений с подсказкой /changelog",
	"omp.setting.startup.changelogMode.option.expanded.label": "Expanded",
	"omp.setting.startup.changelogMode.option.expanded.description": "Показывать недавние заметки о выпуске полностью",
	"omp.setting.startup.changelogMode.option.hidden.label": "Hidden",
	"omp.setting.startup.changelogMode.option.hidden.description": "Не показывать заметки о выпуске при запуске",
	"omp.setting.magicKeywords.enabled.label": "Magic Keywords",
	"omp.setting.magicKeywords.enabled.description":
		"Включать скрытые уведомления для отдельных слов ultrathink, orchestrate, workflowz, jevify",
	"omp.setting.magicKeywords.ultrathink.label": "Ultrathink Keyword",
	"omp.setting.magicKeywords.ultrathink.description":
		"Позволять отдельному слову ultrathink запрашивать максимальные автоматические рассуждения и добавлять скрытое уведомление",
	"omp.setting.magicKeywords.orchestrate.label": "Orchestrate Keyword",
	"omp.setting.magicKeywords.orchestrate.description":
		"Позволять отдельному слову orchestrate добавлять скрытое уведомление о мультиагентной оркестрации",
	"omp.setting.magicKeywords.workflow.label": "Workflow Keyword",
	"omp.setting.magicKeywords.workflow.description":
		"Позволять отдельному слову workflowz добавлять скрытое уведомление о рабочем процессе eval",
	"omp.setting.magicKeywords.jevify.label": "Jevify Keyword",
	"omp.setting.magicKeywords.jevify.description":
		"Позволять отдельному слову jevify добавлять скрытое уведомление о пакетной классификации judge",
	"omp.setting.completion.notify.label": "Completion Notification",
	"omp.setting.completion.notify.description": "Уведомлять, когда агент завершает ход",
	"omp.setting.error.notify.label": "Error Notification",
	"omp.setting.error.notify.description": "Уведомлять, когда агент останавливается с ошибкой",
	"omp.setting.ask.timeout.label": "Ask Timeout",
	"omp.setting.ask.timeout.description":
		"Автоматически выбирать рекомендуемый вариант ask через указанное число секунд (0 отключает). Также ограничивает запросы разрешений cfg://; неотвеченное разрешение отклоняет запись вместо автовыбора",
	"omp.setting.ask.timeout.option.0.label": "Disabled",
	"omp.setting.ask.timeout.option.15.label": "15 seconds",
	"omp.setting.ask.timeout.option.30.label": "30 seconds",
	"omp.setting.ask.timeout.option.60.label": "60 seconds",
	"omp.setting.ask.timeout.option.120.label": "120 seconds",
	"omp.setting.ask.notify.label": "Ask Notification",
	"omp.setting.ask.notify.description": "Уведомлять, когда инструмент ask ждёт ввода",
	"omp.setting.recap.enabled.label": "Idle Recap",
	"omp.setting.recap.enabled.description":
		"Создавать краткую сводку от LLM о текущем состоянии после простоя терминала",
	"omp.setting.recap.idleSeconds.label": "Idle Recap Delay",
	"omp.setting.recap.idleSeconds.description": "Сколько секунд ждать простоя перед показом сводки",
	"omp.setting.recap.idleSeconds.option.60.label": "1 minute",
	"omp.setting.recap.idleSeconds.option.120.label": "2 minutes",
	"omp.setting.recap.idleSeconds.option.240.label": "4 minutes",
	"omp.setting.recap.idleSeconds.option.300.label": "5 minutes",
	"omp.setting.recap.idleSeconds.option.600.label": "10 minutes",
	"omp.setting.session.worktreeScope.label": "Resume Worktree Scope",
	"omp.setting.session.worktreeScope.description":
		"Выберите, включает ли текущий каталог в списке продолжения сессии из других worktree репозитория",
	"omp.setting.session.worktreeScope.option.directory.label": "This Directory",
	"omp.setting.session.worktreeScope.option.directory.description": "Только сессии, сохранённые для этого каталога",
	"omp.setting.session.worktreeScope.option.repo.label": "Repository Worktrees",
	"omp.setting.session.worktreeScope.option.repo.description": "Также включать сессии из соседних worktree",
	"omp.setting.power.sleepPrevention.label": "Sleep Prevention",
	"omp.setting.power.sleepPrevention.description":
		"Не давать системе засыпать, пока агент выполняет ход; простаивающая сессия, в том числе ожидающая фоновые задачи, его не удерживает. Каждый уровень накопительный — он добавляет флаги всех нижних уровней.",
	"omp.setting.power.sleepPrevention.option.off.label": "Off",
	"omp.setting.power.sleepPrevention.option.off.description": "Не предотвращать сон",
	"omp.setting.power.sleepPrevention.option.idle.label": "Prevent Idle Sleep",
	"omp.setting.power.sleepPrevention.option.idle.description":
		"Не давать системе засыпать, пока агент выполняет ход (macOS `caffeinate -i`)",
	"omp.setting.power.sleepPrevention.option.display.label": "Prevent Display Sleep",
	"omp.setting.power.sleepPrevention.option.display.description":
		"Также не давать дисплею засыпать при простое (macOS `caffeinate -i -d`)",
	"omp.setting.power.sleepPrevention.option.system.label": "Prevent System Sleep",
	"omp.setting.power.sleepPrevention.option.system.description":
		"Также блокировать любой сон системы от сети и объявлять пользователя активным (macOS `caffeinate -i -d -s -u`)",
	"omp.setting.features.unexpectedStopDetection.label": "Unexpected Stops",
	"omp.setting.features.unexpectedStopDetection.description":
		"Автоматически восстанавливаться, когда ассистент останавливается без видимого сообщения. Smart также классифицирует чисто текстовые остановки небольшой моделью.",
	"omp.setting.features.unexpectedStopDetection.option.none.label": "None",
	"omp.setting.features.unexpectedStopDetection.option.none.description": "Отключено",
	"omp.setting.features.unexpectedStopDetection.option.mechanical.label": "Mechanical",
	"omp.setting.features.unexpectedStopDetection.option.mechanical.description":
		"Повторять остановки без видимого сообщения ассистента; вызовы инструментов исключены (по умолчанию)",
	"omp.setting.features.unexpectedStopDetection.option.smart.label": "Smart",
	"omp.setting.features.unexpectedStopDetection.option.smart.description":
		"Механически + классификация чисто текстовых остановок небольшой моделью",
	"omp.setting.tools.approval.label": "Tool Approval Policies",
	"omp.setting.tools.approval.description":
		"Политики разрешений для каждого инструмента. Установите 'allow' для автоодобрения, 'prompt' для требования подтверждения или 'deny' для блокировки. Переопределения действуют во всех режимах разрешений.",
	"omp.setting.tools.approvalMode.label": "Tool Approval",
	"omp.setting.tools.approvalMode.description":
		"Поведение разрешений по умолчанию для вызовов инструментов. «Всегда спрашивать» автоодобряет только инструменты чтения. «Спрашивать и запоминать» также спрашивает перед чтением файлов и может запоминать файл или папку. «Запись» автоодобряет инструменты чтения и записи в рабочей области. «Yolo» автоодобряет все уровни; политика пользователя всё ещё может запрашивать подтверждение или блокировать.",
	"omp.setting.tools.approvalMode.option.always-ask.label": "Always ask",
	"omp.setting.tools.approvalMode.option.always-ask.description":
		"Автоодобрять инструменты только для чтения; требовать подтверждения для инструментов записи и выполнения.",
	"omp.setting.tools.approvalMode.option.always-ask-cached.label": "Ask and remember",
	"omp.setting.tools.approvalMode.option.always-ask-cached.description":
		"Спрашивать перед чтением или записью файла, с ответами, запоминающими файл или его папку для этой или всех сессий; требовать подтверждения для инструментов выполнения.",
	"omp.setting.tools.approvalMode.option.write.label": "Write",
	"omp.setting.tools.approvalMode.option.write.description":
		"Автоодобрять инструменты чтения и записи; требовать подтверждения для инструментов выполнения, таких как bash, eval, browser и task.",
	"omp.setting.tools.approvalMode.option.yolo.label": "Yolo",
	"omp.setting.tools.approvalMode.option.yolo.description":
		"Автоодобрять инструменты чтения, записи и выполнения. Политика пользователя всё равно может требовать подтверждения или блокировать вызовы.",
	"omp.setting.tools.restrictedFolders.label": "Restricted Folders",
	"omp.setting.tools.restrictedFolders.description":
		'Папки, в которых каждое чтение, запись, правка, поиск или команда требуют явного разрешения, независимо от режима разрешений или запомненного разрешения. Папка и всё внутри неё ограничены; команды сопоставляются по каталогу, в котором выполняются. Список путей в JSON, например ["~/secrets"].',
	"omp.setting.skills.registryUrl.label": "Skill Registry",
	"omp.setting.skills.registryUrl.description":
		"Реестр Skillshare, используемый `omp skill` для установки, поиска и публикации навыков (https://host[:port])",
	"omp.setting.stt.enabled.label": "Speech-to-Text",
	"omp.setting.stt.enabled.description": "Включать ввод речи через микрофон",
	"omp.setting.stt.submitTrigger.label": "Speech-to-Text Submit Trigger",
	"omp.setting.stt.submitTrigger.description":
		"Выберите, когда диктовка отправляется автоматически: никогда, при отпускании (2+ слова), при отпускании с законченным предложением или по слову «отправить».",
	"omp.setting.stt.submitTrigger.option.never.label": "Never",
	"omp.setting.stt.submitTrigger.option.never.description":
		"Никогда не отправлять автоматически; вставлять диктовку и оставаться в редакторе.",
	"omp.setting.stt.submitTrigger.option.release.label": "Release",
	"omp.setting.stt.submitTrigger.option.release.description":
		"Отправлять при отпускании, если во фразе 2+ слова, чтобы избежать случайных отправок.",
	"omp.setting.stt.submitTrigger.option.release-complete.label": "Release with complete sentence",
	"omp.setting.stt.submitTrigger.option.release-complete.description":
		"Отправлять при отпускании, если фраза заканчивается знаком конца предложения (. ? ! и т. п.).",
	"omp.setting.stt.submitTrigger.option.say-submit.label": "When I Say Submit",
	"omp.setting.stt.submitTrigger.option.say-submit.description":
		"Отправлять, если фраза заканчивается словом, содержащим 'submit' (это слово удаляется перед отправкой).",
	"omp.setting.collab.relayUrl.label": "Relay URL",
	"omp.setting.collab.relayUrl.description": "Релей, используемый /collab (wss://host[:port])",
	"omp.setting.collab.webUrl.label": "Web UI URL",
	"omp.setting.collab.webUrl.description":
		"Браузерный интерфейс для ссылок /collab; пустое значение берётся из collab.relayUrl; явный http:// работает только на localhost",
	"omp.setting.collab.displayName.label": "Display Name",
	"omp.setting.collab.displayName.description":
		"Имя, показываемое другим участникам совместной работы (по умолчанию: имя пользователя ОС)",
	"omp.setting.collab.autoStart.label": "Auto Start",
	"omp.setting.collab.autoStart.description":
		"Хостить каждую интерактивную сессию через collab.relayUrl при её запуске и публиковать её в локальном реестре (omp collab list); комнаты меняются при переключении сессии",
	"omp.setting.collab.autoStart.option.off.label": "Off",
	"omp.setting.collab.autoStart.option.off.description": "Делиться только при запуске /collab",
	"omp.setting.collab.autoStart.option.view.label": "View",
	"omp.setting.collab.autoStart.option.view.description":
		"Автохостинг; реестр выдаёт ссылки только для просмотра (omp collab link --view)",
	"omp.setting.collab.autoStart.option.control.label": "Control",
	"omp.setting.collab.autoStart.option.control.description":
		"Автохостинг; реестр выдаёт ссылки управления, которые могут отправлять промпты в сессию",
	"omp.setting.share.serverUrl.label": "Share Server",
	"omp.setting.share.serverUrl.description":
		"Базовый адрес просмотра и загрузки для /share (загрузка зашифрованного блоба + просмотрщик; ссылки вида <base>/<id>#<key>)",
	"omp.setting.share.store.label": "Share Store",
	"omp.setting.share.store.description": "Куда /share загружает зашифрованный блоб сессии",
	"omp.setting.share.store.option.blob.label": "Encrypted Blob",
	"omp.setting.share.store.option.blob.description":
		"Загружать на сервер обмена (учётная запись GitHub не нужна; обходит лимиты gist API)",
	"omp.setting.share.store.option.gist.label": "GitHub Gist",
	"omp.setting.share.store.option.gist.description":
		"Отправлять в секретный gist (требуется авторизованный gh), переходя на сервер обмена при неудаче",
	"omp.setting.share.redactSecrets.label": "Share Secret Redaction",
	"omp.setting.share.redactSecrets.description":
		"Прогонять обфускатор секретов по снимкам /share перед загрузкой (использует конфигурацию secrets.*)",
	"omp.setting.stream.serverUrl.label": "Stream Server",
	"omp.setting.stream.serverUrl.description":
		"Сервер прямой трансляции, используемый `omp stream` (https://host[:port]); зрители смотрят по адресу <base>/<ваше имя пользователя Stencil>",
	"omp.setting.stream.redactPatterns.label": "Extra Redaction Patterns",
	"omp.setting.stream.redactPatterns.description":
		"Дополнительные регулярные выражения, скрываемые в каждой транслируемой строке, сверх значений env/secrets.yml и встроенных форматов учётных данных",
};
