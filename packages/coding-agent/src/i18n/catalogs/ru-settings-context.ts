import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the context settings tab. */
export const ruSettingsContext: TranslationCatalog = {
	"omp.setting.workspace.additionalDirectories.label": "Дополнительные каталоги рабочей области",
	"omp.setting.workspace.additionalDirectories.description":
		"Дополнительные каталоги рабочей области, добавляемые в каждую сессию как дополнительные корни (многокорневая рабочая область). Управление на лету через /add-dir и /remove-dir. Пути разрешаются относительно cwd; рекомендуются абсолютные пути. Агенту сообщается, что эти корни существуют, и он может читать их, искать в них через grep и glob.",
	"omp.setting.contextFiles.extra.label": "Дополнительные файлы контекста",
	"omp.setting.contextFiles.extra.description":
		'Дополнительные имена файлов инструкций, загружаемые рядом с AGENTS.md. Используйте список имён в JSON, а не пути, например ["AGENTS.local.md"]; [] отключает дополнительные файлы. Запустите новую сессию, чтобы их загрузить.',
	"omp.setting.contextPromotion.enabled.label": "Автопродвижение контекста",
	"omp.setting.contextPromotion.enabled.description":
		"Переключаться на contextPromotionTarget модели при переполнении контекста вместо сжатия. Переключения резервного варианта повтора управляются настройкой «Retry Model Fallback»",
	"omp.setting.extendedContext.label": "Расширенный контекст",
	"omp.setting.extendedContext.description":
		"Использовать окна контекста большего размера, где это поддерживается; может повлечь оплату по повышенному тарифу. Выключено — сохраняются окна по умолчанию или по стандартному тарифу",
	"omp.setting.compaction.enabled.label": "Автосжатие",
	"omp.setting.compaction.enabled.description": "Автоматически сжимать контекст, когда он становится слишком большим",
	"omp.setting.compaction.experimentalContextManagement.label": "Окна контекста на основе заметок (экспериментально)",
	"omp.setting.compaction.experimentalContextManagement.description":
		"Хранить постоянные заметки и доступную для поиска исходную историю между окнами контекста.",
	"omp.setting.compaction.midTurnEnabled.label": "Сжатие в середине хода",
	"omp.setting.compaction.midTurnEnabled.description":
		"Проверять пороги на безопасных границах цикла инструментов в середине хода перед следующим запросом к провайдеру; субагенты проверяют всегда, так как всё их задание — один ход",
	"omp.setting.compaction.methodOrder.label": "Порядок методов сжатия",
	"omp.setting.compaction.methodOrder.description":
		"Предпочтительный порядок резервных вариантов для автоматического обслуживания контекста; недоступные или неудавшиеся методы передают управление следующему варианту",
	"omp.setting.compaction.methodOrder.option.remote.label": "Серверное сжатие",
	"omp.setting.compaction.methodOrder.option.remote.description":
		"Использовать серверное сжатие, встроенное в провайдера (OpenAI Responses compact, Anthropic compaction beta, в том числе на Bedrock), если активный маршрут это поддерживает",
	"omp.setting.compaction.methodOrder.option.snapcompact.label": "Snapcompact",
	"omp.setting.compaction.methodOrder.option.snapcompact.description":
		"Архивировать историю в виде плотных растровых изображений, которые считывает активная визуальная модель; без вызова LLM",
	"omp.setting.compaction.methodOrder.option.handoff.label": "Handoff",
	"omp.setting.compaction.methodOrder.option.handoff.description":
		"Сформировать документ передачи и продолжить с него как со сводки сжатия",
	"omp.setting.compaction.methodOrder.option.soft.label": "Мягкое сжатие",
	"omp.setting.compaction.methodOrder.option.soft.description":
		"Суммировать на месте с помощью модели сжатия, не используя серверное сжатие",
	"omp.setting.compaction.methodOrder.option.shake.label": "Shake",
	"omp.setting.compaction.methodOrder.option.shake.description":
		"Отбросить восстановимый тяжёлый контент на месте без вызова LLM",
	"omp.setting.compaction.thresholdPercent.label": "Порог сжатия",
	"omp.setting.compaction.thresholdPercent.description":
		"Пороговый процент для обслуживания контекста; выберите «По умолчанию», чтобы использовать прежнее поведение на основе резерва",
	"omp.setting.compaction.thresholdPercent.option.default.label": "По умолчанию",
	"omp.setting.compaction.thresholdPercent.option.default.description": "Прежний порог на основе резерва",
	"omp.setting.compaction.thresholdPercent.option.10.label": "10%",
	"omp.setting.compaction.thresholdPercent.option.10.description": "Крайне раннее обслуживание",
	"omp.setting.compaction.thresholdPercent.option.20.label": "20%",
	"omp.setting.compaction.thresholdPercent.option.20.description": "Очень раннее обслуживание",
	"omp.setting.compaction.thresholdPercent.option.30.label": "30%",
	"omp.setting.compaction.thresholdPercent.option.30.description": "Раннее обслуживание",
	"omp.setting.compaction.thresholdPercent.option.40.label": "40%",
	"omp.setting.compaction.thresholdPercent.option.40.description": "Умеренно раннее обслуживание",
	"omp.setting.compaction.thresholdPercent.option.50.label": "50%",
	"omp.setting.compaction.thresholdPercent.option.50.description": "Середина",
	"omp.setting.compaction.thresholdPercent.option.60.label": "60%",
	"omp.setting.compaction.thresholdPercent.option.60.description": "Умеренное использование контекста",
	"omp.setting.compaction.thresholdPercent.option.70.label": "70%",
	"omp.setting.compaction.thresholdPercent.option.70.description": "Сбалансированно",
	"omp.setting.compaction.thresholdPercent.option.75.label": "75%",
	"omp.setting.compaction.thresholdPercent.option.75.description": "Слегка агрессивно",
	"omp.setting.compaction.thresholdPercent.option.80.label": "80%",
	"omp.setting.compaction.thresholdPercent.option.80.description": "Типичный порог",
	"omp.setting.compaction.thresholdPercent.option.85.label": "85%",
	"omp.setting.compaction.thresholdPercent.option.85.description": "Агрессивное использование контекста",
	"omp.setting.compaction.thresholdPercent.option.90.label": "90%",
	"omp.setting.compaction.thresholdPercent.option.90.description": "Очень агрессивно",
	"omp.setting.compaction.thresholdPercent.option.95.label": "95%",
	"omp.setting.compaction.thresholdPercent.option.95.description": "Близко к пределу контекста",
	"omp.setting.compaction.thresholdTokens.label": "Лимит токенов сжатия",
	"omp.setting.compaction.thresholdTokens.description":
		"Фиксированный лимит токенов для обслуживания контекста; при установке переопределяет процент",
	"omp.setting.compaction.thresholdTokens.option.default.label": "По умолчанию",
	"omp.setting.compaction.thresholdTokens.option.default.description": "Использовать порог в процентах",
	"omp.setting.compaction.thresholdTokens.option.25000.label": "25K токенов",
	"omp.setting.compaction.thresholdTokens.option.25000.description": "1/8 окна в 200K",
	"omp.setting.compaction.thresholdTokens.option.50000.label": "50K токенов",
	"omp.setting.compaction.thresholdTokens.option.50000.description": "1/4 окна в 200K",
	"omp.setting.compaction.thresholdTokens.option.100000.label": "100K токенов",
	"omp.setting.compaction.thresholdTokens.option.100000.description": "1/2 окна в 200K",
	"omp.setting.compaction.thresholdTokens.option.150000.label": "150K токенов",
	"omp.setting.compaction.thresholdTokens.option.150000.description": "3/4 окна в 200K",
	"omp.setting.compaction.thresholdTokens.option.200000.label": "200K токенов",
	"omp.setting.compaction.thresholdTokens.option.200000.description": "Полное стандартное окно контекста",
	"omp.setting.compaction.thresholdTokens.option.300000.label": "300K токенов",
	"omp.setting.compaction.thresholdTokens.option.300000.description": "Большое окно контекста",
	"omp.setting.compaction.thresholdTokens.option.500000.label": "500K токенов",
	"omp.setting.compaction.thresholdTokens.option.500000.description": "Очень большое окно контекста",
	"omp.setting.compaction.handoffSaveToDisk.label": "Сохранять документы передачи",
	"omp.setting.compaction.handoffSaveToDisk.description":
		"Сохранять сформированные документы передачи в файлы markdown для потока автоматической передачи",
	"omp.setting.compaction.remoteStreamingV2Enabled.label": "Удалённое сжатие V2",
	"omp.setting.compaction.remoteStreamingV2Enabled.description":
		"Использовать потоковое сжатие Responses для совместимых моделей удалённого сжатия",
	"omp.setting.compaction.asyncEnabled.label": "Асинхронное сжатие",
	"omp.setting.compaction.asyncEnabled.description":
		"Упреждающе суммировать в фоне по мере приближения контекста к порогу сжатия, а затем подставлять готовый результат при пересечении порога",
	"omp.setting.compaction.idleEnabled.label": "Сжатие в простое",
	"omp.setting.compaction.idleEnabled.description": "Сжимать контекст в простое, когда число токенов превышает порог",
	"omp.setting.compaction.idleThresholdTokens.label": "Порог сжатия в простое",
	"omp.setting.compaction.idleThresholdTokens.description":
		"Число токенов, при превышении которого запускается сжатие в простое",
	"omp.setting.compaction.idleThresholdTokens.option.100000.label": "100K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.200000.label": "200K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.300000.label": "300K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.400000.label": "400K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.500000.label": "500K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.600000.label": "600K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.700000.label": "700K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.800000.label": "800K токенов",
	"omp.setting.compaction.idleThresholdTokens.option.900000.label": "900K токенов",
	"omp.setting.compaction.idleTimeoutSeconds.label": "Задержка сжатия в простое",
	"omp.setting.compaction.idleTimeoutSeconds.description":
		"Сколько секунд ждать в простое перед сжатием; при часовом кеше промпта сжатие вместо этого выполняется незадолго до истечения кеша",
	"omp.setting.compaction.idleTimeoutSeconds.option.60.label": "1 минута",
	"omp.setting.compaction.idleTimeoutSeconds.option.120.label": "2 минуты",
	"omp.setting.compaction.idleTimeoutSeconds.option.300.label": "5 минут",
	"omp.setting.compaction.idleTimeoutSeconds.option.600.label": "10 минут",
	"omp.setting.compaction.idleTimeoutSeconds.option.1800.label": "30 минут",
	"omp.setting.compaction.idleTimeoutSeconds.option.3600.label": "1 час",
	"omp.setting.compaction.supersedeReads.label": "Заменять устаревшие результаты чтения",
	"omp.setting.compaction.supersedeReads.description":
		"Удалять более старые результаты чтения, когда тот же файл читается снова (с учётом кеша, выполняется каждый ход)",
	"omp.setting.compaction.dropUseless.label": "Отбрасывать результаты без событий",
	"omp.setting.compaction.dropUseless.description":
		"Удалять результаты инструментов, помеченные как бесполезные в данном контексте (нет совпадений, истёкшие ожидания), после их использования (с учётом кеша)",
	"omp.setting.snapcompact.systemPrompt.label": "Системный промпт Snapcompact",
	"omp.setting.snapcompact.systemPrompt.description":
		"Экспериментально: отрисовывать выбранный текст системного промпта в виде плотных изображений PNG и прикреплять к первому сообщению пользователя (только визуальные модели). Экономит токены; теряет кеширование промпта для текста, преобразованного в изображения.",
	"omp.setting.snapcompact.systemPrompt.option.none.label": "Нет",
	"omp.setting.snapcompact.systemPrompt.option.none.description": "Оставлять системный промпт текстом.",
	"omp.setting.snapcompact.systemPrompt.option.agents-md.label": "AGENTS.md",
	"omp.setting.snapcompact.systemPrompt.option.agents-md.description":
		"Переносить в изображения только загруженные инструкции из файлов контекста, если это экономит токены.",
	"omp.setting.snapcompact.systemPrompt.option.all.label": "Все",
	"omp.setting.snapcompact.systemPrompt.option.all.description":
		"Переносить в изображения весь системный промпт, если это экономит токены.",
	"omp.setting.snapcompact.toolResults.label": "Результаты инструментов Snapcompact",
	"omp.setting.snapcompact.toolResults.description":
		"Экспериментально: отрисовывать крупные результаты инструментов, включая самый новый, в виде плотных изображений PNG вместо текста (только визуальные модели). Экономит токены на накопленном выводе поиска и команд; результаты чтения остаются текстом, если только модель не известна способностью точно редактировать по изображениям.",
	"omp.setting.tools.format.label": "Режим вызова инструментов",
	"omp.setting.tools.format.description":
		"Управляет тем, как инструменты предоставляются модели. «Авто» использует нативные вызовы инструментов провайдера, если выбранная модель не помечена как неподдерживающая их, иначе переходит к собственному диалекту GLM. «Нативно» принудительно использует нативные инструменты провайдера; остальные значения принудительно используют указанный собственный диалект.",
	"omp.setting.tools.format.option.auto.label": "Авто",
	"omp.setting.tools.format.option.auto.description":
		"Использовать нативные вызовы инструментов, если модель не известна как неподдерживающая их.",
	"omp.setting.tools.format.option.native.label": "Нативно",
	"omp.setting.tools.format.option.native.description": "Использовать нативные вызовы инструментов провайдера.",
	"omp.setting.tools.format.option.glm.label": "GLM",
	"omp.setting.tools.format.option.glm.description": "Использовать внутриполосные вызовы инструментов в стиле GLM.",
	"omp.setting.tools.format.option.hermes.label": "Hermes",
	"omp.setting.tools.format.option.hermes.description":
		"Использовать внутриполосные вызовы инструментов в стиле Hermes.",
	"omp.setting.tools.format.option.kimi.label": "Kimi",
	"omp.setting.tools.format.option.kimi.description": "Использовать внутриполосные вызовы инструментов в стиле Kimi.",
	"omp.setting.tools.format.option.xml.label": "XML",
	"omp.setting.tools.format.option.xml.description":
		"Использовать универсальные внутриполосные вызовы инструментов XML.",
	"omp.setting.tools.format.option.anthropic.label": "Anthropic",
	"omp.setting.tools.format.option.anthropic.description":
		"Использовать внутриполосные вызовы инструментов в стиле Anthropic.",
	"omp.setting.tools.format.option.deepseek.label": "DeepSeek",
	"omp.setting.tools.format.option.deepseek.description":
		"Использовать внутриполосные вызовы инструментов в стиле DeepSeek.",
	"omp.setting.tools.format.option.harmony.label": "Harmony",
	"omp.setting.tools.format.option.harmony.description":
		"Использовать внутриполосные вызовы инструментов в стиле Harmony.",
	"omp.setting.tools.format.option.qwen3.label": "Qwen3",
	"omp.setting.tools.format.option.qwen3.description": "Использовать собственный диалект Qwen3.",
	"omp.setting.tools.format.option.gemini.label": "Gemini",
	"omp.setting.tools.format.option.gemini.description": "Использовать собственный диалект Gemini.",
	"omp.setting.tools.format.option.gemma.label": "Gemma",
	"omp.setting.tools.format.option.gemma.description": "Использовать собственный диалект Gemma.",
	"omp.setting.tools.format.option.minimax.label": "MiniMax",
	"omp.setting.tools.format.option.minimax.description": "Использовать собственный диалект MiniMax.",
	"omp.setting.snapcompact.shape.label": "Форма Snapcompact",
	"omp.setting.snapcompact.shape.description":
		"Форма кадра, в которой snapcompact печатает текст (архив сжатия и встроенное изображение). «Авто» выбирает форму, настроенную под текущую модель.",
	"omp.setting.snapcompact.shape.option.auto.label": "Авто",
	"omp.setting.snapcompact.shape.option.auto.description":
		"Выбирает форму, настроенную под текущую модель, с откатом к её семейству провайдеров.",
	"omp.setting.snapcompact.shape.option.8x8r-bw.label": "8x8 с повтором, чёрный",
	"omp.setting.snapcompact.shape.option.8x8r-bw.description":
		"Квадратная ячейка unscii, чёрные чернила, каждая строка печатается дважды, копия на бледной полосе подсветки.",
	"omp.setting.snapcompact.shape.option.8x8r-sent.label": "8x8 с повтором, оттенки предложений",
	"omp.setting.snapcompact.shape.option.8x8r-sent.description":
		"Повторяющаяся сетка с чернилами, циклически меняющими шесть оттенков на границах предложений.",
	"omp.setting.snapcompact.shape.option.8x8u-bw.label": "8x8, чёрный",
	"omp.setting.snapcompact.shape.option.8x8u-bw.description":
		"Обычная квадратная ячейка unscii, строки печатаются один раз, чёрные чернила.",
	"omp.setting.snapcompact.shape.option.8x8u-sent.label": "8x8, оттенки предложений",
	"omp.setting.snapcompact.shape.option.8x8u-sent.description":
		"Обычная квадратная ячейка unscii с чернилами в оттенках предложений.",
	"omp.setting.snapcompact.shape.option.6x6u-bw.label": "6x6 плотный, чёрный",
	"omp.setting.snapcompact.shape.option.6x6u-bw.description":
		"unscii, сжатый до 6x6, — самая плотная читаемая ячейка, минимум кадров — чёрными чернилами.",
	"omp.setting.snapcompact.shape.option.6x6u-sent.label": "6x6 плотный, оттенки предложений",
	"omp.setting.snapcompact.shape.option.6x6u-sent.description":
		"Самая плотная ячейка с чернилами в оттенках предложений.",
	"omp.setting.snapcompact.shape.option.5x8-bw.label": "5x8 прежний, чёрный",
	"omp.setting.snapcompact.shape.option.5x8-bw.description":
		"Исходные глифы X.org 5x8 на кадре 2576px, чёрные чернила.",
	"omp.setting.snapcompact.shape.option.5x8-sent.label": "5x8 прежний, оттенки предложений",
	"omp.setting.snapcompact.shape.option.5x8-sent.description":
		"Исходная форма snapcompact (её отрисовывали сессии до появления таблицы форм).",
	"omp.setting.snapcompact.shape.option.6x12-dim.label": "6x12, приглушённые стоп-слова",
	"omp.setting.snapcompact.shape.option.6x12-dim.description":
		"Глифы X.org 6x12, чёрные чернила, служебные слова приглушены серым.",
	"omp.setting.snapcompact.shape.option.8x13-bw.label": "8x13, чёрный",
	"omp.setting.snapcompact.shape.option.8x13-bw.description": "Глифы X.org 8x13, чёрные чернила.",
	"omp.setting.snapcompact.shape.option.8on16-bw.label": "8x13 с шагом 16px, чёрный",
	"omp.setting.snapcompact.shape.option.8on16-bw.description":
		"Глифы 8x13 в ячейке 8x16 (дополнительный интерлиньяж), чёрные чернила.",
	"omp.setting.snapcompact.shape.option.8on22-bw.label": "8x13 с шагом 22px (интерлиньяж), чёрный",
	"omp.setting.snapcompact.shape.option.8on22-bw.description":
		"Глифы 8x13 в ячейке 8x22 — увеличенный межстрочный интервал, чтобы строки не слипались. По умолчанию для OpenAI/Google.",
	"omp.setting.snapcompact.shape.option.11on16-bw.label": "8x13 с набивкой 11px (трекинг), чёрный",
	"omp.setting.snapcompact.shape.option.11on16-bw.description":
		"Глифы 8x13 в ячейке 11x16 — увеличенный межбуквенный интервал, чтобы символы не сливались. По умолчанию для Anthropic.",
	"omp.setting.snapcompact.shape.option.silver16-bw.label": "Silver 16, CJK",
	"omp.setting.snapcompact.shape.option.silver16-bw.description":
		"Встроенный шрифт Silver TrueType на сетке 16px для CJK и другого нелатинского текста.",
	"omp.setting.snapcompact.shape.option.doc-8on16-bw.label": "Doc 8on16, чёрный",
	"omp.setting.snapcompact.shape.option.doc-8on16-bw.description":
		"Две газетные колонки с переносом по словам из глифов 8x13 с шагом 16px, чёрные чернила.",
	"omp.setting.snapcompact.shape.option.doc-8on16-sent.label": "Doc 8on16, оттенки предложений",
	"omp.setting.snapcompact.shape.option.doc-8on16-sent.description":
		"Двухколоночный макет документа с чернилами в оттенках предложений.",
	"omp.setting.snapcompact.shape.option.doc-8on16-sent-dim.label":
		"Doc 8on16, оттенки предложений + приглушённые стоп-слова",
	"omp.setting.snapcompact.shape.option.doc-8on16-sent-dim.description":
		"Двухколоночный макет документа, чернила в оттенках предложений, служебные слова приглушены серым.",
	"omp.setting.branchSummary.enabled.label": "Сводки веток",
	"omp.setting.branchSummary.enabled.description": "Запрашивать сводку при выходе из ветки",
	"omp.setting.ttsr.enabled.label": "TTSR",
	"omp.setting.ttsr.enabled.description":
		"Прерывать агента посреди потока, когда вывод совпадает с шаблонами правил (Time-Traveling Stream Rules)",
	"omp.setting.ttsr.judge.label": "Правила с оценкой",
	"omp.setting.ttsr.judge.description":
		"Запрашивать у роли модели-судьи по каждому правилу `question` применительно к завершённым ответам, рассуждениям и вызовам инструментов; ответ «да» добавляет правило как предупреждение",
	"omp.setting.ttsr.judge.option.auto.label": "Авто",
	"omp.setting.ttsr.judge.option.auto.description":
		"Оценивать, только когда роль судьи разрешается в нативную модель TypeSafe jev",
	"omp.setting.ttsr.judge.option.on.label": "Вкл.",
	"omp.setting.ttsr.judge.option.on.description": "Всегда оценивать, какую бы модель ни разрешала роль судьи",
	"omp.setting.ttsr.judge.option.off.label": "Выкл.",
	"omp.setting.ttsr.judge.option.off.description": "Никогда не оценивать; правила question остаются неактивными",
	"omp.setting.ttsr.contextMode.label": "Режим контекста TTSR",
	"omp.setting.ttsr.contextMode.description": "Что делать с частичным выводом, когда срабатывает TTSR",
	"omp.setting.ttsr.interruptMode.label": "Режим прерывания TTSR",
	"omp.setting.ttsr.interruptMode.description":
		"Когда прерывать посреди потока, а когда внедрять предупреждение после завершения",
	"omp.setting.ttsr.interruptMode.option.always.label": "всегда",
	"omp.setting.ttsr.interruptMode.option.always.description": "Прерывать на потоках текста и инструментов",
	"omp.setting.ttsr.interruptMode.option.prose-only.label": "только текст",
	"omp.setting.ttsr.interruptMode.option.prose-only.description":
		"Прерывать только при совпадениях в ответе/рассуждениях",
	"omp.setting.ttsr.interruptMode.option.tool-only.label": "только инструменты",
	"omp.setting.ttsr.interruptMode.option.tool-only.description":
		"Прерывать только при совпадениях в аргументах вызова инструментов",
	"omp.setting.ttsr.interruptMode.option.never.label": "никогда",
	"omp.setting.ttsr.interruptMode.option.never.description":
		"Никогда не прерывать; внедрять предупреждение после завершения",
	"omp.setting.ttsr.repeatMode.label": "Режим повтора TTSR",
	"omp.setting.ttsr.repeatMode.description":
		"Как правила могут повторяться: один раз за сессию или после пропуска сообщений",
	"omp.setting.ttsr.repeatGap.label": "Интервал повтора TTSR",
	"omp.setting.ttsr.repeatGap.description": "Сколько сообщений должно пройти, прежде чем правило сработает снова",
	"omp.setting.ttsr.repeatGap.option.5.label": "5 сообщений",
	"omp.setting.ttsr.repeatGap.option.10.label": "10 сообщений",
	"omp.setting.ttsr.repeatGap.option.15.label": "15 сообщений",
	"omp.setting.ttsr.repeatGap.option.20.label": "20 сообщений",
	"omp.setting.ttsr.repeatGap.option.30.label": "30 сообщений",
	"omp.setting.ttsr.builtinRules.label": "Встроенные правила",
	"omp.setting.ttsr.builtinRules.description":
		"Загружать правила по умолчанию, поставляемые с агентом (переопределять по отдельности через ttsr.disabledRules)",
	"omp.setting.ttsr.disabledRules.label": "Отключённые правила",
	"omp.setting.ttsr.disabledRules.description":
		"Имена правил, которые полностью игнорируются (касается встроенных правил по умолчанию и ваших собственных)",
};
