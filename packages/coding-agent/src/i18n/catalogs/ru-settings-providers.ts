import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the providers settings tab. */
export const ruSettingsProviders: TranslationCatalog = {
	"omp.setting.providers.maxInFlightRequests.label": "Max In-Flight Requests",
	"omp.setting.providers.maxInFlightRequests.description":
		"Максимум одновременных запросов к LLM на один id провайдера (например, «openai» или «anthropic»), общий для локальных процессов OMP с этим корнем конфигурации. Для не указанных провайдеров ограничение не действует.",
	"omp.setting.providers.ollama-cloud.maxConcurrency.label": "Ollama Cloud Max Concurrency",
	"omp.setting.providers.ollama-cloud.maxConcurrency.description":
		"Максимум одновременных запусков субагентов Ollama Cloud на процесс; 0 отключает ограничение для этого провайдера",
	"omp.setting.providers.webSearchTimeoutSeconds.label": "Web Search Timeout",
	"omp.setting.providers.webSearchTimeoutSeconds.description":
		"Жёсткий тайм-аут транспорта поиска каждого провайдера, после которого web_search переходит к следующему резервному варианту, в секундах (максимум 300)",
	"omp.setting.providers.webSearchTimeoutSeconds.option.30.label": "30 seconds",
	"omp.setting.providers.webSearchTimeoutSeconds.option.60.label": "1 minute",
	"omp.setting.providers.webSearchTimeoutSeconds.option.120.label": "2 minutes",
	"omp.setting.providers.webSearchTimeoutSeconds.option.180.label": "3 minutes",
	"omp.setting.providers.webSearchTimeoutSeconds.option.300.label": "5 minutes",
	"omp.setting.providers.antigravityEndpoint.label": "Antigravity Endpoint Mode",
	"omp.setting.providers.antigravityEndpoint.description":
		"Стратегия маршрутизации эндпоинта для провайдеров google-antigravity (чат, поиск, изображения, обнаружение)",
	"omp.setting.providers.antigravityEndpoint.option.auto.label": "Auto",
	"omp.setting.providers.antigravityEndpoint.option.auto.description":
		"Пробовать production-эндпоинт, при 5xx/429 переключаться на sandbox",
	"omp.setting.providers.antigravityEndpoint.option.production.label": "Production Only",
	"omp.setting.providers.antigravityEndpoint.option.production.description": "Использовать только production-эндпоинт",
	"omp.setting.providers.antigravityEndpoint.option.sandbox.label": "Sandbox Only",
	"omp.setting.providers.antigravityEndpoint.option.sandbox.description": "Использовать только sandbox-эндпоинт",
	"omp.setting.providers.fireworksTier.label": "Fireworks Tier",
	"omp.setting.providers.fireworksTier.description":
		'Путь обслуживания запросов Fireworks. Priority отправляет `service_tier: "priority"` для повышенной надёжности в часы пик по более высокой цене; Standard его не отправляет. Модели Fast (`-fast`) это игнорируют — Fast использует собственный путь обслуживания.',
	"omp.setting.providers.fireworksTier.option.standard.label": "Standard",
	"omp.setting.providers.fireworksTier.option.standard.description":
		"Путь обслуживания по умолчанию (без service_tier)",
	"omp.setting.providers.fireworksTier.option.priority.label": "Priority",
	"omp.setting.providers.fireworksTier.option.priority.description":
		"Приоритетный путь обслуживания: выше надёжность, премиальная цена за токен",
	"omp.setting.providers.tinyModelDevice.label": "Tiny Model Device",
	"omp.setting.providers.tinyModelDevice.description":
		"Бэкенд вывода для локальных tiny-моделей (заголовки + память): провайдер выполнения ONNX или `mlx`, чтобы скачать веса MLX и запускать их через mlx-lm на Apple silicon. По умолчанию используется ONNX только на CPU. Переменная окружения PI_TINY_DEVICE переопределяет эту настройку.",
	"omp.setting.providers.tinyModelDevice.option.default.label": "Default",
	"omp.setting.providers.tinyModelDevice.option.default.description": "Вывод только на CPU",
	"omp.setting.providers.tinyModelDevice.option.gpu.label": "GPU",
	"omp.setting.providers.tinyModelDevice.option.gpu.description":
		"Ускоренный провайдер (WebGPU/Metal, CUDA или DirectML)",
	"omp.setting.providers.tinyModelDevice.option.cpu.label": "CPU",
	"omp.setting.providers.tinyModelDevice.option.cpu.description": "Вывод только на CPU",
	"omp.setting.providers.tinyModelDevice.option.mlx.label": "MLX",
	"omp.setting.providers.tinyModelDevice.option.mlx.description":
		"GPU Apple silicon через mlx-lm (подпроцесс Python; macOS arm64)",
	"omp.setting.providers.tinyModelDevice.option.metal.label": "Metal",
	"omp.setting.providers.tinyModelDevice.option.metal.description": "Синоним MLX",
	"omp.setting.providers.tinyModelDevice.option.webgpu.label": "WebGPU",
	"omp.setting.providers.tinyModelDevice.option.webgpu.description": "Бэкенд WebGPU/Metal",
	"omp.setting.providers.tinyModelDevice.option.cuda.label": "CUDA",
	"omp.setting.providers.tinyModelDevice.option.cuda.description": "NVIDIA CUDA (Linux x64)",
	"omp.setting.providers.tinyModelDevice.option.dml.label": "DirectML",
	"omp.setting.providers.tinyModelDevice.option.dml.description": "Бэкенд DirectML (Windows)",
	"omp.setting.providers.tinyModelDevice.option.coreml.label": "CoreML",
	"omp.setting.providers.tinyModelDevice.option.coreml.description":
		"Apple CoreML (включается вручную; может не загрузиться)",
	"omp.setting.providers.tinyModelDevice.option.auto.label": "Auto",
	"omp.setting.providers.tinyModelDevice.option.auto.description": "Позволить ONNX Runtime выбрать провайдера",
	"omp.setting.providers.tinyModelDevice.option.wasm.label": "WASM",
	"omp.setting.providers.tinyModelDevice.option.wasm.description": "Бэкенд WebAssembly",
	"omp.setting.providers.tinyModelDevice.option.webnn.label": "WebNN",
	"omp.setting.providers.tinyModelDevice.option.webnn.description": "Бэкенд WebNN",
	"omp.setting.providers.tinyModelDevice.option.webnn-gpu.label": "WebNN GPU",
	"omp.setting.providers.tinyModelDevice.option.webnn-gpu.description": "Устройство WebNN GPU",
	"omp.setting.providers.tinyModelDevice.option.webnn-cpu.label": "WebNN CPU",
	"omp.setting.providers.tinyModelDevice.option.webnn-cpu.description": "Устройство WebNN CPU",
	"omp.setting.providers.tinyModelDevice.option.webnn-npu.label": "WebNN NPU",
	"omp.setting.providers.tinyModelDevice.option.webnn-npu.description": "Устройство WebNN NPU",
	"omp.setting.providers.tinyModelDtype.label": "Tiny Model Precision",
	"omp.setting.providers.tinyModelDtype.description":
		"Квантование и точность ONNX для локальных tiny-моделей. По умолчанию используется dtype, поставляемый с каждой моделью (q4); меньшая точность быстрее, большая точнее. Игнорируется бэкендом MLX (его репозитории уже квантованы до 4 бит). Переменная окружения PI_TINY_DTYPE переопределяет эту настройку.",
	"omp.setting.providers.tinyModelDtype.option.default.label": "Default",
	"omp.setting.providers.tinyModelDtype.option.default.description":
		"dtype, поставляемый с каждой моделью (сейчас q4)",
	"omp.setting.providers.tinyModelDtype.option.q4.label": "q4",
	"omp.setting.providers.tinyModelDtype.option.q4.description": "4-битные веса; самые маленькие и быстрые",
	"omp.setting.providers.tinyModelDtype.option.q4f16.label": "q4f16",
	"omp.setting.providers.tinyModelDtype.option.q4f16.description": "4-битные веса с активациями fp16",
	"omp.setting.providers.tinyModelDtype.option.q8.label": "q8",
	"omp.setting.providers.tinyModelDtype.option.q8.description": "8-битное квантование",
	"omp.setting.providers.tinyModelDtype.option.fp16.label": "fp16",
	"omp.setting.providers.tinyModelDtype.option.fp16.description":
		"16-битное число с плавающей точкой; выше точность, больше размер",
	"omp.setting.providers.tinyModelDtype.option.fp32.label": "fp32",
	"omp.setting.providers.tinyModelDtype.option.fp32.description":
		"Полная точность; самый большой размер и самая низкая скорость",
	"omp.setting.providers.tinyModelDtype.option.int8.label": "int8",
	"omp.setting.providers.tinyModelDtype.option.int8.description": "Знаковое 8-битное целое",
	"omp.setting.providers.tinyModelDtype.option.uint8.label": "uint8",
	"omp.setting.providers.tinyModelDtype.option.uint8.description": "Беззнаковое 8-битное целое",
	"omp.setting.providers.tinyModelDtype.option.bnb4.label": "bnb4",
	"omp.setting.providers.tinyModelDtype.option.bnb4.description": "bitsandbytes, 4 бита",
	"omp.setting.providers.tinyModelDtype.option.q2.label": "q2",
	"omp.setting.providers.tinyModelDtype.option.q2.description": "2-битные веса",
	"omp.setting.providers.tinyModelDtype.option.q2f16.label": "q2f16",
	"omp.setting.providers.tinyModelDtype.option.q2f16.description": "2-битные веса с активациями fp16",
	"omp.setting.providers.tinyModelDtype.option.q1.label": "q1",
	"omp.setting.providers.tinyModelDtype.option.q1.description": "1-битные веса",
	"omp.setting.providers.tinyModelDtype.option.q1f16.label": "q1f16",
	"omp.setting.providers.tinyModelDtype.option.q1f16.description": "1-битные веса с активациями fp16",
	"omp.setting.providers.tinyModelDtype.option.auto.label": "Auto",
	"omp.setting.providers.tinyModelDtype.option.auto.description":
		"Позволить transformers.js выбрать для каждого устройства",
	"omp.setting.providers.kimiApiFormat.label": "Kimi API Format",
	"omp.setting.providers.kimiApiFormat.description":
		"Формат API для провайдера Kimi Code (авто следует актуальным метаданным модели)",
	"omp.setting.providers.kimiApiFormat.option.auto.label": "Auto",
	"omp.setting.providers.kimiApiFormat.option.auto.description": "Использовать протокол, объявленный сервером модели",
	"omp.setting.providers.kimiApiFormat.option.openai.label": "OpenAI",
	"omp.setting.providers.kimiApiFormat.option.openai.description": "api.kimi.com",
	"omp.setting.providers.kimiApiFormat.option.anthropic.label": "Anthropic",
	"omp.setting.providers.kimiApiFormat.option.anthropic.description": "api.moonshot.ai",
	"omp.setting.providers.openaiWebsockets.label": "OpenAI WebSockets",
	"omp.setting.providers.openaiWebsockets.description":
		"Политика WebSocket для моделей OpenAI Codex (авто использует настройки модели, вкл включает принудительно, выкл отключает)",
	"omp.setting.providers.openaiWebsockets.option.auto.label": "Auto",
	"omp.setting.providers.openaiWebsockets.option.auto.description":
		"Использовать поведение WebSocket по умолчанию у модели и провайдера",
	"omp.setting.providers.openaiWebsockets.option.off.label": "Off",
	"omp.setting.providers.openaiWebsockets.option.off.description": "Отключить WebSocket для моделей OpenAI Codex",
	"omp.setting.providers.openaiWebsockets.option.on.label": "On",
	"omp.setting.providers.openaiWebsockets.option.on.description":
		"Принудительно включить WebSocket для моделей OpenAI Codex",
	"omp.setting.providers.openaiLiveSteering.label": "OpenAI Live Steering",
	"omp.setting.providers.openaiLiveSteering.description":
		"Доставлять сообщения, введённые во время потоковой передачи ответа GPT-6, прямо в этот ответ через Codex WebSocket, вместо ожидания следующей границы инструмента",
	"omp.setting.providers.muse-code.storeResponses.label": "Muse Code Stored Responses",
	"omp.setting.providers.muse-code.storeResponses.description":
		"Сохранять результаты Muse Code на серверах Meta, чтобы ход с оборванным соединением восстанавливался, а не выполнялся заново. Сохранённые запуски хранят промпты и выводы на стороне Meta.",
	"omp.setting.providers.openai-codex.daybreak.label": "Codex Daybreak Blue",
	"omp.setting.providers.openai-codex.daybreak.description":
		"Автоматически запрашивать программу кибердоступа Daybreak Blue для аккаунтов ChatGPT, имеющих на неё право. OpenAI может использовать контент из сессий Daybreak Blue для улучшения своих моделей. Не распространяется на выделенные модели Daybreak Blue (gpt-daybreak-blue-*), которые всё равно могут выполняться как сессии Daybreak.",
	"omp.setting.providers.cacheRetention.label": "Prompt Cache Retention",
	"omp.setting.providers.cacheRetention.description":
		"Срок хранения кеша промптов, передаваемый провайдерам, которые его поддерживают (Anthropic, Bedrock, OpenRouter, OpenAI)",
	"omp.setting.providers.cacheRetention.option.auto.label": "Auto",
	"omp.setting.providers.cacheRetention.option.auto.description":
		"Значение провайдера по умолчанию — сессии подписчиков Anthropic OAuth по умолчанию 1 ч, ключи API — 5 мин; PI_CACHE_RETENTION всё ещё применяется",
	"omp.setting.providers.cacheRetention.option.short.label": "Short (5m)",
	"omp.setting.providers.cacheRetention.option.short.description":
		"Самые дешёвые записи в кеш; сочетайте с прогревом кеша, чтобы краткие записи жили в простое",
	"omp.setting.providers.cacheRetention.option.long.label": "Long (1h+)",
	"omp.setting.providers.cacheRetention.option.long.description":
		"Более длинный TTL там, где поддерживается (Anthropic/Bedrock 1 ч, OpenAI GPT-5.6+ Responses 12 ч); записи дороже, прогрев только во время активных запусков",
	"omp.setting.providers.cacheRetention.option.none.label": "Off",
	"omp.setting.providers.cacheRetention.option.none.description":
		"Отключить кеширование промптов и маршрутизацию по близости кеша",
	"omp.setting.providers.cacheWarming.label": "Cache Warming",
	"omp.setting.providers.cacheWarming.description":
		"Повторно отправлять последний запрос с бюджетом вывода в один токен незадолго до истечения записи его кеша промптов",
	"omp.setting.providers.cacheWarming.option.off.label": "Off",
	"omp.setting.providers.cacheWarming.option.off.description": "Отключить прогрев кеша",
	"omp.setting.providers.cacheWarming.option.streaming.label": "Streaming",
	"omp.setting.providers.cacheWarming.option.streaming.description":
		"Защищать дорогие префиксы во время долгих выполнений инструментов; останавливается, когда агент затихает",
	"omp.setting.providers.cacheWarming.option.idle.label": "Idle",
	"omp.setting.providers.cacheWarming.option.idle.description":
		"Также обновлять 5-минутные записи между запусками, пока ожидаемая экономия остаётся выше порога стоимости",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.label": "Stream First Event Timeout",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.description":
		"Сколько секунд ждать первого события потока модели; -1 использует настройки провайдера и окружения, 0 отключает сторожевой таймер",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.option.-1.label": "Auto",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.option.-1.description":
		"Использовать значения провайдера по умолчанию и переменные окружения тайм-аутов PI_*",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.option.0.label": "Off",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.option.0.description": "Отключить тайм-аут первого события",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.option.300.label": "5 minutes",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.option.600.label": "10 minutes",
	"omp.setting.providers.streamFirstEventTimeoutSeconds.option.1800.label": "30 minutes",
	"omp.setting.providers.streamIdleTimeoutSeconds.label": "Stream Idle Timeout",
	"omp.setting.providers.streamIdleTimeoutSeconds.description":
		"Сколько секунд поток модели может молчать между событиями; -1 использует настройки провайдера и окружения, 0 отключает сторожевой таймер",
	"omp.setting.providers.streamIdleTimeoutSeconds.option.-1.label": "Auto",
	"omp.setting.providers.streamIdleTimeoutSeconds.option.-1.description":
		"Использовать значения провайдера по умолчанию и переменные окружения тайм-аутов PI_*",
	"omp.setting.providers.streamIdleTimeoutSeconds.option.0.label": "Off",
	"omp.setting.providers.streamIdleTimeoutSeconds.option.0.description": "Отключить тайм-аут простоя",
	"omp.setting.providers.streamIdleTimeoutSeconds.option.300.label": "5 minutes",
	"omp.setting.providers.streamIdleTimeoutSeconds.option.600.label": "10 minutes",
	"omp.setting.providers.streamIdleTimeoutSeconds.option.1800.label": "30 minutes",
	"omp.setting.providers.openrouterVariant.label": "OpenRouter Routing",
	"omp.setting.providers.openrouterVariant.description":
		"Суффикс варианта маршрутизации по умолчанию, добавляемый к ID моделей OpenRouter (переопределяется, если селектор уже указывает вариант)",
	"omp.setting.providers.openrouterVariant.option.default.label": "Default",
	"omp.setting.providers.openrouterVariant.option.default.description":
		"Без суффикса; использовать маршрутизацию OpenRouter по умолчанию",
	"omp.setting.providers.openrouterVariant.option.nitro.label": ":nitro",
	"omp.setting.providers.openrouterVariant.option.nitro.description":
		"Приоритет пропускной способности и минимальной задержке",
	"omp.setting.providers.openrouterVariant.option.floor.label": ":floor",
	"omp.setting.providers.openrouterVariant.option.floor.description":
		"Приоритет самому дешёвому доступному провайдеру",
	"omp.setting.providers.openrouterVariant.option.online.label": ":online",
	"omp.setting.providers.openrouterVariant.option.online.description": "Включить плагин веб-поиска OpenRouter",
	"omp.setting.providers.openrouterVariant.option.exacto.label": ":exacto",
	"omp.setting.providers.openrouterVariant.option.exacto.description":
		"Отобранные вручную провайдеры высокого качества (определены только для отдельных моделей)",
	"omp.setting.live.voice.label": "Live Voice",
	"omp.setting.live.voice.description":
		"Голос, используемый сессиями голосового общения в реальном времени на базе Codex",
	"omp.setting.live.voice.option.arbor.label": "Arbor",
	"omp.setting.live.voice.option.breeze.label": "Breeze",
	"omp.setting.live.voice.option.cove.label": "Cove",
	"omp.setting.live.voice.option.ember.label": "Ember",
	"omp.setting.live.voice.option.juniper.label": "Juniper",
	"omp.setting.live.voice.option.maple.label": "Maple",
	"omp.setting.live.voice.option.sol.label": "Sol",
	"omp.setting.live.voice.option.spruce.label": "Spruce",
	"omp.setting.live.voice.option.vale.label": "Vale",
	"omp.setting.tts.localVoice.label": "Local TTS Voice",
	"omp.setting.tts.localVoice.description":
		"Голос Kokoro, используемый локальным бэкендом TTS (американский/британский, женский/мужской)",
	"omp.setting.tts.localVoice.option.af_heart.label": "Heart (American female)",
	"omp.setting.tts.localVoice.option.af_bella.label": "Bella (American female)",
	"omp.setting.tts.localVoice.option.af_nicole.label": "Nicole (American female)",
	"omp.setting.tts.localVoice.option.af_aoede.label": "Aoede (American female)",
	"omp.setting.tts.localVoice.option.af_kore.label": "Kore (American female)",
	"omp.setting.tts.localVoice.option.af_sarah.label": "Sarah (American female)",
	"omp.setting.tts.localVoice.option.am_michael.label": "Michael (American male)",
	"omp.setting.tts.localVoice.option.am_fenrir.label": "Fenrir (American male)",
	"omp.setting.tts.localVoice.option.am_puck.label": "Puck (American male)",
	"omp.setting.tts.localVoice.option.bf_emma.label": "Emma (British female)",
	"omp.setting.tts.localVoice.option.bm_george.label": "George (British male)",
	"omp.setting.tts.localVoice.option.bm_fable.label": "Fable (British male)",
	"omp.setting.tts.localSpeed.label": "Local TTS Speed",
	"omp.setting.tts.localSpeed.description":
		"Скорость речи локального бэкенда TTS (инструмент tts, omp say). 1 = обычная; ограничено 0.5–2.5",
	"omp.setting.tts.localSpeed.option.0.5.label": "0.5×",
	"omp.setting.tts.localSpeed.option.0.75.label": "0.75×",
	"omp.setting.tts.localSpeed.option.1.label": "1× (normal)",
	"omp.setting.tts.localSpeed.option.1.25.label": "1.25×",
	"omp.setting.tts.localSpeed.option.1.5.label": "1.5×",
	"omp.setting.tts.localSpeed.option.1.75.label": "1.75×",
	"omp.setting.tts.localSpeed.option.2.label": "2×",
	"omp.setting.tts.localSpeed.option.2.5.label": "2.5×",
	"omp.setting.speech.enabled.label": "Speech Vocalization",
	"omp.setting.speech.enabled.description":
		"Проговаривать вывод ассистента вслух через динамики по мере потоковой передачи",
	"omp.setting.speech.mode.label": "Speech Vocalization Mode",
	"omp.setting.speech.mode.description":
		"Что озвучивать: all — сообщения ассистента + рассуждения; assistant — только сообщения; yield — только финальное сообщение в конце хода",
	"omp.setting.speech.mode.option.all.label": "All (messages + thinking)",
	"omp.setting.speech.mode.option.assistant.label": "Assistant messages",
	"omp.setting.speech.mode.option.yield.label": "Final message only",
	"omp.setting.speech.enhanced.label": "Enhanced Speech Rewriting",
	"omp.setting.speech.enhanced.description":
		"Переписывать вывод ассистента в естественную устную прозу tiny/smol-моделью перед синтезом (описывает код, убирает ссылки и markdown). При ошибке переключается на механическую очистку",
	"omp.setting.speech.voice.label": "Speech Vocalization Voice",
	"omp.setting.speech.voice.description": "Голос Kokoro, используемый при проговаривании вывода ассистента вслух",
	"omp.setting.speech.voice.option.af_heart.label": "Heart (American female)",
	"omp.setting.speech.voice.option.af_bella.label": "Bella (American female)",
	"omp.setting.speech.voice.option.af_nicole.label": "Nicole (American female)",
	"omp.setting.speech.voice.option.af_aoede.label": "Aoede (American female)",
	"omp.setting.speech.voice.option.af_kore.label": "Kore (American female)",
	"omp.setting.speech.voice.option.af_sarah.label": "Sarah (American female)",
	"omp.setting.speech.voice.option.am_michael.label": "Michael (American male)",
	"omp.setting.speech.voice.option.am_fenrir.label": "Fenrir (American male)",
	"omp.setting.speech.voice.option.am_puck.label": "Puck (American male)",
	"omp.setting.speech.voice.option.bf_emma.label": "Emma (British female)",
	"omp.setting.speech.voice.option.bm_george.label": "George (British male)",
	"omp.setting.speech.voice.option.bm_fable.label": "Fable (British male)",
	"omp.setting.speech.speed.label": "Speech Vocalization Speed",
	"omp.setting.speech.speed.description":
		"Скорость речи при чтении вывода ассистента вслух. 1 = обычная; ограничено 0.5–2.5",
	"omp.setting.speech.speed.option.0.5.label": "0.5×",
	"omp.setting.speech.speed.option.0.75.label": "0.75×",
	"omp.setting.speech.speed.option.1.label": "1× (normal)",
	"omp.setting.speech.speed.option.1.25.label": "1.25×",
	"omp.setting.speech.speed.option.1.5.label": "1.5×",
	"omp.setting.speech.speed.option.1.75.label": "1.75×",
	"omp.setting.speech.speed.option.2.label": "2×",
	"omp.setting.speech.speed.option.2.5.label": "2.5×",
	"omp.setting.providers.fetch.label": "Fetch Provider",
	"omp.setting.providers.fetch.description": "Приоритет бэкендов чтения для инструмента fetch/read URL",
	"omp.setting.providers.fetch.option.auto.label": "Auto",
	"omp.setting.providers.fetch.option.auto.description":
		"Приоритет: native > trafilatura > lynx > parallel > firecrawl > jina",
	"omp.setting.providers.fetch.option.native.label": "Native",
	"omp.setting.providers.fetch.option.native.description": "Встроенный конвертер HTML→Markdown (доступен всегда)",
	"omp.setting.providers.fetch.option.trafilatura.label": "Trafilatura",
	"omp.setting.providers.fetch.option.trafilatura.description": "Устанавливается автоматически через uv/pip",
	"omp.setting.providers.fetch.option.lynx.label": "Lynx",
	"omp.setting.providers.fetch.option.lynx.description": "Требуется системный пакет lynx",
	"omp.setting.providers.fetch.option.parallel.label": "Parallel",
	"omp.setting.providers.fetch.option.parallel.description": "Требуется PARALLEL_API_KEY",
	"omp.setting.providers.fetch.option.firecrawl.label": "Firecrawl",
	"omp.setting.providers.fetch.option.firecrawl.description": "Требуется FIRECRAWL_API_KEY",
	"omp.setting.providers.fetch.option.jina.label": "Jina",
	"omp.setting.providers.fetch.option.jina.description": "Использует ридер r.jina.ai (JINA_API_KEY необязателен)",
	"omp.setting.codexResets.autoRedeem.label": "Codex Auto-Redeem Saved Resets",
	"omp.setting.codexResets.autoRedeem.description":
		"Автоматически расходовать сохранённые сбросы лимитов Codex: восстанавливать аккаунт, заблокированный исчерпанным 5-часовым или недельным окном, когда ход завис и ни один другой аккаунт не может его взять, и спасать кредиты, срок которых скоро истекает. unset спрашивает перед первым расходом (без интерфейса запроса расходуется только сброс, истекающий в течение 5 минут), yes расходует без запроса, а no отключает обе проверки.",
	"omp.setting.codexResets.autoRedeem.option.unset.label": "Unset",
	"omp.setting.codexResets.autoRedeem.option.unset.description":
		"Проверять право, затем спрашивать перед расходом первого сохранённого сброса. Без интерфейса запроса расходовать только сброс, истекающий в течение 5 минут.",
	"omp.setting.codexResets.autoRedeem.option.yes.label": "Yes",
	"omp.setting.codexResets.autoRedeem.option.yes.description":
		"Расходовать подходящие сохранённые сбросы без запроса.",
	"omp.setting.codexResets.autoRedeem.option.no.label": "No",
	"omp.setting.codexResets.autoRedeem.option.no.description":
		"Не запускать проверку автоматического использования сохранённых сбросов.",
	"omp.setting.codexResets.minBlockedMinutes.label": "Codex Auto-Redeem Min Block",
	"omp.setting.codexResets.minBlockedMinutes.description":
		"Автоматически использовать сброс только когда естественная разблокировка — последний сброс среди исчерпанных 5-часовых и недельных окон — наступает не раньше чем через столько минут (не тратьте дефицитный кредит ради короткого ожидания). Увеличьте значение (например, 360), чтобы игнорировать блокировки только по 5-часовому окну.",
	"omp.setting.codexResets.keepCredits.label": "Codex Auto-Redeem Reserve",
	"omp.setting.codexResets.keepCredits.description":
		"Никогда не расходовать автоматически, если сохранённых сбросов остаётся меньше этого числа (0 = последний кредит может быть израсходован автоматически). Кредиты с истекающим сроком исключены — зарезервированный кредит, который истекает, ничего не сохраняет.",
	"omp.setting.codexResets.salvageHorizonHours.label": "Codex Reset Salvage Horizon",
	"omp.setting.codexResets.salvageHorizonHours.description":
		"При включённом автоиспользовании расходовать сохранённый сброс Codex в течение стольких часов до истечения, если любое из окон чата имеет значимое использование. 0 отключает раннее спасение; кредиты, истекающие в течение 5 минут, всё равно используются независимо от использования.",
	"omp.setting.claudeResets.autoRedeem.label": "Claude Auto-Redeem Resets",
	"omp.setting.claudeResets.autoRedeem.description":
		"Автоматически расходовать подходящие сбросы Claude Cedar или Juniper. Cedar расходуется только для покрытых лимитов; Juniper может восстановить только единственную 5-часовую блокировку. unset спрашивает перед первым расходом (без интерфейса запроса расходуется только сброс, истекающий в течение 5 минут), yes расходует без запроса, а no отключает восстановление после блокировки и спасение по истечении.",
	"omp.setting.claudeResets.autoRedeem.option.unset.label": "Unset",
	"omp.setting.claudeResets.autoRedeem.option.unset.description":
		"Проверять актуальное право, затем спрашивать перед расходом первого сброса Claude. Без интерфейса запроса расходовать только сброс, истекающий в течение 5 минут.",
	"omp.setting.claudeResets.autoRedeem.option.yes.label": "Yes",
	"omp.setting.claudeResets.autoRedeem.option.yes.description": "Расходовать подходящие сбросы Claude без запроса.",
	"omp.setting.claudeResets.autoRedeem.option.no.label": "No",
	"omp.setting.claudeResets.autoRedeem.option.no.description":
		"Не запускать проверки автоматического использования сбросов Claude.",
	"omp.setting.claudeResets.minBlockedMinutes.label": "Claude Auto-Redeem Min Block",
	"omp.setting.claudeResets.minBlockedMinutes.description":
		"Автоматически использовать сброс только когда естественная разблокировка — последний сброс среди исчерпанных покрытых окон — наступает не раньше чем через столько минут. Сброс только по 5-часовому окну никогда не используется для недельной блокировки или блокировки отдельной модели.",
	"omp.setting.claudeResets.keepCredits.label": "Claude Auto-Redeem Reserve",
	"omp.setting.claudeResets.keepCredits.description":
		"Держать в запасе не менее такого числа сбросов Claude (0 позволяет автоматически израсходовать последний подходящий сброс). Резерв применяется к раннему спасению, но не к подходящим сбросам, истекающим в течение 5 минут.",
	"omp.setting.claudeResets.salvageHorizonHours.label": "Claude Reset Salvage Horizon",
	"omp.setting.claudeResets.salvageHorizonHours.description":
		"При включённом автоиспользовании использовать выбранный сервером сброс Cedar в течение стольких часов до истечения, если его покрытые окна имеют значимое использование. 0 отключает раннее спасение; подходящие сбросы Cedar или Juniper, истекающие в течение 5 минут, всё равно используются независимо от использования или резерва. Требования к лимитам провайдера по-прежнему действуют.",
	"omp.setting.provider.appendOnlyContext.label": "Append-Only Context",
	"omp.setting.provider.appendOnlyContext.description":
		"Кешировать системный промпт и спецификации инструментов и вести журнал сообщений только с добавлением, чтобы префиксные кеши провайдера (DeepSeek, Xiaomi/SGLang, Anthropic) срабатывали с максимальной частотой. Авто включает для известных провайдеров с префиксным кешем.",
	"omp.setting.provider.appendOnlyContext.option.auto.label": "Auto",
	"omp.setting.provider.appendOnlyContext.option.auto.description":
		"Включать для известных провайдеров с префиксным кешем (рекомендуется)",
	"omp.setting.provider.appendOnlyContext.option.on.label": "On",
	"omp.setting.provider.appendOnlyContext.option.on.description": "Всегда включать контекст только с добавлением",
	"omp.setting.provider.appendOnlyContext.option.off.label": "Off",
	"omp.setting.provider.appendOnlyContext.option.off.description": "Отключать контекст только с добавлением",
	"omp.setting.telemetry.otlpExportEnabled.label": "OTLP Telemetry Export",
	"omp.setting.telemetry.otlpExportEnabled.description":
		"Разрешить OMP экспортировать трассировки, журналы и метрики через эндпоинты OTEL_*. Изменения вступают в силу при следующем запуске.",
	"omp.setting.exa.enabled.label": "Exa",
	"omp.setting.exa.enabled.description": "Включать провайдера веб-поиска Exa",
	"omp.setting.exa.searchDelayMs.label": "Exa Search Delay",
	"omp.setting.exa.searchDelayMs.description":
		"Минимальная задержка между запросами веб-поиска Exa в миллисекундах; установите 0, чтобы отключить ограничение частоты",
	"omp.setting.searxng.endpoint.label": "SearXNG Endpoint",
	"omp.setting.searxng.endpoint.description":
		"Базовый URL самостоятельно размещённого экземпляра SearXNG, используемого для веб-поиска",
	"omp.setting.secrets.enabled.label": "Hide Secrets",
	"omp.setting.secrets.enabled.description":
		"Обфусцировать настроенные секреты и вымарывать токены, похожие на учётные данные, перед отправкой провайдерам ИИ",
};
