import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the appearance settings tab. */
export const ruSettingsAppearance: TranslationCatalog = {
	"omp.setting.language.label": "Language",
	"omp.setting.language.description":
		"Язык интерфейса. «Авто» следует системной локали; английский и русский включены.",
	"omp.setting.language.option.auto.label": "Auto (system)",
	"omp.setting.language.option.auto.description": "Следовать системной локали",
	"omp.setting.language.option.en.label": "English",
	"omp.setting.language.option.en.description": "Английский интерфейс",
	"omp.setting.language.option.ru.label": "Русский",
	"omp.setting.language.option.ru.description": "Русский интерфейс",
	"omp.setting.theme.dark.label": "Dark Theme",
	"omp.setting.theme.dark.description": "Тема для терминала с тёмным фоном",
	"omp.setting.theme.light.label": "Light Theme",
	"omp.setting.theme.light.description": "Тема для терминала со светлым фоном",
	"omp.setting.symbolPreset.label": "Symbol Preset",
	"omp.setting.symbolPreset.description": "Набор глифов для иконок и символов (Unicode, Nerd Font или ASCII)",
	"omp.setting.symbolPreset.option.unicode.label": "Unicode",
	"omp.setting.symbolPreset.option.unicode.description": "Стандартные символы (по умолчанию)",
	"omp.setting.symbolPreset.option.nerd.label": "Nerd Font",
	"omp.setting.symbolPreset.option.nerd.description":
		"Требуется Nerd Font или терминал с поддержкой Glyph Protocol (иконки передаются в полосе)",
	"omp.setting.symbolPreset.option.ascii.label": "ASCII",
	"omp.setting.symbolPreset.option.ascii.description": "Максимальная совместимость",
	"omp.setting.colorBlindMode.label": "Color-Blind Mode",
	"omp.setting.colorBlindMode.description": "Использовать синий вместо зелёного для добавленных строк диффа",
	"omp.setting.composer.shape.label": "Composer Shape",
	"omp.setting.composer.shape.description": "Визуальная раскладка редактора ввода и строки состояния",
	"omp.setting.composer.tokenRate.label": "Generation Rate",
	"omp.setting.composer.tokenRate.description":
		"Показывать живой счётчик ток./с: в рабочей строке рядом с названием сессии или в нативной панели композера сразу после уровня рассуждений, где последнее значение сохраняется между ходами. Оценивается по потоковым дельтам и корректируется по счётчику выходных токенов провайдера при завершении каждого сообщения.",
	"omp.setting.statusLine.preset.label": "Status Line Preset",
	"omp.setting.statusLine.preset.description": "Готовые конфигурации строки состояния",
	"omp.setting.statusLine.preset.option.default.label": "Default",
	"omp.setting.statusLine.preset.option.default.description": "Модель, путь, git, контекст, токены, стоимость",
	"omp.setting.statusLine.preset.option.minimal.label": "Minimal",
	"omp.setting.statusLine.preset.option.minimal.description": "Только путь и git",
	"omp.setting.statusLine.preset.option.compact.label": "Compact",
	"omp.setting.statusLine.preset.option.compact.description": "Модель, git, стоимость, контекст",
	"omp.setting.statusLine.preset.option.full.label": "Full",
	"omp.setting.statusLine.preset.option.full.description": "Все сегменты, включая время",
	"omp.setting.statusLine.preset.option.nerd.label": "Nerd",
	"omp.setting.statusLine.preset.option.nerd.description": "Максимум информации с иконками Nerd Font",
	"omp.setting.statusLine.preset.option.ascii.label": "ASCII",
	"omp.setting.statusLine.preset.option.ascii.description": "Без специальных символов",
	"omp.setting.statusLine.preset.option.custom.label": "Custom",
	"omp.setting.statusLine.preset.option.custom.description": "Сегменты, заданные пользователем",
	"omp.setting.statusLine.separator.label": "Status Line Separator",
	"omp.setting.statusLine.separator.description": "Стиль разделителей между сегментами",
	"omp.setting.statusLine.separator.option.powerline.label": "Powerline",
	"omp.setting.statusLine.separator.option.powerline.description": "Сплошные стрелки (Nerd Font)",
	"omp.setting.statusLine.separator.option.powerline-thin.label": "Thin chevron",
	"omp.setting.statusLine.separator.option.powerline-thin.description": "Тонкие стрелки (Nerd Font)",
	"omp.setting.statusLine.separator.option.slash.label": "Slash",
	"omp.setting.statusLine.separator.option.slash.description": "Прямые слэши",
	"omp.setting.statusLine.separator.option.pipe.label": "Pipe",
	"omp.setting.statusLine.separator.option.pipe.description": "Вертикальные черты",
	"omp.setting.statusLine.separator.option.block.label": "Block",
	"omp.setting.statusLine.separator.option.block.description": "Сплошные блоки",
	"omp.setting.statusLine.separator.option.none.label": "None",
	"omp.setting.statusLine.separator.option.none.description": "Только пробел",
	"omp.setting.statusLine.separator.option.ascii.label": "ASCII",
	"omp.setting.statusLine.separator.option.ascii.description": "Знаки больше",
	"omp.setting.statusLine.contextLine.label": "Context-Reactive Line",
	"omp.setting.statusLine.contextLine.description":
		"Как линия между левым и правым сегментами отражает использование контекста (только для блочного композера)",
	"omp.setting.statusLine.contextLine.option.off.label": "Off",
	"omp.setting.statusLine.contextLine.option.off.description": "Сплошная акцентная линия без отражения контекста",
	"omp.setting.statusLine.contextLine.option.percentage.label": "Percentage",
	"omp.setting.statusLine.contextLine.option.percentage.description":
		"Использованная часть акцентным цветом, остаток приглушён",
	"omp.setting.statusLine.contextLine.option.annotated.label": "Annotated",
	"omp.setting.statusLine.contextLine.option.annotated.description":
		"Процент плюс метки на границах спекулятивного и авто-сжатия",
	"omp.setting.statusLine.contextLine.option.embedded.label": "Embedded",
	"omp.setting.statusLine.contextLine.option.embedded.description":
		"Аннотированная линия с процентом контекста и окном, встроенными в индикатор",
	"omp.setting.statusLine.sessionAccent.label": "Session Accent",
	"omp.setting.statusLine.sessionAccent.description":
		"Использовать цвет имени сессии для рамки редактора и промежутка строки состояния",
	"omp.setting.statusLine.transparent.label": "Transparent Status Line",
	"omp.setting.statusLine.transparent.description":
		"Использовать фон терминала по умолчанию для строки состояния вместо `statusLineBg` из темы. Концевые наконечники Powerline не рисуются, так как им нужна контрастная заливка для перехода в окружающий терминал.",
	"omp.setting.statusLine.compactThinkingLevel.label": "Compact Thinking Level",
	"omp.setting.statusLine.compactThinkingLevel.description":
		"Показывать уровень рассуждений одной иконкой на имени модели вместо отдельного суффикса ` · <level>`; в композере Tern — иконкой чипа модели вместо отдельного чипа (нажмите на иконку, чтобы переключить).",
	"omp.setting.statusLine.showHookStatus.label": "Show Hook Status",
	"omp.setting.statusLine.showHookStatus.description": "Показывать сообщения статуса хуков под строкой состояния",
	"omp.setting.terminal.showImages.label": "Show Inline Images",
	"omp.setting.terminal.showImages.description": "Отрисовывать изображения прямо в терминале",
	"omp.setting.images.autoResize.label": "Auto-Resize Images",
	"omp.setting.images.autoResize.description":
		"Уменьшать большие изображения до 2000x2000 для лучшей совместимости с моделями",
	"omp.setting.images.blockImages.label": "Block Images",
	"omp.setting.images.blockImages.description": "Не отправлять изображения провайдерам LLM",
	"omp.setting.tui.resizeScrollback.label": "Resize Scrollback",
	"omp.setting.tui.resizeScrollback.description":
		"Как завершённое изменение размера терминала обновляет строки транскрипта, сохранённые в буфере прокрутки терминала",
	"omp.setting.tui.resizeScrollback.option.append.label": "Append",
	"omp.setting.tui.resizeScrollback.option.append.description":
		"Проигрывать транскрипт в новой ширине под сохранённой историей",
	"omp.setting.tui.resizeScrollback.option.rebuild.label": "Rebuild",
	"omp.setting.tui.resizeScrollback.option.rebuild.description":
		"Стереть весь буфер прокрутки терминала, затем проиграть один транскрипт текущей ширины",
	"omp.setting.tui.resizeScrollback.option.preserve.label": "Preserve",
	"omp.setting.tui.resizeScrollback.option.preserve.description":
		"Перерисовывать только видимую область и оставлять историю свёрнутой по старой ширине",
	"omp.setting.tui.completeScrollback.label": "Complete Scrollback",
	"omp.setting.tui.completeScrollback.description":
		"Отправлять строки транскрипта, вытесненные за экран растущим HUD или диалогом, сразу в буфер прокрутки; когда он уменьшается, между транскриптом и вводом остаются пустые строки, пока их не заполнит новый вывод",
	"omp.setting.terminal.showProgress.label": "Native Terminal Progress",
	"omp.setting.terminal.showProgress.description":
		"Передавать неопределённый прогресс OSC 9;4, пока работает агент или обслуживание контекста (в Tern всегда включено)",
	"omp.setting.terminal.programStatus.label": "Program Status (OSC 7501)",
	"omp.setting.terminal.programStatus.description":
		"Сообщать, работает ли агент, ждёт вас, завершил или упал, через OSC 7501 — для индикаторов вкладок терминала и входящих сообщений агента",
	"omp.setting.tui.textSizing.label": "Large Headings (Kitty)",
	"omp.setting.tui.textSizing.description":
		"Отрисовывать заголовки Markdown H1 в масштабе 2x с помощью протокола изменения размера текста OSC 66 в Kitty. Работает только в терминалах Kitty; в остальных игнорируется. По умолчанию выключено.",
	"omp.setting.tui.renderMermaid.label": "Render Mermaid Diagrams",
	"omp.setting.tui.renderMermaid.description": "Отрисовывать блоки кода Mermaid как ASCII-диаграммы",
	"omp.setting.tui.renderSvg.label": "Render SVG Figures",
	"omp.setting.tui.renderSvg.description":
		"Предлагать агенту рисовать диаграммы и графики в SVG, отрисовываемые встроенно как изображения в терминалах с поддержкой графики",
	"omp.setting.tui.autoGraph.label": "Auto-Graph Tables",
	"omp.setting.tui.autoGraph.description":
		"Рисовать график под числовыми таблицами в ответах агента, в цветах вашей темы, в терминалах с поддержкой графики",
	"omp.setting.tui.autoGraph.option.auto.label": "Auto",
	"omp.setting.tui.autoGraph.option.auto.description":
		"Умный режим, если роль судьи соответствует нативной модели TypeSafe jev, иначе «Всегда»",
	"omp.setting.tui.autoGraph.option.smart.label": "Smart",
	"omp.setting.tui.autoGraph.option.smart.description":
		"Модель-судья уточняет каждый график: тип, столбцы, имена строк и группировку, шкалы, какое направление лучше, и его заголовок",
	"omp.setting.tui.autoGraph.option.always.label": "Always",
	"omp.setting.tui.autoGraph.option.always.description":
		"Строить график для каждой таблицы, которая читается как числовая, по встроенной эвристике",
	"omp.setting.tui.autoGraph.option.off.label": "Off",
	"omp.setting.tui.autoGraph.option.off.description": "Оставлять таблицы таблицами",
	"omp.setting.tui.reactions.label": "Agent Reactions",
	"omp.setting.tui.reactions.description":
		"Предлагать агенту реагировать на ваше сообщение эмодзи-бейджем на его пузыре",
	"omp.setting.tui.codexResetFireworks.label": "Codex Reset Fireworks",
	"omp.setting.tui.codexResetFireworks.description":
		"Отмечать внеплановые еженедельные сбросы использования Codex и новые накопленные сбросы фейерверком в верхней трети экрана, который держится до Esc",
	"omp.setting.tui.titleState.label": "Terminal Title Run State",
	"omp.setting.tui.titleState.description":
		"Показывать состояние работы агента в разделителе заголовка терминала — анимированный спиннер во время работы (статический ':' под WSL), '>' когда ваш ход, '!' когда агент ждёт вас",
	"omp.setting.tui.titleSpinner.label": "Terminal Title Spinner",
	"omp.setting.tui.titleSpinner.description":
		"Набор глифов для спиннера рабочего состояния в заголовке терминала — брайлевский проход, наполняющаяся луна, цикл из одной точки или ASCII-безопасная линия",
	"omp.setting.tui.titleSpinner.option.braille.label": "Braille",
	"omp.setting.tui.titleSpinner.option.braille.description": "Классический проход ⠋⠙⠹ (по умолчанию)",
	"omp.setting.tui.titleSpinner.option.pulse.label": "Pulse",
	"omp.setting.tui.titleSpinner.option.pulse.description": "Луна наполняется ○◑● и снова пустеет",
	"omp.setting.tui.titleSpinner.option.dots.label": "Dots",
	"omp.setting.tui.titleSpinner.option.dots.description": "Циклическая смена одиночных брайлевских точек",
	"omp.setting.tui.titleSpinner.option.line.label": "Line",
	"omp.setting.tui.titleSpinner.option.line.description": "ASCII - \\ | / для шрифтов без поддержки брайля",
	"omp.setting.tui.hyperlinks.label": "Terminal Hyperlinks",
	"omp.setting.tui.hyperlinks.description":
		"Оборачивать пути и URL в гиперссылки OSC 8 для нативного открытия кликом (auto: определять поддержку; off: никогда; always: всегда)",
	"omp.setting.tui.mouse.label": "Mouse Click-to-Focus",
	"omp.setting.tui.mouse.description":
		"Перехватывать клики мыши в основной сессии, чтобы живые карточки субагентов и строки HUD получали фокус по клику, с подсветкой цели при наведении, а клики по ссылкам расширений доходили до их расширения (клавиша подсказки ссылок выбирает их без мыши). При включении нативное выделение текста становится Shift+перетаскиванием, а прокрутка колесом — Shift+колесом",
	"omp.setting.tui.tight.label": "Tight Layout",
	"omp.setting.tui.tight.description": "Убрать горизонтальные отступы в 1 символ слева и справа от вывода терминала",
	"omp.setting.display.shimmer.label": "Shimmer",
	"omp.setting.display.shimmer.description": "Стиль анимации для сообщений о работе/загрузке",
	"omp.setting.display.shimmer.option.classic.label": "Classic",
	"omp.setting.display.shimmer.option.classic.description": "Мягкая косинусная волна, проходящая по тексту",
	"omp.setting.display.shimmer.option.kitt.label": "KITT Scanner",
	"omp.setting.display.shimmer.option.kitt.description":
		"Красный огонь Knight Rider 1982, бегущий слева направо и обратно",
	"omp.setting.display.shimmer.option.disabled.label": "Disabled",
	"omp.setting.display.shimmer.option.disabled.description": "Без анимации; статичный приглушённый текст",
	"omp.setting.display.pinnedAgents.label": "Pinned Agents",
	"omp.setting.display.pinnedAgents.description":
		"Список закреплённых живых агентов над редактором (off скрывает его; collapsed показывает несколько строк с раскрытием; full показывает всех)",
	"omp.setting.display.pinnedAgents.option.off.label": "Off",
	"omp.setting.display.pinnedAgents.option.off.description": "Скрыть закреплённый список",
	"omp.setting.display.pinnedAgents.option.collapsed.label": "Collapsed",
	"omp.setting.display.pinnedAgents.option.collapsed.description":
		"Показывать несколько строк с возможностью раскрытия",
	"omp.setting.display.pinnedAgents.option.full.label": "Full",
	"omp.setting.display.pinnedAgents.option.full.description": "Всегда показывать всех живых агентов",
	"omp.setting.display.subagentLivePreview.label": "Subagent Live Preview",
	"omp.setting.display.subagentLivePreview.description":
		"Показывать текущий (или последний) вызов инструмента каждого закреплённого субагента под его строкой",
	"omp.setting.display.smoothStreaming.label": "Smooth Streaming",
	"omp.setting.display.smoothStreaming.description":
		"Плавно показывать текст ассистента и потоковый ввод инструментов по мере поступления частей",
	"omp.setting.display.hideToolActivity.label": "Hide Tool Activity",
	"omp.setting.display.hideToolActivity.description":
		"Скрывать в транскрипте вызовы инструментов и результаты, инициированные моделью",
	"omp.setting.display.showTokenUsage.label": "Show Token Usage",
	"omp.setting.display.showTokenUsage.description": "Показывать расход токенов за ход в сообщениях ассистента",
	"omp.setting.display.showTurnTime.label": "Show Turn Time",
	"omp.setting.display.showTurnTime.description":
		"Показывать общее время от промпта до ответа (включая вызовы инструментов) в строках расхода сообщений ассистента",
	"omp.setting.display.cacheMissMarker.label": "Cache Miss Marker",
	"omp.setting.display.cacheMissMarker.description":
		"Показывать разделитель после хода ассистента, запрос которого не попал (промахнулся) в кеш промпта",
	"omp.setting.display.advisorCollapsedLines.label": "Advisor Collapsed Lines",
	"omp.setting.display.advisorCollapsedLines.description":
		"Максимум строк заметки, которые свёрнутая карточка советника показывает под заголовком (0 сохраняет полный предпросмотр; раскрыть можно переключателем вывода инструментов)",
	"omp.setting.display.advisorCollapsedLines.option.0.label": "No limit",
	"omp.setting.display.advisorCollapsedLines.option.0.description": "По умолчанию.",
	"omp.setting.display.advisorCollapsedLines.option.1.label": "1 line",
	"omp.setting.display.advisorCollapsedLines.option.2.label": "2 lines",
	"omp.setting.display.advisorCollapsedLines.option.3.label": "3 lines",
	"omp.setting.display.advisorCollapsedLines.option.5.label": "5 lines",
	"omp.setting.display.collapseCompacted.label": "Collapse Compacted History",
	"omp.setting.display.collapseCompacted.description":
		"Сворачивать историю до сжатия за разделителем сводки в живом транскрипте; отключите, чтобы держать полный транскрипт развёрнутым с разделителями в каждой точке сжатия",
	"omp.setting.showHardwareCursor.label": "Show Hardware Cursor",
	"omp.setting.showHardwareCursor.description": "Показывать курсор терминала для поддержки IME",
	"omp.setting.tui.imeSafeCursor.label": "IME-Safe Prompt Layout",
	"omp.setting.tui.imeSafeCursor.description":
		"Переносить нижнюю границу промпта на отдельную строку, чтобы предварительный ввод IME в macOS не сдвигал её",
	"omp.setting.task.showResolvedModelBadge.label": "Show Resolved Model Badge",
	"omp.setting.task.showResolvedModelBadge.description":
		"Показывать фактический ID модели, используемой каждым субагентом, в строке состояния виджета задач",
	"omp.setting.title.icons.label": "Title Icons",
	"omp.setting.title.icons.description":
		"Иконка и короткий код, которые предваряют новые сгенерированные заголовки сессий или заголовки после /rename",
	"omp.setting.title.icons.option.nf+emoji.label": "Nerd Font + Emoji",
	"omp.setting.title.icons.option.nf+emoji.description":
		"Глиф Nerd Font там, где его отрисовывает набор символов Nerd Font, иначе эмодзи (по умолчанию)",
	"omp.setting.title.icons.option.emoji.label": "Emoji",
	"omp.setting.title.icons.option.emoji.description": "Всегда эмодзи",
	"omp.setting.title.icons.option.boring.label": "Boring",
	"omp.setting.title.icons.option.boring.description": "Простой заголовок: без иконки и кода",
};
