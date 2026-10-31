import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for CLI help, flag descriptions, and shell completions. */
export const ruCli: TranslationCatalog = {
	"omp.cli.section.usage": "ИСПОЛЬЗОВАНИЕ",
	"omp.cli.section.commands": "КОМАНДЫ",
	"omp.cli.section.arguments": "АРГУМЕНТЫ",
	"omp.cli.section.flags": "ФЛАГИ",
	"omp.cli.section.examples": "ПРИМЕРЫ",
	"omp.cli.usage.flags": "[ФЛАГИ]",
	"omp.cli.command.launch.description": "ИИ-ассистент для программирования",
	"omp.cli.command.acp.description": "Запускать omp как сервер ACP (Agent Client Protocol) через stdio",
	"omp.cli.command.auth.description":
		"Экспортировать или импортировать сохранённые учётные данные провайдеров (ключи API и входы OAuth) как JSON",
	"omp.cli.command.auth-broker.description": "Управлять omp auth-broker (хранилищем учётных данных)",
	"omp.cli.command.auth-gateway.description":
		"Запускать auth-gateway: HTTP-прокси пересылки на основе настроенного брокера либо строки JSON через stdio с вашими собственными учётными данными",
	"omp.cli.command.agents.description": "Управлять встроенными агентами задач",
	"omp.cli.command.anonymize.description":
		"Записать копию сессии и её субагентов для передачи: содержимое ходов вырезано, метаданные сохранены, пути и литералы заменены согласованными фиктивными токенами",
	"omp.cli.command.bench.description":
		"Бенчмарк моделей: TTFT/префилл против пропускной способности декодирования с p50/p95, на нагрузках чата, префилла, генерации и кеша промптов либо в режиме одного пользователя против параллельной нагрузки (--detailed)",
	"omp.cli.command.browser-relay.description":
		"Запускать локальный ретранслятор CDP, который позволяет прелюдии браузера управлять вашими вкладками Chrome",
	"omp.cli.command.cleanse.description":
		"Обнаруживать и устранять диагностические проблемы проекта с помощью взвешенных параллельных субагентов",
	"omp.cli.command.collab.description":
		"Список метаданных активных локальных хостов Collab без URL; используйте collab link <instanceId|pid>, чтобы получить управляющую ссылку (--view для режима только просмотра)",
	"omp.cli.command.commit.description": "Генерировать сообщение коммита и обновлять журналы изменений",
	"omp.cli.command.completions.description": "Вывести скрипт автодополнения оболочки (bash, zsh или fish)",
	"omp.cli.command.compress.description":
		"Переписать текстовый файл в плотный регистр промпта с отчётом о том, что отброшено",
	"omp.cli.command.config.description": "Управлять настройками конфигурации",
	"omp.cli.command.dry-balance.description":
		"Пробный прогон балансировки аккаунтов OAuth по случайным идентификаторам сессий",
	"omp.cli.command.find.description":
		"Семантический поиск: опишите поведение и получите файлы и диапазоны строк, где оно реализовано",
	"omp.cli.command.gc.description": "Запустить сборку мусора хранилища",
	"omp.cli.command.grep.description": "Проверить инструмент grep",
	"omp.cli.command.gallery.description":
		"Предпросмотр средств отрисовки инструментов, композера и строки состояния в детерминированной визуальной галерее",
	"omp.cli.command.git.description":
		"Интерактивный полноэкранный интерфейс git: разделённый просмотр диффа, боковая панель индексации и композер коммита",
	"omp.cli.command.grievances.description":
		"Просматривать, очищать или отправлять сообщения о проблемах инструментов (претензии auto-QA)",
	"omp.cli.command.images.description":
		"Проверять, диагностировать, тестировать и очищать серверные части публикации изображений",
	"omp.cli.command.if-bench.description":
		"Бенчмарк следования инструкциям и рабочей памяти: один кешированный поток действий с массивом глифов при меняющейся директиве звука «мяу»",
	"omp.cli.command.install.description":
		"Установить или связать пакет расширения (псевдоним `plugin install`/`plugin link`)",
	"omp.cli.command.join.description": "Присоединиться к общей сессии collab (то же, что /join)",
	"omp.cli.command.login.description": "Войти в провайдера моделей (терминальный аналог /login)",
	"omp.cli.command.models.description": "Список, поиск и обновление доступных моделей",
	"omp.cli.command.plugin.description": "Управлять плагинами (установка, удаление, список и т. д.)",
	"omp.cli.command.predict.description":
		"Введите промпт и сравните в реальном времени призрачный текст всех движков автодополнения слов",
	"omp.cli.command.ps.description":
		"Список и управление фоновыми процессами под надзором демона (журналы, остановка, завершение, перезапуск)",
	"omp.cli.command.say.description": "Синтезировать текст локальным движком TTS и воспроизвести его через динамики",
	"omp.cli.command.clip.description": "Загрузить запись /record на live.omp.sh как публичный клип и вывести его URL",
	"omp.cli.command.play.description": "Воспроизвести запись сессии /record в терминале (пробел — пауза, q — выход)",
	"omp.cli.command.share.description": "Поделиться сохранённой сессией через зашифрованную ссылку (то же, что /share)",
	"omp.cli.command.session.description":
		"Передать сессию на другую машину (pack, unpack, moved) или проверить, какими сессиями владеет запущенный omp (lease)",
	"omp.cli.command.setup.description":
		"Запустить начальную настройку или установить зависимости для дополнительных возможностей",
	"omp.cli.command.shell.description": "Интерактивная консоль оболочки",
	"omp.cli.command.read.description": "Показать, что вернёт инструмент read для пути, URL или внутреннего URI",
	"omp.cli.command.render.description":
		"Отрисовать весь поток сессии через производственный конвейер транскрипта (с замером времени перерисовки)",
	"omp.cli.command.skill.description":
		"Устанавливать, искать, публиковать навыки и управлять ими в реестре Skillshare (skills.omp.sh)",
	"omp.cli.command.ssh.description": "Управлять конфигурациями хостов SSH",
	"omp.cli.command.stats.description": "Просмотр статистики использования",
	"omp.cli.command.stream.description": "Транслировать экраны и чат локальной сессии omp в ваш публичный канал live",
	"omp.cli.command.update.description": "Проверять и устанавливать обновления",
	"omp.cli.command.usage.description":
		"Показать лимиты использования провайдеров для каждого авторизованного аккаунта",
	"omp.cli.command.tiny-models.description":
		"Скачать крошечные локальные модели (заголовки сессий, память, автодополнение слов)",
	"omp.cli.command.token.description": "Получить ключ API или токен OAuth для провайдера",
	"omp.cli.command.toks.description":
		"Подсчитать файл или текст каждым встроенным офлайн-токенизатором (OpenAI, Claude, Qwen, …)",
	"omp.cli.command.ttsr.description": "Проверять и тестировать Time-Traveling Stream Rules (TTSR)",
	"omp.cli.command.worktree.description":
		"Добавлять, перечислять или очищать рабочие деревья git (сначала клонирование, если включено)",
	"omp.cli.command.search.description": "Проверить провайдеров веб-поиска",
	"omp.cli.command.default.arg.messages.description": "Сообщения для отправки (префикс файлов — @)",
	"omp.cli.command.default.flag.model.description":
		'Используемая модель (нечёткое совпадение: "opus", "gpt-5.2"; точное с провайдером: "openai/gpt-5.2")',
	"omp.cli.command.default.flag.smol.description":
		"Модель smol/быстрая для лёгких задач (или переменная окружения PI_SMOL_MODEL)",
	"omp.cli.command.default.flag.slow.description":
		"Модель slow/рассуждающая для тщательного анализа (или переменная окружения PI_SLOW_MODEL)",
	"omp.cli.command.default.flag.plan.description":
		"Модель плана для архитектурного планирования (или переменная окружения PI_PLAN_MODEL)",
	"omp.cli.command.default.flag.goal.description":
		"Начать с чистого листа в режиме цели (только интерактивно; обходит autoResume; без позиционного промпта, режима плана при запуске и явного возобновления)",
	"omp.cli.command.default.flag.prewalk.description":
		"Переключиться с активной модели на быструю/дешёвую при первом edit/write после появления списка задач плана (по умолчанию выключено; см. prewalk.enabled)",
	"omp.cli.command.default.flag.no-prewalk.description":
		"Отключить prewalk, включая prewalk.auto, даже если задан prewalk.enabled",
	"omp.cli.command.default.flag.prewalk-into.description": 'Целевая модель для prewalk (по умолчанию роль "smol")',
	"omp.cli.command.default.flag.plan-yolo.description":
		"Принудительно включить режим плана только для чтения при запуске, автоматически одобрить план при первом вызове resolve модели, затем переключиться на --plan-yolo-into для его реализации",
	"omp.cli.command.default.flag.plan-yolo-into.description":
		'Целевая модель для выполнения plan-yolo (по умолчанию роль "smol")',
	"omp.cli.command.default.flag.provider.description": "Используемый провайдер (устаревшее; предпочтительно --model)",
	"omp.cli.command.default.flag.api-key.description": "Ключ API (по умолчанию берётся из переменных окружения)",
	"omp.cli.command.default.flag.system-prompt.description":
		"Системный промпт (по умолчанию: промпт ассистента для программирования)",
	"omp.cli.command.default.flag.system-prompt-template.description":
		"Шаблон системного промпта Handlebars (несовместим с --system-prompt)",
	"omp.cli.command.default.flag.append-system-prompt.description":
		"Добавить текст или содержимое файла в конец системного промпта",
	"omp.cli.command.default.flag.allow-home.description":
		"Разрешать запуск в ~ без автоматического перехода во временный каталог",
	"omp.cli.command.default.flag.profile.description":
		"Использовать изолированный профиль для авторизации, сессий, настроек и кешей",
	"omp.cli.command.default.flag.alias.description": "Создать ярлык оболочки для выбранного профиля и выйти",
	"omp.cli.command.default.flag.cwd.description": "Каталог для запуска (переопределяет рабочий каталог запуска)",
	"omp.cli.command.default.flag.mode.description": "Режим вывода: text (по умолчанию), json, rpc или rpc-ui",
	"omp.cli.command.default.flag.config.description":
		"Загрузить дополнительный оверлей в стиле config.yml для этого запуска (можно повторять)",
	"omp.cli.command.default.flag.lang.description":
		"Тег языка интерфейса (например, en, ru; по умолчанию: настройка языка)",
	"omp.cli.command.default.flag.add-dir.description":
		"Добавить каталог рабочей области помимо рабочего каталога (можно повторять)",
	"omp.cli.command.default.flag.print.description": "Неинтерактивный режим: обработать промпт и выйти",
	"omp.cli.command.default.flag.continue.description": "Продолжить предыдущую сессию",
	"omp.cli.command.default.flag.resume.description":
		"Возобновить сессию (по префиксу ID, пути или через выбор, если не указано)",
	"omp.cli.command.default.flag.restore.description":
		"Возобновить сессию так же, как --resume, затем продолжить незавершённое её последним процессом (прерванный ход и запущенные им субагенты)",
	"omp.cli.command.default.flag.from-claude.description": "Импортировать сессию Claude Code в OMP",
	"omp.cli.command.default.flag.from-codex.description": "Импортировать сессию Codex в OMP",
	"omp.cli.command.default.flag.session-dir.description": "Каталог для хранения и поиска сессий",
	"omp.cli.command.default.flag.no-session.description": "Не сохранять сессию (временная)",
	"omp.cli.command.default.flag.models.description": "Шаблоны моделей через запятую для переключения по Ctrl+P",
	"omp.cli.command.default.flag.no-tools.description": "Отключить все встроенные инструменты",
	"omp.cli.command.default.flag.no-lsp.description": "Отключить инструменты LSP, форматирование и диагностику",
	"omp.cli.command.default.flag.no-pty.description": "Отключить интерактивное выполнение bash через PTY",
	"omp.cli.command.default.flag.tools.description": "Список включаемых инструментов через запятую (по умолчанию: все)",
	"omp.cli.command.default.flag.thinking.description":
		"Задать уровень рассуждений: off, minimal, low, medium, high, xhigh, max, auto",
	"omp.cli.command.default.flag.service-tier.description":
		"Уровень обслуживания OpenAI для этой сессии (none опускает service_tier)",
	"omp.cli.command.default.flag.hide-thinking.description":
		"Скрывать блоки рассуждений в выводе TUI (только отображение, не отключает рассуждения модели)",
	"omp.cli.command.default.flag.advisor.description":
		"Включить среду советника (пассивно проверяет каждый ход и вставляет заметки)",
	"omp.cli.command.default.flag.wait-async.description":
		"Режим print: перед выходом дождаться фоновых задач этого запуска и пробуждать сессию при каждом результате (async.printWake); без ограничения времени, если не задан --max-time",
	"omp.cli.command.default.flag.external-thinking.description":
		"Использовать приватный блокнот, отключая поддерживаемые рассуждения GPT, Claude и Gemini (на ваш риск: провайдеры помечали такую форму запросов как злоупотребление)",
	"omp.cli.command.default.flag.hook.description": "Загрузить файл хука/расширения (можно указывать несколько раз)",
	"omp.cli.command.default.flag.extension.description": "Загрузить файл расширения (можно указывать несколько раз)",
	"omp.cli.command.default.flag.no-extensions.description":
		"Отключить обнаружение расширений (явные пути -e всё равно работают)",
	"omp.cli.command.default.flag.no-skills.description": "Отключить обнаружение и загрузку навыков",
	"omp.cli.command.default.flag.skills.description":
		"Glob-шаблоны через запятую для фильтрации навыков (например, git-*,docker)",
	"omp.cli.command.default.flag.no-rules.description": "Отключить обнаружение и загрузку правил",
	"omp.cli.command.default.flag.no-context-files.description": "Отключить файлы контекста (AGENTS.md, CLAUDE.md, ...)",
	"omp.cli.command.default.flag.export.description": "Экспортировать файл сессии в HTML и выйти",
	"omp.cli.command.default.flag.no-title.description": "Отключить автогенерацию заголовка",
	"omp.cli.command.default.flag.no-ui.description":
		"С --mode rpc или rpc-ui: запускать расширения без интерфейса (интерфейс инструментов rpc-ui остаётся включён)",
	"omp.cli.command.default.flag.print-thoughts.description":
		"Включать блоки рассуждений в текстовый вывод режима print",
	"omp.cli.command.default.flag.max-time.description":
		"Остановить сессию по истечении этой длительности (например, 600, 10m, 1h)",
	"omp.cli.command.default.flag.warn-cost.description":
		"Предупредить один раз, когда расходы сессии, включая субагентов, достигнут указанного числа USD",
	"omp.cli.command.default.flag.max-cost.description":
		"Прекратить отправку запросов к модели, когда расходы сессии достигнут указанного числа USD; уже отправленные запросы могут завершиться после этого (режим print завершается с кодом 3)",
	"omp.cli.command.default.flag.auto-approve.description":
		"Автоматически одобрять все вызовы инструментов (пропускать запросы разрешений)",
	"omp.cli.command.default.flag.approval-mode.description":
		"Переопределить tools.approvalMode для этой сессии (always-ask|always-ask-cached|write|yolo)",
	"omp.cli.command.auth.arg.action.description": "экспорт или импорт",
	"omp.cli.command.auth.arg.file.description": "Файл, созданный `omp auth export`, или - для stdin (импорт)",
	"omp.cli.command.auth-broker.flag.json.description": "Вывод в JSON",
	"omp.cli.command.auth-broker.flag.bind.description": "Адрес привязки для `serve` (host:port)",
	"omp.cli.command.auth-broker.flag.regenerate.description": "Перегенерировать bearer-токен",
	"omp.cli.command.auth-broker.flag.via.description": "SSH user@host для удалённого входа (login --via=user@host)",
	"omp.cli.command.auth-broker.flag.provider.description":
		"Переопределить id провайдера для `import` (например, когда `type` в JSON не распознан)",
	"omp.cli.command.auth-broker.flag.include-disabled.description":
		"Импортировать учётные данные, у которых в JSON указано `disabled: true` (import)",
	"omp.cli.command.auth-broker.flag.from-local.description":
		"Источник для migrate: локальный SQLite + переменные окружения (обязательно для `migrate`)",
	"omp.cli.command.auth-broker.flag.include-env.description":
		"Захватить API-ключи из переменных окружения для провайдеров, которых ещё нет в broker (migrate)",
	"omp.cli.command.auth-broker.flag.include-oauth.description":
		"Также загружать OAuth из локального SQLite при migrate (по умолчанию пропускаются)",
	"omp.cli.command.auth-broker.flag.dry-run.description":
		"Показать действия без выполнения (import / login --via / migrate)",
	"omp.cli.command.auth-broker.flag.trust-proxy-headers.description":
		"Доверять пересылаемым заголовкам IP клиента от обратного прокси (serve); по умолчанию выключено.",
	"omp.cli.command.auth-broker.arg.action.description": "Подкоманда",
	"omp.cli.command.auth-broker.arg.source.description": "Id OAuth-провайдера (login/logout) или путь (import)",
	"omp.cli.command.auth-gateway.flag.json.description": "Вывод в JSON (token/status/check)",
	"omp.cli.command.auth-gateway.flag.bind.description": "Адрес привязки для `serve` (host:port)",
	"omp.cli.command.auth-gateway.flag.regenerate.description": "Перегенерировать bearer-токен шлюза (token)",
	"omp.cli.command.auth-gateway.flag.no-auth.description":
		"Отключить проверку bearer-токена на входе (serve). Полезно при привязке к loopback — любой вызывающий допускается.",
	"omp.cli.command.auth-gateway.flag.trust-proxy-headers.description":
		"Доверять пересылаемым заголовкам IP клиента от обратного прокси (serve); по умолчанию выключено.",
	"omp.cli.command.auth-gateway.flag.clients.description":
		"JSON-файл клиентских токенов с областями действия (serve); каждый ограничен своими моделями и аккаунтами broker; перечитывается во время работы",
	"omp.cli.command.auth-gateway.flag.strict.description":
		"Для `check`: дополнительно проверять каждые учётные данные через endpoint chat-completion их провайдера. Медленнее; расходует небольшой объём квоты на каждые учётные данные.",
	"omp.cli.command.auth-gateway.arg.action.description": "Подкоманда",
	"omp.cli.command.agents.flag.force.description": "Перезаписать существующие файлы агентов",
	"omp.cli.command.agents.flag.json.description": "Вывод в JSON",
	"omp.cli.command.agents.flag.dir.description": "Каталог вывода (переопределяет --user/--project)",
	"omp.cli.command.agents.flag.user.description": "Записывать в ~/.omp/agent/agents (по умолчанию)",
	"omp.cli.command.agents.flag.project.description": "Записывать в ./.omp/agents",
	"omp.cli.command.agents.arg.action.description": "Действие с агентами",
	"omp.cli.command.anonymize.flag.out.description": "Каталог вывода (по умолчанию: ./<session-file>.anon)",
	"omp.cli.command.anonymize.arg.session.description":
		"Путь к файлу сессии или префикс id (по умолчанию: последняя для cwd)",
	"omp.cli.command.bench.flag.runs.description":
		"Запросов на модель (по умолчанию: 10 chat, 5 prefill/generation, 9 mix); с --detailed — на фазу (по умолчанию: 4)",
	"omp.cli.command.bench.flag.max-tokens.description":
		"Максимум выходных токенов на запрос (по умолчанию: chat 512, prefill 64, generation 2048, cache 64)",
	"omp.cli.command.bench.flag.prompt.description": "Свой текст промпта (только для профилей chat и generation)",
	"omp.cli.command.bench.flag.profile.description":
		"Нагрузка бенчмарка (по умолчанию chat): chat (сбалансированная, измеряет TTFT и tok/s), prefill (большой вход с обходом кеша, измеряет обработку входа), generation (долгий принудительный вывод, измеряет устойчивое декодирование), mix (чередует все три)",
	"omp.cli.command.bench.flag.prefill-bytes.description":
		"Размер синтетического входа для задач prefill (по умолчанию: 32768, ограничен окном контекста)",
	"omp.cli.command.bench.flag.detailed.description":
		"Запускать фазы single-user (1 одновременно), parallel (--par одновременно, со сводным tok/s и масштабированием) и prefill для каждой модели",
	"omp.cli.command.bench.flag.service-tier.description":
		"Уровень обслуживания для каждого семейства моделей (по умолчанию: настроенные параметры `tier.*`; `none` опускает его)",
	"omp.cli.command.bench.flag.json.description": "Вывод в JSON",
	"omp.cli.command.bench.flag.par.description":
		"Выполнять прогоны с N параллельными запросами (по умолчанию: 4); ширина параллельной фазы для --detailed",
	"omp.cli.command.bench.flag.cache.description":
		"Запускать независимые пары холодный/тёплый кеш промпта (не поддерживается для openai-codex-responses)",
	"omp.cli.command.bench.flag.cache-prefix-file.description": "Файл стабильного префикса промпта для --cache",
	"omp.cli.command.bench.flag.cache-prefix-bytes.description":
		"Бюджет байт стабильного префикса для --cache (по умолчанию: 8192)",
	"omp.cli.command.bench.flag.cache-pairs.description": "Пар холодный/тёплый на модель для --cache (по умолчанию: 1)",
	"omp.cli.command.bench.flag.cache-concurrency.description":
		"Одновременных пар кеша для --cache; каждая пара остаётся последовательной (по умолчанию: 1)",
	"omp.cli.command.bench.arg.models.description": "Селекторы моделей (provider/model или нечёткий id, например opus)",
	"omp.cli.command.browser-relay.flag.port.description": "Порт для прослушивания",
	"omp.cli.command.browser-relay.flag.token.description": "Требовать от расширения предъявления этого токена",
	"omp.cli.command.browser-relay.flag.dir.description":
		"Каталог установки расширения (install; по умолчанию ~/.omp/browser-relay/extension)",
	"omp.cli.command.browser-relay.flag.no-group.description": "Не собирать управляемые вкладки в группу вкладок 'omp'",
	"omp.cli.command.browser-relay.flag.verbose.description": "Записывать сводки трафика релея в stderr",
	"omp.cli.command.browser-relay.arg.action.description": "Действие: serve | install (по умолчанию serve)",
	"omp.cli.command.cleanse.flag.agents.description": "Максимальное число субагентов, не пересекающихся по файлам",
	"omp.cli.command.cleanse.flag.model.description": "Селектор модели субагента",
	"omp.cli.command.cleanse.flag.tests.description": "Также запускать настроенные тестовые наборы проекта",
	"omp.cli.command.cleanse.flag.all.description": "Запускать все обнаруженные проверки без интерактивного выбора",
	"omp.cli.command.cleanse.arg.request.description":
		'Что найти и исправить (например, "ts errors"); агент обнаружения подбирает команду',
	"omp.cli.command.collab.flag.view.description":
		"Запросить ссылку только для просмотра вместо доступа с управлением (только link)",
	"omp.cli.command.collab.flag.json.description": "Выводить детерминированный машиночитаемый JSON",
	"omp.cli.command.collab.arg.action.description": "list (по умолчанию) или link",
	"omp.cli.command.collab.arg.selector.description": "ID экземпляра хоста или PID (только link)",
	"omp.cli.command.commit.flag.push.description": "Отправить (push) после коммита",
	"omp.cli.command.commit.flag.dry-run.description": "Предпросмотр без коммита",
	"omp.cli.command.commit.flag.no-changelog.description": "Пропустить обновление changelog",
	"omp.cli.command.commit.flag.legacy.description": "Использовать устаревший детерминированный конвейер",
	"omp.cli.command.commit.flag.context.description": "Дополнительный контекст для модели",
	"omp.cli.command.commit.flag.model.description": "Переопределить выбор модели",
	"omp.cli.command.completions.arg.shell.description": "Целевая оболочка",
	"omp.cli.command.compress.flag.out.description": "Записать утверждённый текст сюда вместо stdout (один файл)",
	"omp.cli.command.compress.flag.inPlace.description": "Перезаписать каждый исходный файл его утверждённым текстом",
	"omp.cli.command.compress.flag.rounds.description": "Максимум черновиков на файл до отказа",
	"omp.cli.command.compress.flag.agents.description": "Сколько файлов сжимается одновременно",
	"omp.cli.command.compress.flag.model.description": "Селектор модели",
	"omp.cli.command.compress.arg.files.description": "Файлы или glob-шаблоны для сжатия",
	"omp.cli.command.config.flag.json.description": "Вывод в JSON",
	"omp.cli.command.config.flag.scope.description":
		'С list: только ключи, задаваемые слоем "global" (config.yml в каталоге агента) или "project" (<cwd>/.omp), как записано',
	"omp.cli.command.config.arg.action.description": "Действие с конфигом",
	"omp.cli.command.config.arg.key.description": "Ключ настройки",
	"omp.cli.command.config.arg.value.description": "Значение (для set/reset)",
	"omp.cli.command.dry-balance.flag.model.description": "Селектор модели (тот же синтаксис, что у --model в omp)",
	"omp.cli.command.dry-balance.flag.count.description": "Число случайных id сессий для перебора",
	"omp.cli.command.dry-balance.flag.concurrency.description": "Максимум одновременных разрешений учётных данных",
	"omp.cli.command.dry-balance.flag.json.description": "Вывод в JSON",
	"omp.cli.command.dry-balance.flag.bench.description":
		"Отправлять один живой запрос бенчмарка на каждый OAuth-аккаунт",
	"omp.cli.command.dry-balance.flag.config.description":
		"Загрузить дополнительный оверлей в стиле config.yml для этого запуска (можно повторять)",
	"omp.cli.command.dry-balance.arg.model.description":
		"Селектор модели (provider/model или нечёткий id). По умолчанию — настроенная модель по умолчанию.",
	"omp.cli.command.find.flag.keyword.description":
		"Дополнительное лексическое ключевое слово (можно повторять или через запятую)",
	"omp.cli.command.find.flag.hidden.description": "Включать файлы и папки, начинающиеся с точки",
	"omp.cli.command.find.flag.json.description": "Выводить полный результат в JSON",
	"omp.cli.command.find.flag.quiet.description": "Подавлять вывод прогресса в stderr",
	"omp.cli.command.find.arg.query.description": "Что найти, обычным языком",
	"omp.cli.command.find.arg.path.description": "Каталог или область omp:// docs для поиска",
	"omp.cli.command.gc.flag.apply.description": "Применить изменения (по умолчанию — dry-run)",
	"omp.cli.command.gc.flag.json.description": "Вывод в JSON",
	"omp.cli.command.gc.flag.agent-dir.description": "Каталог агента для обслуживания",
	"omp.cli.command.gc.flag.blobs.description": "Удалять неиспользуемые блобы",
	"omp.cli.command.gc.flag.archive.description": "Архивировать холодные сессии",
	"omp.cli.command.gc.flag.wal.description": "Выполнять checkpoint WAL-файлов базы данных истории/моделей",
	"omp.cli.command.gc.flag.stale.description":
		"Удалять висячие маркеры сессий/хлебные крошки, старые отчёты отладки и реплики collab",
	"omp.cli.command.gc.flag.compress.description":
		"Хранить простаивающие сессии со встроенным сжатием файловой системы (APFS, NTFS)",
	"omp.cli.command.gc.flag.cold-archive-after-days.description": "Минимальный возраст сессии для архивации",
	"omp.cli.command.gc.flag.retain-newest-global.description": "Всегда оставлять активными столько новейших сессий",
	"omp.cli.command.gc.flag.retain-newest-per-cwd.description":
		"Всегда оставлять активными столько новейших сессий на каждый cwd",
	"omp.cli.command.gc.flag.stale-retain-newest.description":
		"Всегда оставлять столько новейших отчётов отладки и реплик collab",
	"omp.cli.command.gc.flag.stale-retain-days.description":
		"Минимальный возраст отчёта отладки/реплики collab для удаления",
	"omp.cli.command.gc.flag.compress-after-days.description": "Минимум дней простоя до сжатия сессии",
	"omp.cli.command.grep.flag.glob.description": "Фильтровать файлы по glob-шаблону",
	"omp.cli.command.grep.flag.limit.description": "Максимум совпадений",
	"omp.cli.command.grep.flag.context.description": "Строки контекста",
	"omp.cli.command.grep.flag.files.description": "Выводить только имена файлов",
	"omp.cli.command.grep.flag.count.description": "Выводить число совпадений на файл",
	"omp.cli.command.grep.flag.no-gitignore.description": "Включать файлы, исключённые .gitignore",
	"omp.cli.command.grep.arg.pattern.description": "Regex-шаблон для поиска",
	"omp.cli.command.grep.arg.path.description": "Каталог или файл для поиска",
	"omp.cli.command.gallery.flag.surface.description":
		"Отрисовывать только поверхности tool, composer или segment (можно повторять; по умолчанию: все)",
	"omp.cli.command.gallery.flag.tool.description": "Отрисовывать один инструмент по имени",
	"omp.cli.command.gallery.flag.composer.description": "Отрисовывать одну форму composer по имени",
	"omp.cli.command.gallery.flag.segment.description": "Отрисовывать один сегмент строки состояния по имени",
	"omp.cli.command.gallery.flag.state.description": "Отрисовывать только указанные состояния жизненного цикла",
	"omp.cli.command.gallery.flag.width.description": "Ширина отрисовки в колонках",
	"omp.cli.command.gallery.flag.expanded.description": "Отрисовывать развёрнутый вариант каждого рендерера",
	"omp.cli.command.gallery.flag.plain.description": "Удалять ANSI-стили из вывода",
	"omp.cli.command.gallery.flag.screenshot.description":
		"Снимать отрисованный вывод как PNG-скриншоты через VHS вместо печати ANSI (требуется vhs)",
	"omp.cli.command.gallery.flag.out.description":
		"Путь вывода скриншотов (с --screenshot); при разбиении на несколько получает суффикс для каждого изображения",
	"omp.cli.command.gallery.flag.font.description":
		"Семейство шрифта для скриншотов (по умолчанию: JetBrainsMono Nerd Font)",
	"omp.cli.command.gallery.flag.font-size.description": "Размер шрифта для скриншотов в пунктах (по умолчанию: 18)",
	"omp.cli.command.git.flag.dir.description": "Запускать в другом каталоге вместо текущего",
	"omp.cli.command.git.arg.revision.description":
		"Привязать вид к одному коммиту (любая ревизия, например HEAD~2 или sha)",
	"omp.cli.command.grievances.flag.limit.description": "Число последних проблем для показа (list)",
	"omp.cli.command.grievances.flag.tool.description": "Фильтровать по имени инструмента (list, clean)",
	"omp.cli.command.grievances.flag.json.description": "Вывод в JSON",
	"omp.cli.command.grievances.flag.id.description": "Удалить одну жалобу по id (clean)",
	"omp.cli.command.grievances.flag.all.description": "Удалить все жалобы (clean)",
	"omp.cli.command.grievances.arg.action.description": "list (по умолчанию), clean или push",
	"omp.cli.command.images.flag.json.description": "Вывести один JSON-документ",
	"omp.cli.command.images.flag.apply.description": "Применить удаление при purge (по умолчанию — dry-run)",
	"omp.cli.command.images.flag.all.description": "Удалять все записи при purge, а не только просроченные",
	"omp.cli.command.images.flag.dir.description": "Каталог проекта (по умолчанию: текущий каталог)",
	"omp.cli.command.images.flag.timeout.description": "Тайм-аут внешней проверки работоспособности в секундах",
	"omp.cli.command.images.arg.action.description": "status (по умолчанию), doctor, probe или purge",
	"omp.cli.command.if-bench.flag.turns.description":
		"Максимум ходов на модель; на ходе N выполняется N действий (по умолчанию: 24)",
	"omp.cli.command.if-bench.flag.length.description": "Длина массива символов, чётная, 8-26 (по умолчанию: 24)",
	"omp.cli.command.if-bench.flag.max-tokens.description": "Максимум выходных токенов на ход (по умолчанию: 32768)",
	"omp.cli.command.if-bench.flag.nya-max.description":
		"Самая длинная принимаемая кошачья рулада в nya{1,N} (по умолчанию: 8)",
	"omp.cli.command.if-bench.flag.par.description": "Моделей тестируется одновременно (по умолчанию: 4)",
	"omp.cli.command.if-bench.flag.json.description": "Вывод в JSON",
	"omp.cli.command.if-bench.arg.models.description":
		"Селекторы моделей (provider/model или нечёткий id, например opus)",
	"omp.cli.command.install.flag.json.description": "Вывод в JSON",
	"omp.cli.command.install.flag.force.description": "Принудительная установка",
	"omp.cli.command.install.flag.dry-run.description": "Показать действия без применения изменений",
	"omp.cli.command.install.flag.scope.description":
		'Область установки: "user" (по умолчанию) или "project" (только установки из маркетплейса)',
	"omp.cli.command.install.arg.targets.description":
		"Локальный путь, спецификация npm или ссылка маркетплейса (например, ./my-ext, my-pkg@1.2.3, name@marketplace)",
	"omp.cli.command.join.arg.link.description": "Ссылка collab, переданная хостом (/collab)",
	"omp.cli.command.login.arg.provider.description":
		"Id OAuth-провайдера (например, anthropic, openai-codex); опустите для интерактивного выбора",
	"omp.cli.command.models.flag.json.description": "Вывод в JSON",
	"omp.cli.command.models.flag.kind.description": "Тип каталога для вывода",
	"omp.cli.command.models.flag.extension.description": "Загрузить файл расширения перед выводом (можно повторять)",
	"omp.cli.command.models.flag.no-extensions.description":
		"Отключить обнаружение расширений (явные пути -e всё равно работают)",
	"omp.cli.command.models.flag.config.description":
		"Загрузить дополнительный оверлей в стиле config.yml для этого запуска (можно повторять)",
	"omp.cli.command.models.arg.action.description": "ls (по умолчанию) | find | refresh | <provider>",
	"omp.cli.command.models.arg.pattern.description":
		"Подстрока фильтра/поиска или имя провайдера (обязательно для find)",
	"omp.cli.command.plugin.flag.json.description": "Вывод в JSON",
	"omp.cli.command.plugin.flag.fix.description": "Попытаться исправить проблемы (doctor)",
	"omp.cli.command.plugin.flag.force.description": "Принудительная установка",
	"omp.cli.command.plugin.flag.dry-run.description":
		"Показать действия без применения изменений (install, uninstall, link, upgrade плагинов маркетплейса)",
	"omp.cli.command.plugin.flag.local.description": "Работать с локальным каталогом плагина",
	"omp.cli.command.plugin.flag.enable.description": "Включить функцию",
	"omp.cli.command.plugin.flag.disable.description": "Отключить функцию",
	"omp.cli.command.plugin.flag.set.description": "Задать конфиг плагина (key=value)",
	"omp.cli.command.plugin.flag.scope.description": 'Область установки: "user" (по умолчанию) или "project"',
	"omp.cli.command.plugin.arg.action.description": "Действие с плагином",
	"omp.cli.command.plugin.arg.targets.description": "Пакеты, пути или имена плагинов",
	"omp.cli.command.ps.flag.all.description": "Также показывать другие проекты и завершённые глобальные сервисы (list)",
	"omp.cli.command.ps.flag.json.description": "Выводить машиночитаемый JSON",
	"omp.cli.command.ps.flag.plain.description": "Статический список вместо интерактивного монитора (list)",
	"omp.cli.command.ps.flag.dir.description": "Работать с другим каталогом проекта вместо текущего",
	"omp.cli.command.ps.flag.global.description": "Работать с общесистемной областью сервисов (например, browser-relay)",
	"omp.cli.command.ps.flag.follow.description": "Продолжать потоковую передачу нового вывода (logs)",
	"omp.cli.command.ps.flag.head.description": "Читать с начала вместо конца (logs)",
	"omp.cli.command.ps.flag.lines.description": "Число строк журнала, не более 1000 (logs)",
	"omp.cli.command.ps.flag.grep.description": "Regex-фильтр для строк журнала (logs)",
	"omp.cli.command.ps.flag.timeout.description": "Льготный период в секундах до жёсткого завершения (stop)",
	"omp.cli.command.ps.arg.action.description": "list (по умолчанию), info, logs, stop, kill или restart",
	"omp.cli.command.ps.arg.name.description": "Имя процесса (обязательно для всех действий, кроме list)",
	"omp.cli.command.say.flag.voice.description": "Id голоса",
	"omp.cli.command.say.flag.speed.description": "Скорость речи, 0.5–2.5 (1 = обычная; по умолчанию: tts.localSpeed)",
	"omp.cli.command.say.flag.model.description": "Ключ локальной TTS-модели",
	"omp.cli.command.say.flag.file.description": "Читать текст для озвучивания из этого файла",
	"omp.cli.command.say.flag.out.description": "Записать WAV по этому пути вместо воспроизведения",
	"omp.cli.command.say.arg.text.description": "Текст для озвучивания (или используйте --file)",
	"omp.cli.command.clip.flag.title.description": "Заголовок клипа (по умолчанию — заголовок записи)",
	"omp.cli.command.clip.flag.description.description": "Описание клипа, показываемое под плеером",
	"omp.cli.command.clip.flag.server.description": "Базовый URL сервера трансляции (переопределяет stream.serverUrl)",
	"omp.cli.command.clip.arg.file.description": "Запись для загрузки (по умолчанию: последний захват /record)",
	"omp.cli.command.play.flag.speed.description": "Множитель скорости воспроизведения (по умолчанию: 1)",
	"omp.cli.command.play.flag.idle-limit.description": "Ограничивать паузы между кадрами этим числом секунд",
	"omp.cli.command.play.arg.file.description": "Запись для воспроизведения (по умолчанию: последний захват /record)",
	"omp.cli.command.share.flag.gist.description": "Загружать в секретный GitHub gist вместо сервера обмена",
	"omp.cli.command.share.arg.session.description": "Id сессии (префикс) или путь к .jsonl сессии",
	"omp.cli.command.session.flag.cwd.description": "Каталог, в котором сессия продолжается на этой машине (unpack)",
	"omp.cli.command.session.flag.to.description": "Куда переехала сессия, например имя машины (moved)",
	"omp.cli.command.session.flag.json.description": "Выводить списки id сессий {held, unknown} как JSON (lease)",
	"omp.cli.command.session.arg.action.description": "pack, unpack, moved или lease",
	"omp.cli.command.session.arg.source.description":
		"Путь к .jsonl сессии или id (pack, moved); путь к архиву (unpack); id сессий (lease)",
	"omp.cli.command.session.arg.output.description": "Файл архива для записи (pack)",
	"omp.cli.command.setup.flag.check.description": "Проверить, установлены ли зависимости",
	"omp.cli.command.setup.flag.json.description": "Выводить статус в JSON",
	"omp.cli.command.setup.arg.component.description": "Необязательный компонент для установки",
	"omp.cli.command.shell.flag.cwd.description": "Задать рабочий каталог для команд",
	"omp.cli.command.shell.flag.timeout.description": "Тайм-аут на команду в миллисекундах",
	"omp.cli.command.shell.flag.no-snapshot.description": "Не загружать снимок из пользовательской оболочки",
	"omp.cli.command.read.arg.path.description":
		"Путь, URL или внутренний URI для чтения (добавьте :sel для диапазонов строк или режима raw, например src/foo.ts:50-100)",
	"omp.cli.command.render.flag.width.description": "Ширина отрисовки в колонках (по умолчанию: ширина терминала)",
	"omp.cli.command.render.flag.height.description":
		"Высота области просмотра в строках (по умолчанию: высота терминала)",
	"omp.cli.command.render.flag.timing.description": "Выводить тайминги фаз и число выданных байт в stderr",
	"omp.cli.command.render.flag.repaint.description":
		"Замерить N дополнительных полных перерисовок с очисткой скроллбека (кадр навигации /tree)",
	"omp.cli.command.render.flag.plain.description": "Удалять ANSI-стили из вывода",
	"omp.cli.command.render.flag.quiet.description": "Подавлять вывод транскрипта (прогоны бенчмарка)",
	"omp.cli.command.render.arg.session.description":
		"Путь к файлу сессии или префикс id (по умолчанию: последняя для cwd)",
	"omp.cli.command.skill.flag.global.description":
		"Использовать пользовательский глобальный skills.json (install/update/uninstall)",
	"omp.cli.command.skill.flag.yes.description":
		"Устанавливать или обновлять навыки с поставляемыми скриптами без запроса",
	"omp.cli.command.skill.flag.json.description": "Вывод в JSON (search, info, token, list)",
	"omp.cli.command.skill.flag.sort.description": "Порядок поиска",
	"omp.cli.command.skill.flag.scope.description": "Область публикации (по умолчанию: ваше имя пользователя Stencil)",
	"omp.cli.command.skill.flag.tag.description": "Dist-tag для публикуемой версии",
	"omp.cli.command.skill.flag.dry-run.description": "Упаковать и проверить без публикации",
	"omp.cli.command.skill.flag.allow-secrets.description":
		"Публиковать, даже если найдены строки, похожие на учётные данные",
	"omp.cli.command.skill.flag.registry.description": "Базовый URL реестра (переопределяет skills.registryUrl)",
	"omp.cli.command.skill.flag.undo.description": "Отменить yank или deprecation",
	"omp.cli.command.skill.flag.package.description": "Ограничить новый токен пакетом (можно повторять)",
	"omp.cli.command.skill.flag.expires.description": "Срок жизни токена в днях",
	"omp.cli.command.skill.arg.action.description": "Действие с навыком",
	"omp.cli.command.skill.arg.targets.description": "Спецификации, имена, каталоги или аргументы действия",
	"omp.cli.command.ssh.flag.json.description": "Вывод в JSON",
	"omp.cli.command.ssh.flag.host.description": "Адрес хоста",
	"omp.cli.command.ssh.flag.user.description": "Имя пользователя",
	"omp.cli.command.ssh.flag.port.description": "Номер порта",
	"omp.cli.command.ssh.flag.key.description": "Путь к ключу идентичности",
	"omp.cli.command.ssh.flag.desc.description": "Описание хоста",
	"omp.cli.command.ssh.flag.compat.description": "Включить режим совместимости",
	"omp.cli.command.ssh.flag.scope.description": "Область конфига (project|user)",
	"omp.cli.command.ssh.arg.action.description": "Действие SSH",
	"omp.cli.command.ssh.arg.targets.description": "Имя хоста или аргументы",
	"omp.cli.command.stats.flag.port.description": "Порт для сервера панели",
	"omp.cli.command.stats.flag.host.description": "Хост для привязки",
	"omp.cli.command.stats.flag.json.description": "Выводить статистику в JSON",
	"omp.cli.command.stats.flag.summary.description": "Выводить сводку в консоль",
	"omp.cli.command.stream.flag.title.description": "Заголовок трансляции (по умолчанию — имя текущего каталога)",
	"omp.cli.command.stream.flag.server.description": "Базовый URL сервера трансляции (переопределяет stream.serverUrl)",
	"omp.cli.command.stream.flag.no-tui.description": "Использовать построчную консоль вместо интерактивного TUI",
	"omp.cli.command.update.flag.force.description": "Принудительное обновление",
	"omp.cli.command.update.flag.check.description": "Проверить обновления без установки",
	"omp.cli.command.update.flag.plugins.description": "Обновить установленные плагины",
	"omp.cli.command.update.flag.canary.description": "Переключиться на канал canary и обновиться",
	"omp.cli.command.update.flag.stable.description": "Вернуться на стабильный канал",
	"omp.cli.command.usage.flag.json.description": "Выводить отчёты об использовании в JSON",
	"omp.cli.command.usage.flag.provider.description":
		"Показывать использование только для этого id провайдера (например, anthropic)",
	"omp.cli.command.usage.flag.redact.description":
		"Скрывать email/id аккаунтов (кратчайший уникальный префикс) для публикации скриншотов",
	"omp.cli.command.usage.flag.history.description":
		"Показывать записанную историю лимитов использования (часовые снимки) вместо живого снимка",
	"omp.cli.command.usage.flag.days.description": "Окно истории в днях (с --history или clients)",
	"omp.cli.command.usage.flag.extension.description":
		"Загрузить файл расширения перед получением использования (можно повторять)",
	"omp.cli.command.usage.flag.no-extensions.description":
		"Отключить обнаружение расширений (явные пути -e всё равно работают)",
	"omp.cli.command.usage.arg.action.description": "Необязательная подкоманда для выполнения",
	"omp.cli.command.usage.arg.target.description":
		"Сохранённый сброс для траты через `reset`: <provider>/<credential id> в том виде, как его перечисляет `omp usage reset`",
	"omp.cli.command.tiny-models.flag.json.description": "Вывод в JSON",
	"omp.cli.command.tiny-models.arg.action.description": "Действие для выполнения",
	"omp.cli.command.tiny-models.arg.model.description": "Ключ модели (`smollm` = дополнение слов) или all",
	"omp.cli.command.token.flag.raw.description":
		"Выводить необработанное значение учётных данных без разбора вложенных JSON-структур",
	"omp.cli.command.token.flag.force-refresh.description": "Принудительно обновить OAuth-токен, даже если он не истёк",
	"omp.cli.command.token.flag.account.description":
		"Выбрать N-й OAuth-аккаунт (с 1) в порядке хранения вместо кругового выбора по умолчанию",
	"omp.cli.command.token.flag.list.description": "Показать OAuth-аккаунты провайдера (индекс + идентичность) и выйти",
	"omp.cli.command.token.arg.provider.description": "ID провайдера (например, anthropic, openai)",
	"omp.cli.command.toks.flag.json.description": "Вывод в JSON",
	"omp.cli.command.toks.arg.input.description": "Путь к файлу или буквальный текст, если это не имя файла",
	"omp.cli.command.ttsr.flag.file.description": "Путь к файлу сниппета или - для stdin (ttsr test)",
	"omp.cli.command.ttsr.flag.rule.description":
		"Markdown-файл правила для проверки изолированно (пропускает загрузку правил проекта)",
	"omp.cli.command.ttsr.flag.source.description":
		"Источник совпадения: text, thinking или tool (выводится из --file, если не указан)",
	"omp.cli.command.ttsr.flag.tool.description":
		"Имя инструмента, когда источник — tool (например, edit, write); по умолчанию edit",
	"omp.cli.command.ttsr.flag.path.description":
		"Путь кандидата для сопоставления области/glob и определения языка AST",
	"omp.cli.command.ttsr.flag.agent.description":
		"Имя агента, от которого оценивается область `agents` правила (ttsr test); по умолчанию main",
	"omp.cli.command.ttsr.flag.verbose.description": "Показывать каждое проверенное правило, а не только сработавшие",
	"omp.cli.command.ttsr.flag.json.description": "Вывод в JSON",
	"omp.cli.command.ttsr.flag.no-gitignore.description": "Включать файлы, исключённые .gitignore (ttsr scan)",
	"omp.cli.command.ttsr.flag.max-bytes.description":
		"Максимальный размер файла для сканирования в байтах; 0 отключает ограничение (ttsr scan)",
	"omp.cli.command.ttsr.arg.action.description": "Действие TTSR",
	"omp.cli.command.ttsr.arg.snippet.description":
		"Встроенный текст сниппета для проверки (ttsr test) или каталог для сканирования (ttsr scan)",
	"omp.cli.command.worktree.flag.cwd.description": "Каталог репозитория/базовый каталог (add)",
	"omp.cli.command.worktree.flag.branch.description": "Создать новую ветку (add)",
	"omp.cli.command.worktree.flag.force-branch.description": "Создать или сбросить ветку (add)",
	"omp.cli.command.worktree.flag.detach.description": "Отсоединить HEAD (add)",
	"omp.cli.command.worktree.flag.quiet.description": "Подавлять вывод add",
	"omp.cli.command.worktree.flag.all.description": "Очистить все записи, включая живые worktree выгрузки PR (clear)",
	"omp.cli.command.worktree.flag.dry-run.description":
		"Показать, что будет удалено, не трогая файловую систему (clear)",
	"omp.cli.command.worktree.flag.json.description": "Выводить машиночитаемый JSON",
	"omp.cli.command.worktree.arg.action.description": "list (по умолчанию), clear или add",
	"omp.cli.command.worktree.arg.path.description": "Путь worktree (add)",
	"omp.cli.command.worktree.arg.commit.description": "Commit-ish для переключения (add)",
	"omp.cli.command.search.flag.model.description": "Селектор модели из каталога",
	"omp.cli.command.search.flag.recency.description": "Фильтр по свежести",
	"omp.cli.command.search.flag.limit.description": "Максимум возвращаемых результатов",
	"omp.cli.command.search.flag.compact.description": "Отрисовывать сжатый вывод",
	"omp.cli.command.search.arg.query.description": "Текст поискового запроса",
	"omp.cli.env.ABLITERATION_API_KEY": "Модели GLM без цензуры от Abliteration",
	"omp.cli.env.AI_GATEWAY_API_KEY": "Vercel AI Gateway",
	"omp.cli.env.ANTHROPIC_API_KEY": "Модели Anthropic Claude",
	"omp.cli.env.ANTHROPIC_CUSTOM_HEADERS":
		'Дополнительные заголовки для Foundry или любого шлюза с настраиваемым ANTHROPIC_BASE_URL (например, "user-id: USERNAME")',
	"omp.cli.env.ANTHROPIC_FOUNDRY_API_KEY":
		"Токен Anthropic, используемый как Authorization: Bearer <token> в режиме Foundry",
	"omp.cli.env.ANTHROPIC_OAUTH_TOKEN": "OAuth Anthropic (имеет приоритет над API-ключом)",
	"omp.cli.env.ANTHROPIC_SEARCH_API_KEY":
		"Веб-поиск Anthropic (переопределение; отделяет поиск от основного ANTHROPIC_API_KEY)",
	"omp.cli.env.ANTHROPIC_SEARCH_BASE_URL":
		"Базовый URL веб-поиска Anthropic (переопределение; в паре с ANTHROPIC_SEARCH_API_KEY)",
	"omp.cli.env.AWS_PROFILE": "AWS Bedrock (или AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY)",
	"omp.cli.env.AZURE_OPENAI_API_KEY": "Модели Azure OpenAI",
	"omp.cli.env.BRAVE_API_KEY": "Веб-поиск Brave",
	"omp.cli.env.CEREBRAS_API_KEY": "Модели Cerebras",
	"omp.cli.env.CHARM_HYPER_API_KEY": "Модели инференс-шлюза Charm Hyper",
	"omp.cli.env.CLAUDE_CODE_CLIENT_CERT": "Клиентский сертификат (путь к PEM или PEM в строке) для mTLS",
	"omp.cli.env.CLAUDE_CODE_CLIENT_KEY": "Закрытый ключ клиента (путь к PEM или PEM в строке) для mTLS",
	"omp.cli.env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS":
		"Не отправлять предрелизные поля Anthropic (context_management, beta tool fields, task budgets, thinking.block_binding) для шлюзов, которые их отклоняют",
	"omp.cli.env.CLAUDE_CODE_USE_FOUNDRY": "Включить режим Anthropic Foundry (использует эндпоинт Foundry + mTLS)",
	"omp.cli.env.CLINE_API_KEY": "Модели по подписке ClinePass",
	"omp.cli.env.COMMAND_CODE_API_KEY": "Модели Command Code Provider API",
	"omp.cli.env.COPILOT_GITHUB_TOKEN": "GitHub Copilot",
	"omp.cli.env.CURSOR_ACCESS_TOKEN": "Модели Cursor AI",
	"omp.cli.env.EXA_API_KEY": "Веб-поиск Exa",
	"omp.cli.env.FIRECRAWL_API_KEY": "Веб-поиск Firecrawl + бэкенд чтения при извлечении",
	"omp.cli.env.FOUNDRY_BASE_URL": "Базовый URL Anthropic Foundry (например, https://<foundry-host>)",
	"omp.cli.env.GEMINI_API_KEY": "Модели Google Gemini",
	"omp.cli.env.GOOGLE_APPLICATION_CREDENTIALS": "Сервисный аккаунт для Vertex AI",
	"omp.cli.env.GOOGLE_CLOUD_PROJECT": "Google Vertex AI (требуется GOOGLE_CLOUD_LOCATION)",
	"omp.cli.env.GROQ_API_KEY": "Модели Groq",
	"omp.cli.env.HELMCODE_API_KEY": "Приватный инференс Helmcode в ЕС",
	"omp.cli.env.KILO_API_KEY": "Модели Kilo Gateway",
	"omp.cli.env.MINIMAX_API_KEY": "Модели MiniMax",
	"omp.cli.env.MISTRAL_API_KEY": "Модели Mistral",
	"omp.cli.env.NODE_EXTRA_CA_CERTS": "Путь к набору CA (или PEM в строке) для проверки сертификата сервера",
	"omp.cli.env.OMP_PROFILE": "Именованный профиль для изолированного состояния агента (аналог --profile)",
	"omp.cli.env.OPENAI_API_KEY": "Модели OpenAI GPT",
	"omp.cli.env.OPENCODE_API_KEY": "Модели OpenCode Zen/OpenCode Go",
	"omp.cli.env.OPENROUTER_API_KEY": "Агрегированные модели OpenRouter",
	"omp.cli.env.PERPLEXITY_API_KEY": "API-ключ веб-поиска Perplexity (необязательно; иначе анонимный режим)",
	"omp.cli.env.PERPLEXITY_COOKIES": "Веб-поиск Perplexity (cookie сессии)",
	"omp.cli.env.PI_CODING_AGENT_DIR": "Каталог хранения сессий (по умолчанию: ~/{dir}/agent)",
	"omp.cli.env.PI_NO_PTY": "Отключить интерактивное выполнение bash через PTY",
	"omp.cli.env.PI_PACKAGE_DIR": "Переопределить каталог пакета (для путей Nix/Guix store)",
	"omp.cli.env.PI_PLAN_MODEL": "Переопределить модель планирования (см. --plan)",
	"omp.cli.env.PI_SLOW_MODEL": "Переопределить медленную/рассуждающую модель (см. --slow)",
	"omp.cli.env.PI_SMOL_MODEL": "Переопределить smol/быструю модель (см. --smol)",
	"omp.cli.env.SINGULARITYAPI_DEV_API_KEY": "Универсальный шлюз SingularityAPI (300+ моделей)",
	"omp.cli.env.SINGULARITYAPI_TECH_API_KEY": "Выделенные линии DeepSeek в SingularityAPI",
	"omp.cli.env.STEPFUN_API_KEY": "Модели StepFun Step",
	"omp.cli.env.TAVILY_API_KEY": "Веб-поиск Tavily",
	"omp.cli.env.TINYFISH_API_KEY": "Веб-поиск TinyFish",
	"omp.cli.env.TYPESAFE_API_KEY":
		"Решения TypeSafe System One (авторассуждения, unexpected-stop, AI staging, eval judge())",
	"omp.cli.env.UMANS_AI_CODING_PLAN_API_KEY": "Модели Umans AI Coding Plan",
	"omp.cli.env.UMANS_WEBSEARCH_PROVIDER": "Бэкенд веб-поиска шлюза Umans (native или exa)",
	"omp.cli.env.WAFER_SERVERLESS_API_KEY": "Wafer Serverless (оплата по факту использования)",
	"omp.cli.env.XAI_API_KEY": "Модели xAI Grok",
	"omp.cli.env.YOLO_AUTO_API_KEY": "Модели Qwen с фиксированной оплатой Yolo-Auto",
	"omp.cli.env.ZAI_API_KEY": "Модели z.ai (ZhipuAI/GLM)",
	"omp.cli.help.agentsUnpack": "Экспортировать встроенных субагентов в ~/{dir}/agent/agents (по умолчанию)",
	"omp.cli.help.agentsUnpackProject": "Экспортировать встроенных субагентов в ./{dir}/agents",
	"omp.cli.help.commandsTitle": "Полезные команды:",
	"omp.cli.help.envDocs": "Полный справочник переменных окружения см. в:",
	"omp.cli.help.envGroup.additional": "Дополнительные провайдеры LLM",
	"omp.cli.help.envGroup.cloud": "Облачные провайдеры",
	"omp.cli.help.envGroup.configuration": "Конфигурация",
	"omp.cli.help.envGroup.core": "Основные провайдеры",
	"omp.cli.help.envGroup.search": "Поиск и инструменты",
	"omp.cli.help.envTitle": "Переменные окружения:",
	"omp.cli.help.pluginDir": "Загрузить плагин из каталога (можно повторять)",
	"omp.cli.help.pluginTitle": "Параметры плагинов:",
	"omp.cli.help.profileHint":
		"Используйте `omp --profile <name> --alias <command>`, чтобы создать ярлык оболочки для профиля",
	"omp.cli.help.toolsTitle": "Доступные инструменты (включены по умолчанию, если не указано иное):",
	"omp.cli.tool.ask": "Задавать вопросы пользователю (только в интерактивном режиме)",
	"omp.cli.tool.bash": "Выполнять команды bash",
	"omp.cli.tool.browser": "Автоматизация браузера (Puppeteer)",
	"omp.cli.tool.computer": "Захват экрана и ввод на хост-машине (отключено по умолчанию)",
	"omp.cli.tool.edit": "Редактировать файлы поиском и заменой",
	"omp.cli.tool.glob": "Находить файлы по шаблону glob",
	"omp.cli.tool.grep": "Искать по содержимому файлов",
	"omp.cli.tool.lsp": "Протокол языкового сервера (анализ кода)",
	"omp.cli.tool.python": "Выполнять код Python (требуется: {app} setup python)",
	"omp.cli.tool.read": "Читать содержимое файлов",
	"omp.cli.tool.task": "Запускать субагентов для параллельных задач",
	"omp.cli.tool.todo": "Управлять списками задач",
	"omp.cli.tool.web_search": "Искать в интернете",
};
