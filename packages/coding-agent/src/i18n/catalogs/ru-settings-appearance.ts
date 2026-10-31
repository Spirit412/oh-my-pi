import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the appearance settings tab. */
export const ruSettingsAppearance: TranslationCatalog = {
	"omp.setting.language.label": "Язык",
	"omp.setting.language.description":
		"Язык интерфейса. «Авто» следует системной локали; английский и русский включены.",
	"omp.setting.language.option.auto.label": "Авто (по системе)",
	"omp.setting.language.option.auto.description": "Следовать системной локали",
	"omp.setting.language.option.en.label": "Английский",
	"omp.setting.language.option.en.description": "Английский интерфейс",
	"omp.setting.language.option.ru.label": "Русский",
	"omp.setting.language.option.ru.description": "Русский интерфейс",
	"omp.setting.theme.dark.label": "Тёмная тема",
	"omp.setting.theme.dark.description": "Тема для терминала с тёмным фоном",
	"omp.setting.theme.light.label": "Светлая тема",
	"omp.setting.theme.light.description": "Тема для терминала со светлым фоном",
	"omp.setting.symbolPreset.label": "Набор символов",
	"omp.setting.symbolPreset.description": "Набор глифов для иконок и символов (Unicode, Nerd Font или ASCII)",
	"omp.setting.symbolPreset.option.unicode.label": "Unicode",
	"omp.setting.symbolPreset.option.unicode.description": "Стандартные символы (по умолчанию)",
	"omp.setting.symbolPreset.option.nerd.label": "Nerd Font",
	"omp.setting.symbolPreset.option.nerd.description":
		"Требуется Nerd Font или терминал с поддержкой Glyph Protocol (иконки передаются в полосе)",
	"omp.setting.symbolPreset.option.ascii.label": "ASCII",
	"omp.setting.symbolPreset.option.ascii.description": "Максимальная совместимость",
	"omp.setting.colorBlindMode.label": "Режим для дальтоников",
	"omp.setting.colorBlindMode.description": "Использовать синий вместо зелёного для добавленных строк диффа",
	"omp.setting.composer.shape.label": "Форма области ввода",
	"omp.setting.composer.shape.description": "Визуальная раскладка редактора ввода и строки состояния",
	"omp.setting.composer.tokenRate.label": "Скорость генерации",
	"omp.setting.composer.tokenRate.description":
		"Показывать живой счётчик ток./с: в рабочей строке рядом с названием сессии или в нативной панели композера сразу после уровня рассуждений, где последнее значение сохраняется между ходами. Оценивается по потоковым дельтам и корректируется по счётчику выходных токенов провайдера при завершении каждого сообщения.",
	"omp.setting.statusLine.preset.label": "Пресет строки состояния",
	"omp.setting.statusLine.preset.description": "Готовые конфигурации строки состояния",
	"omp.setting.statusLine.preset.option.default.label": "По умолчанию",
	"omp.setting.statusLine.preset.option.default.description": "Модель, путь, git, контекст, токены, стоимость",
	"omp.setting.statusLine.preset.option.minimal.label": "Минимальный",
	"omp.setting.statusLine.preset.option.minimal.description": "Только путь и git",
	"omp.setting.statusLine.preset.option.compact.label": "Компактный",
	"omp.setting.statusLine.preset.option.compact.description": "Модель, git, стоимость, контекст",
	"omp.setting.statusLine.preset.option.full.label": "Полный",
	"omp.setting.statusLine.preset.option.full.description": "Все сегменты, включая время",
	"omp.setting.statusLine.preset.option.nerd.label": "Nerd",
	"omp.setting.statusLine.preset.option.nerd.description": "Максимум информации с иконками Nerd Font",
	"omp.setting.statusLine.preset.option.ascii.label": "ASCII",
	"omp.setting.statusLine.preset.option.ascii.description": "Без специальных символов",
	"omp.setting.statusLine.preset.option.custom.label": "Пользовательский",
	"omp.setting.statusLine.preset.option.custom.description": "Сегменты, заданные пользователем",
	"omp.setting.statusLine.separator.label": "Разделитель строки состояния",
	"omp.setting.statusLine.separator.description": "Стиль разделителей между сегментами",
	"omp.setting.statusLine.separator.option.powerline.label": "Powerline",
	"omp.setting.statusLine.separator.option.powerline.description": "Сплошные стрелки (Nerd Font)",
	"omp.setting.statusLine.separator.option.powerline-thin.label": "Тонкий шеврон",
	"omp.setting.statusLine.separator.option.powerline-thin.description": "Тонкие стрелки (Nerd Font)",
	"omp.setting.statusLine.separator.option.slash.label": "Косая черта",
	"omp.setting.statusLine.separator.option.slash.description": "Прямые слэши",
	"omp.setting.statusLine.separator.option.pipe.label": "Вертикальная черта",
	"omp.setting.statusLine.separator.option.pipe.description": "Вертикальные черты",
	"omp.setting.statusLine.separator.option.block.label": "Блок",
	"omp.setting.statusLine.separator.option.block.description": "Сплошные блоки",
	"omp.setting.statusLine.separator.option.none.label": "Нет",
	"omp.setting.statusLine.separator.option.none.description": "Только пробел",
	"omp.setting.statusLine.separator.option.ascii.label": "ASCII",
	"omp.setting.statusLine.separator.option.ascii.description": "Знаки больше",
	"omp.setting.statusLine.contextLine.label": "Контекстная линия",
	"omp.setting.statusLine.contextLine.description":
		"Как линия между левым и правым сегментами отражает использование контекста (только для блочного композера)",
	"omp.setting.statusLine.contextLine.option.off.label": "Выкл.",
	"omp.setting.statusLine.contextLine.option.off.description": "Сплошная акцентная линия без отражения контекста",
	"omp.setting.statusLine.contextLine.option.percentage.label": "Процент",
	"omp.setting.statusLine.contextLine.option.percentage.description":
		"Использованная часть акцентным цветом, остаток приглушён",
	"omp.setting.statusLine.contextLine.option.annotated.label": "С аннотациями",
	"omp.setting.statusLine.contextLine.option.annotated.description":
		"Процент плюс метки на границах спекулятивного и авто-сжатия",
	"omp.setting.statusLine.contextLine.option.embedded.label": "Встроенный",
	"omp.setting.statusLine.contextLine.option.embedded.description":
		"Аннотированная линия с процентом контекста и окном, встроенными в индикатор",
	"omp.setting.statusLine.sessionAccent.label": "Акцент сессии",
	"omp.setting.statusLine.sessionAccent.description":
		"Использовать цвет имени сессии для рамки редактора и промежутка строки состояния",
	"omp.setting.statusLine.transparent.label": "Прозрачная строка состояния",
	"omp.setting.statusLine.transparent.description":
		"Использовать фон терминала по умолчанию для строки состояния вместо `statusLineBg` из темы. Концевые наконечники Powerline не рисуются, так как им нужна контрастная заливка для перехода в окружающий терминал.",
	"omp.setting.statusLine.compactThinkingLevel.label": "Компактный уровень рассуждений",
	"omp.setting.statusLine.compactThinkingLevel.description":
		"Показывать уровень рассуждений одной иконкой на имени модели вместо отдельного суффикса ` · <level>`; в композере Tern — иконкой чипа модели вместо отдельного чипа (нажмите на иконку, чтобы переключить).",
	"omp.setting.statusLine.showHookStatus.label": "Показывать статус хуков",
	"omp.setting.statusLine.showHookStatus.description": "Показывать сообщения статуса хуков под строкой состояния",
	"omp.setting.terminal.showImages.label": "Показывать встроенные изображения",
	"omp.setting.terminal.showImages.description": "Отрисовывать изображения прямо в терминале",
	"omp.setting.images.autoResize.label": "Автоматический размер изображений",
	"omp.setting.images.autoResize.description":
		"Уменьшать большие изображения до 2000x2000 для лучшей совместимости с моделями",
	"omp.setting.images.blockImages.label": "Блокировать изображения",
	"omp.setting.images.blockImages.description": "Не отправлять изображения провайдерам LLM",
	"omp.setting.tui.resizeScrollback.label": "Перестройка буфера прокрутки",
	"omp.setting.tui.resizeScrollback.description":
		"Как завершённое изменение размера терминала обновляет строки транскрипта, сохранённые в буфере прокрутки терминала",
	"omp.setting.tui.resizeScrollback.option.append.label": "Дописывать",
	"omp.setting.tui.resizeScrollback.option.append.description":
		"Проигрывать транскрипт в новой ширине под сохранённой историей",
	"omp.setting.tui.resizeScrollback.option.rebuild.label": "Перестраивать",
	"omp.setting.tui.resizeScrollback.option.rebuild.description":
		"Стереть весь буфер прокрутки терминала, затем проиграть один транскрипт текущей ширины",
	"omp.setting.tui.resizeScrollback.option.preserve.label": "Сохранять",
	"omp.setting.tui.resizeScrollback.option.preserve.description":
		"Перерисовывать только видимую область и оставлять историю свёрнутой по старой ширине",
	"omp.setting.tui.completeScrollback.label": "Полный буфер прокрутки",
	"omp.setting.tui.completeScrollback.description":
		"Отправлять строки транскрипта, вытесненные за экран растущим HUD или диалогом, сразу в буфер прокрутки; когда он уменьшается, между транскриптом и вводом остаются пустые строки, пока их не заполнит новый вывод",
	"omp.setting.terminal.showProgress.label": "Нативный прогресс в терминале",
	"omp.setting.terminal.showProgress.description":
		"Передавать неопределённый прогресс OSC 9;4, пока работает агент или обслуживание контекста (в Tern всегда включено)",
	"omp.setting.terminal.programStatus.label": "Статус программы (OSC 7501)",
	"omp.setting.terminal.programStatus.description":
		"Сообщать, работает ли агент, ждёт вас, завершил или упал, через OSC 7501 — для индикаторов вкладок терминала и входящих сообщений агента",
	"omp.setting.tui.textSizing.label": "Крупные заголовки (Kitty)",
	"omp.setting.tui.textSizing.description":
		"Отрисовывать заголовки Markdown H1 в масштабе 2x с помощью протокола изменения размера текста OSC 66 в Kitty. Работает только в терминалах Kitty; в остальных игнорируется. По умолчанию выключено.",
	"omp.setting.tui.renderMermaid.label": "Отрисовывать диаграммы Mermaid",
	"omp.setting.tui.renderMermaid.description": "Отрисовывать блоки кода Mermaid как ASCII-диаграммы",
	"omp.setting.tui.renderSvg.label": "Отрисовывать SVG-рисунки",
	"omp.setting.tui.renderSvg.description":
		"Предлагать агенту рисовать диаграммы и графики в SVG, отрисовываемые встроенно как изображения в терминалах с поддержкой графики",
	"omp.setting.tui.autoGraph.label": "Автографики для таблиц",
	"omp.setting.tui.autoGraph.description":
		"Рисовать график под числовыми таблицами в ответах агента, в цветах вашей темы, в терминалах с поддержкой графики",
	"omp.setting.tui.autoGraph.option.auto.label": "Авто",
	"omp.setting.tui.autoGraph.option.auto.description":
		"Умный режим, если роль судьи соответствует нативной модели TypeSafe jev, иначе «Всегда»",
	"omp.setting.tui.autoGraph.option.smart.label": "Умный",
	"omp.setting.tui.autoGraph.option.smart.description":
		"Модель-судья уточняет каждый график: тип, столбцы, имена строк и группировку, шкалы, какое направление лучше, и его заголовок",
	"omp.setting.tui.autoGraph.option.always.label": "Всегда",
	"omp.setting.tui.autoGraph.option.always.description":
		"Строить график для каждой таблицы, которая читается как числовая, по встроенной эвристике",
	"omp.setting.tui.autoGraph.option.off.label": "Выкл.",
	"omp.setting.tui.autoGraph.option.off.description": "Оставлять таблицы таблицами",
	"omp.setting.tui.reactions.label": "Реакции агента",
	"omp.setting.tui.reactions.description":
		"Предлагать агенту реагировать на ваше сообщение эмодзи-бейджем на его пузыре",
	"omp.setting.tui.codexResetFireworks.label": "Фейерверк сброса Codex",
	"omp.setting.tui.codexResetFireworks.description":
		"Отмечать внеплановые еженедельные сбросы использования Codex и новые накопленные сбросы фейерверком в верхней трети экрана, который держится до Esc",
	"omp.setting.tui.titleState.label": "Состояние работы в заголовке терминала",
	"omp.setting.tui.titleState.description":
		"Показывать состояние работы агента в разделителе заголовка терминала — анимированный спиннер во время работы (статический ':' под WSL), '>' когда ваш ход, '!' когда агент ждёт вас",
	"omp.setting.tui.titleSpinner.label": "Спиннер в заголовке терминала",
	"omp.setting.tui.titleSpinner.description":
		"Набор глифов для спиннера рабочего состояния в заголовке терминала — брайлевский проход, наполняющаяся луна, цикл из одной точки или ASCII-безопасная линия",
	"omp.setting.tui.titleSpinner.option.braille.label": "Брайль",
	"omp.setting.tui.titleSpinner.option.braille.description": "Классический проход ⠋⠙⠹ (по умолчанию)",
	"omp.setting.tui.titleSpinner.option.pulse.label": "Пульс",
	"omp.setting.tui.titleSpinner.option.pulse.description": "Луна наполняется ○◑● и снова пустеет",
	"omp.setting.tui.titleSpinner.option.dots.label": "Точки",
	"omp.setting.tui.titleSpinner.option.dots.description": "Циклическая смена одиночных брайлевских точек",
	"omp.setting.tui.titleSpinner.option.line.label": "Линия",
	"omp.setting.tui.titleSpinner.option.line.description": "ASCII - \\ | / для шрифтов без поддержки брайля",
	"omp.setting.tui.hyperlinks.label": "Гиперссылки в терминале",
	"omp.setting.tui.hyperlinks.description":
		"Оборачивать пути и URL в гиперссылки OSC 8 для нативного открытия кликом (auto: определять поддержку; off: никогда; always: всегда)",
	"omp.setting.tui.mouse.label": "Фокус по клику мыши",
	"omp.setting.tui.mouse.description":
		"Перехватывать клики мыши в основной сессии, чтобы живые карточки субагентов и строки HUD получали фокус по клику, с подсветкой цели при наведении, а клики по ссылкам расширений доходили до их расширения (клавиша подсказки ссылок выбирает их без мыши). При включении нативное выделение текста становится Shift+перетаскиванием, а прокрутка колесом — Shift+колесом",
	"omp.setting.tui.tight.label": "Плотная раскладка",
	"omp.setting.tui.tight.description": "Убрать горизонтальные отступы в 1 символ слева и справа от вывода терминала",
	"omp.setting.display.shimmer.label": "Мерцание",
	"omp.setting.display.shimmer.description": "Стиль анимации для сообщений о работе/загрузке",
	"omp.setting.display.shimmer.option.classic.label": "Классический",
	"omp.setting.display.shimmer.option.classic.description": "Мягкая косинусная волна, проходящая по тексту",
	"omp.setting.display.shimmer.option.kitt.label": "Сканер KITT",
	"omp.setting.display.shimmer.option.kitt.description":
		"Красный огонь Knight Rider 1982, бегущий слева направо и обратно",
	"omp.setting.display.shimmer.option.disabled.label": "Отключено",
	"omp.setting.display.shimmer.option.disabled.description": "Без анимации; статичный приглушённый текст",
	"omp.setting.display.pinnedAgents.label": "Закреплённые агенты",
	"omp.setting.display.pinnedAgents.description":
		"Список закреплённых живых агентов над редактором (off скрывает его; collapsed показывает несколько строк с раскрытием; full показывает всех)",
	"omp.setting.display.pinnedAgents.option.off.label": "Выкл.",
	"omp.setting.display.pinnedAgents.option.off.description": "Скрыть закреплённый список",
	"omp.setting.display.pinnedAgents.option.collapsed.label": "Свёрнутый",
	"omp.setting.display.pinnedAgents.option.collapsed.description":
		"Показывать несколько строк с возможностью раскрытия",
	"omp.setting.display.pinnedAgents.option.full.label": "Полный",
	"omp.setting.display.pinnedAgents.option.full.description": "Всегда показывать всех живых агентов",
	"omp.setting.display.subagentLivePreview.label": "Живой предпросмотр субагента",
	"omp.setting.display.subagentLivePreview.description":
		"Показывать текущий (или последний) вызов инструмента каждого закреплённого субагента под его строкой",
	"omp.setting.display.smoothStreaming.label": "Плавная потоковая передача",
	"omp.setting.display.smoothStreaming.description":
		"Плавно показывать текст ассистента и потоковый ввод инструментов по мере поступления частей",
	"omp.setting.display.hideToolActivity.label": "Скрывать активность инструментов",
	"omp.setting.display.hideToolActivity.description":
		"Скрывать в транскрипте вызовы инструментов и результаты, инициированные моделью",
	"omp.setting.display.showTokenUsage.label": "Показывать расход токенов",
	"omp.setting.display.showTokenUsage.description": "Показывать расход токенов за ход в сообщениях ассистента",
	"omp.setting.display.showTurnTime.label": "Показывать время хода",
	"omp.setting.display.showTurnTime.description":
		"Показывать общее время от промпта до ответа (включая вызовы инструментов) в строках расхода сообщений ассистента",
	"omp.setting.display.cacheMissMarker.label": "Метка промаха кеша",
	"omp.setting.display.cacheMissMarker.description":
		"Показывать разделитель после хода ассистента, запрос которого не попал (промахнулся) в кеш промпта",
	"omp.setting.display.advisorCollapsedLines.label": "Строки свёрнутой карточки советника",
	"omp.setting.display.advisorCollapsedLines.description":
		"Максимум строк заметки, которые свёрнутая карточка советника показывает под заголовком (0 сохраняет полный предпросмотр; раскрыть можно переключателем вывода инструментов)",
	"omp.setting.display.advisorCollapsedLines.option.0.label": "Без ограничения",
	"omp.setting.display.advisorCollapsedLines.option.0.description": "По умолчанию.",
	"omp.setting.display.advisorCollapsedLines.option.1.label": "1 строка",
	"omp.setting.display.advisorCollapsedLines.option.2.label": "2 строки",
	"omp.setting.display.advisorCollapsedLines.option.3.label": "3 строки",
	"omp.setting.display.advisorCollapsedLines.option.5.label": "5 строк",
	"omp.setting.display.collapseCompacted.label": "Сворачивать сжатую историю",
	"omp.setting.display.collapseCompacted.description":
		"Сворачивать историю до сжатия за разделителем сводки в живом транскрипте; отключите, чтобы держать полный транскрипт развёрнутым с разделителями в каждой точке сжатия",
	"omp.setting.showHardwareCursor.label": "Показывать аппаратный курсор",
	"omp.setting.showHardwareCursor.description": "Показывать курсор терминала для поддержки IME",
	"omp.setting.tui.imeSafeCursor.label": "Раскладка промпта с учётом IME",
	"omp.setting.tui.imeSafeCursor.description":
		"Переносить нижнюю границу промпта на отдельную строку, чтобы предварительный ввод IME в macOS не сдвигал её",
	"omp.setting.task.showResolvedModelBadge.label": "Показывать бейдж итоговой модели",
	"omp.setting.task.showResolvedModelBadge.description":
		"Показывать фактический ID модели, используемой каждым субагентом, в строке состояния виджета задач",
	"omp.setting.title.icons.label": "Иконки заголовков",
	"omp.setting.title.icons.description":
		"Иконка и короткий код, которые предваряют новые сгенерированные заголовки сессий или заголовки после /rename",
	"omp.setting.title.icons.option.nf+emoji.label": "Nerd Font + эмодзи",
	"omp.setting.title.icons.option.nf+emoji.description":
		"Глиф Nerd Font там, где его отрисовывает набор символов Nerd Font, иначе эмодзи (по умолчанию)",
	"omp.setting.title.icons.option.emoji.label": "Эмодзи",
	"omp.setting.title.icons.option.emoji.description": "Всегда эмодзи",
	"omp.setting.title.icons.option.boring.label": "Строгий",
	"omp.setting.title.icons.option.boring.description": "Простой заголовок: без иконки и кода",
};
