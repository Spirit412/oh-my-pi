# Plan: omp-stats → Ant Design + Recharts + i18n (en/ru)

## Context

Пользователь запросил два изменения пакета `packages/stats` (дашборд `omp stats`):
1. Полный перевод клиентского UI (`src/client`, ~7k строк) с самописных SVG-компонентов на **Ant Design v6** (компоненты) + **Recharts v3** (графики) + `lucide-react` (иконки, уже был).
2. **i18n с русской локализацией**: словари живут в пакете `omp-stats`, но выбор языка определяется пользовательскими настройками omp — настройка `language` (`~/.omp/config.yml`, env `OMP_LANG`), те же источники, что у CLI-локали (`resolveLocale` в `packages/coding-agent/src/i18n/locale.ts`: CLI > `OMP_LANG`/setting > системные `LC_ALL`/`LC_MESSAGES`/`LANG` > en).

Технические документы по этой работе сохранять в `D:\Obsidian\oh-my-pi\stats\` (vault oh-my-pi).

## Что УЖЕ сделано (проверено чтением файлов в этой сессии — не переделывать)

1. **Зависимости** (`packages/stats/package.json`, bun.lock): добавлены `antd@6.6.8`, `recharts@3.10.1`, `dayjs@1.11.23`, `yaml`. React 19.2.7 — совместим.
2. **Серверная локаль** — `packages/stats/src/locale.ts` (новый): `resolveDashboardLocale(env)` = `OMP_LANG` → `language` из `getAgentDir()/config.yml` (парсинг `yaml`, `auto`/отсутствие → дальше) → `LC_ALL`/`LC_MESSAGES`/`LANG` → `en`; `normalizeDashboardLocale(tag)` → `"en" | "ru"`.
3. **Инъекция в HTML** — `packages/stats/src/server.ts`: функция `indexHtmlResponse(read)` заменяет `<html lang="en">` на resolved locale и вставляет `<script>window.__OMP_DASHBOARD_CONFIG__ = {"locale":"..."};</script>` после `<head>`; применена во всех трёх ветках `handleStatic` (embedded-архив, прямой index.html, SPA fallback).
4. **i18n-ядро** — `src/client/i18n/index.ts`: типы `DashboardLocale`, `PluralForms`, `MessageEntry`, `MessageDict`; чтение стартовой локали из `window.__OMP_DASHBOARD_CONFIG__`; **glob-импорт** `import.meta.glob("./routes/*.ts", { eager: true })` мержит словари роутов (проверено: Bun.build компилирует); экспорты `t(key, params?)` (`{name}`-интерполяция; plural-выбор по `params.count` — ru one/few/many/other, en one/other), `useT()`, `getLocale()`, `intlLocale()`; boot-проверка парности ключей en/ru (console.warn).
5. **Общий словарь** — `src/client/i18n/common.ts` (экспорты `en`, `ru`): nav.*, nav.group.*, shell.*, range.1h…all + range.window.*, theme.*, live.* (включая plural-формы minutesAgo/hoursAgo/daysAgo), state.empty/state.retry/chart.empty/common.close, format.secondsSuffix/format.minutesSeconds/format.hoursMinutes.
6. **Локальные даты** — `src/client/i18n/dates.ts`: `formatDate(ts, pattern)` (patterns: `"HH:mm" | "MMM d" | "MMM d HH:mm" | "MMM d, HH:mm:ss"` через Intl, ru-RU/en-US) и `formatRelativeTime(ts)` (Intl.RelativeTimeFormat).
7. **Локализованные форматтеры** — `src/client/data/formatters.ts`: `intlLocale()` вместо NUMBER_LOCALE, `formatDurationMs` через `format.secondsSuffix`, `formatElapsed` через format.minutesSeconds/hoursMinutes, `formatTimestamp` через `formatDate`, `formatRelativeTime` — обёртка над dates.ts. И `src/client/data/range.ts`: из `RangeMeta` удалены `label`/`windowLabel` — теперь функции `rangeLabel(range)` / `rangeWindowLabel(range)` через `t()`; `formatBucket`/`formatTick` через `formatDate`.
8. **AntD-провайдер** — `src/client/antd.tsx`: `AntdProvider` (ConfigProvider: algorithm dark/light от `useSystemTheme()`, brand-токены colorPrimary #f068c8/#c42596, antd locale ruRU/enUS, dayjs locale ru). Смонтирован в `src/client/App.tsx` вокруг LiveProvider.
9. **Готовые срезы** (переписаны агентами по контрактам ниже, TypeScript-clean по их проверкам): `charts/` (Chart/Sparkline на Recharts, props нетронуты; BarList/ShareBar/Legend без изменений API), `ui/` (все компоненты на antd, экспорты/props нетронуты; `ui/modal.css` удалён), `app/` (Shell на antd Layout/Menu/Segmented, ShellProps прежний; nav.ts теперь `labelKey`/`headingKey`; LiveChip/ThemeToggle локализованы), `traces/` (i18n + antd-рестайл, canvas-движок сохранён; `traces/traces.css` удалён). Словари агентов уже в `src/client/i18n/routes/`: `charts.ts`, `common-ui.ts`, `shell.ts`, `traces.ts`.
10. Сессионная настройка `cfg://task/agentModelOverrides.task = kimi-code/kimi-for-coding` (session-only; исходный `zai/glm-5.3-flash` без баланса — 429). Контингентность: если при делегировании снова 429 — записать значение ещё раз или делать срез собственными силами.

## Контракты (обязательны для всех оставшихся и интеграционных правок)

- Словарь среза: файл `src/client/i18n/routes/<section>.ts`, формат `import type { MessageDict } from "../index"; export const en: MessageDict = {...}; export const ru: MessageDict = {...};`. Русский — обязателен, грамматичный. Общие ключи (`state.empty`, `state.retry`, `chart.empty`, `common.close`, `range.*`, `format.*`, `live.*`, `theme.*`, `nav.*`, `shell.*`) не дублировать — брать из common.
- Компоненты: `../ui` и `../charts` — импортировать с прежними props; antd-компоненты напрямую для вёрстки (Typography, Space, Tag, Button, Empty…). Иконки — только `lucide-react`, `@ant-design/icons` не использовать.
- Props роутов не менять (`active`, `range`, `onRequestClick`…). `App.tsx` и `test/errors-route-range.test.tsx` компилируются против них без правок.
- Правила репо: без `any` (кроме крайних случаев), только top-level импорты, правки через edit/write.
- Прав `styles.css` у срезов нет — только CSS-переменные выживают: `--accent`, `--accent-soft`, `--accent-line`, `--chart-primary`, `--chart-secondary`, `--chart-grid`, `--chart-axis`, `--chart-cursor` (+ токены цветов поверхностей, если canvas traces их читает).

## Approach — оставшиеся шаги

### Шаг 1. Дождаться/проверить срезы роутов (4 агента запущены)
Срезы: `RoutesOverviewCosts` (OverviewRoute, CostsRoute, costs.css), `RoutesRequestsErrors` (RequestsRoute, ErrorsRoute, ui/RequestDrawer.tsx + request-drawer.css, errors.css), `RoutesModelsProviders` (Models/Providers/Projects + их css), `RoutesToolsFrustration` (Tools/Frustration/Gain + tools.css/frustration.css). Если агент упал/не завершился — выполнить срез собственными силами по контрактам: все строки UI → словарь `i18n/routes/<section>.ts` (en+ru), вёрстка → antd/`../ui`/`../charts` с прежними props, css-файл среза удалить, портировать стили в antd tokens/inline styles.
Критерий приёмки среза: ни одной английской строки, видимой пользователю, вне `t()`; css-файл среза удалён; импорты `.css` из роутов отсутствуют.

### Шаг 2. TracesRoute.tsx (`src/client/routes/TracesRoute.tsx`, 209 строк)
Это единственный файл роута вне срезов. Изменения:
1. Удалить `import "../traces/traces.css";` (файл уже удалён traces-срезом — сборка иначе падает).
2. Класс `.traces-models` (model cell в списке сессий) заменить inline-стилями: `display: "inline-flex", alignItems: "center", gap: 6, maxWidth: 220, minWidth: 0` + вторичный цвет текста через `theme.useToken()` (`token.colorTextSecondary`).
3. Все пользовательские строки файла → новый словарь `src/client/i18n/routes/traces-route.ts` (en+ru) по контракту; импорты из `../traces` (TraceView и пр.) и props роута (`active`, `session`, `onOpenSession`) не менять.

### Шаг 3. Интеграционный типчек и починка стыков
1. `bun run check:types` в `packages/stats` (tsgo по `tsconfig.json` — сервер, и `tsconfig.client.json` — клиент). Починить все ошибки на стыках срезов (типичные: остатки `rangeMeta().label/windowLabel` → `rangeLabel()/rangeWindowLabel()`; старые CSS-классы; несовпадения ключей словарей — boot-warns про missing en/ru тоже закрыть добавлением ключей).
2. `bun run lint` (oxlint) в пакете — исправить ошибки.
3. `bun test test/errors-route-range.test.tsx` — существующий тест обязан проходить: ровно те же fetch-URL `/api/stats/errors?range=24h&limit=50` и повторный запрос при смене диапазона (props и data-flow ErrorsRoute не менялись срезом — если тест красный, правка только в срезе requests/errors).

### Шаг 4. Чистка styles.css
Файл `src/client/styles.css` (~660 строк) сжать до пережившего набора:
1. Оставить: CSS-переменные тем (:root/[data-theme] — обе рампы), font-стеки, reset/box-sizing, тонкие скроллбары, `[hidden]`-правило, reduced-motion блок, классы реально используемые после срезов: `.chart-tooltip*` (tooltip Recharts-графиков), `.legend*`, `.swatch`, `.bar-list*`, `.share-bar*`, `.sparkline`, анимации `.spin`/pulse-keyframes если остались ссылки.
2. Удалить всё компонентное: `.topbar*`, `.sidebar*`, `.nav-*`, `.btn*`, `.card*`, `.table*`, `.modal*`, `.drawer*`, `.empty*`, `.error-state*`, `.skeleton*`, `.stat*`, `.segmented*`, `.badge*`, `.json-block*`, `.search-input*`, `.live-chip*`, `.kpi*`, `.page-header*` и т.п.
3. Метод: перед удалением класса — `grep -rn "\.classname" src/client --include="*.tsx" --include="*.ts"`; если ссылок в tsx нет (только в styles.css) — удалять. Итеративно до фикс-поинта. `css.d.ts` не трогать.
4. Проверить после: `grep -rn "styles.css" src/client --include="*.tsx" --include="*.ts"` — оставаться должен только импорт в `index.tsx`.

### Шаг 5. Сборка и встраиваемый бандл
1. `bun run build` в `packages/stats` (Bun.build клиента → `dist/client`; index.html генерируется build.ts с плейсхолдером `lang="en"` — инъекция сервером его перезаписывает, это нормально).
2. `bun run gen:stats` (генерация `src/embedded-client.generated.txt` — байт-стабильный gzip-тар для встраивания в бинарь).
3. Зафиксировать в отчёте размер `dist/client/index.js` до/после (ожидается заметный рост за счёт antd+recharts — пользователь его принял при утверждении задачи).

### Шаг 6. Смоук-запуск сервера и проверка локали
1. Поднять дашборд программно: `bun -e 'const {startServer}=await import("./src/server.ts"); await startServer(3847,"127.0.0.1")'` в `packages/stats` (или `bun run src/index.ts`) как фоновый процесс.
2. `curl -s http://127.0.0.1:3847/ | grep -o 'lang="[a-z]*"'` и `grep -o '__OMP_DASHBOARD_CONFIG__ = {[^}]*}'`:
   - с env `OMP_LANG=ru` → `lang="ru"`, `"locale":"ru"`;
   - без env при отсутствующем/«auto» `language` в `~/.omp/config.yml` → `lang="en"`;
   - с `language: ru` в `~/.omp/config.yml` (файл НЕ изменять пользовательский — тест через временный `OMP_CONFIG_DIR`-подобный механизм недоступен: getAgentDir фиксирован; проверить чтением кода + кейс OMP_LANG, либо временно подложить config.yml и удалить — только если `~/.omp/config.yml` отсутствует; иначе пропустить этот подкейс и отметить).
3. Служебные пути: `/api/status` → 200 JSON; несуществующий путь → SPA fallback с инъекцией.

### Шаг 7. Браузерный смоук (en + ru)
Через browser-инструмент: открыть `http://127.0.0.1:3847/`, дождаться рендера, проверить: sidebar с 11 пунктами навигации, заголовок страницы Overview, графики Recharts отрисованы (svg в DOM), переключение диапазона Segmented работает. Перезапуск сервера с `OMP_LANG=ru`, перезагрузка: навигация/заголовки/кнопки на русском («Обзор», «Запросы», «Повторить»), даты в подписях осей кириллицей/ru-форматом, plural работает (число запросов во множественной форме). Оба скриншота приложить к отчёту. Закрыть вкладки, остановить сервер.

### Шаг 8. Документы в Obsidian
Сохранить в `D:\Obsidian\oh-my-pi\stats\`:
1. `architecture.md` — новый стек клиента (AntD v6 + Recharts v3 + lucide-react), устройство i18n (серверный резолв `locale.ts` → инъекция `__OMP_DASHBOARD_CONFIG__` → glob-словари `i18n/routes/*.ts`, plural-правила), тема (`antd.tsx`, brand-токены), контракт словаря с примером.
2. Копию утверждённого плана `stats-antd-i18n-rewrite-plan.md`.
Создать каталог `D:\Obsidian\oh-my-pi\stats`, если отсутствует. Больше ничего в vault не писать.

## Critical files & anchors

- `packages/stats/src/server.ts` — `handleStatic` (~строка 361): три ветки отдачи index.html через `indexHtmlResponse`; здесь же `resolveDashboardLocale` импорт из `./locale`.
- `packages/stats/src/locale.ts` — весь резолв локали; зеркало приоритетов `packages/coding-agent/src/i18n/locale.ts` (CLI > config > система > en).
- `packages/stats/src/client/i18n/index.ts` — glob `./routes/*.ts`, `t()`/`PluralForms`; boot-парность ключей.
- `packages/stats/src/client/antd.tsx` — ConfigProvider (brand, dark/light, ruRU/enUS).
- `packages/stats/src/client/styles.css` — точка чистки (Шаг 4).

## Verification

1. `cd packages/stats && bun run check:types && bun run lint` — зелёное.
2. `cd packages/stats && bun test test/errors-route-range.test.tsx` — зелёное (стабильные URL fetch'ей).
3. Шаги 6–7 выше: инъекция locale (curl-проверки) + браузерные смоуки en/ru со скриншотами.
4. Boot-console дашборда без warn'ов `[i18n] missing …` (парность словарей) — видно в консоли браузера при обеих локалях.

## Assumptions & contingencies

- Рост размера клиентского бандла (antd/recharts) принят пользователем осознанно — не оптимизировать (no code-splitting в этом плане).
- Если `~/.omp/config.yml` у пользователя существует и содержит `language` — подкейс «language: ru из config.yml» проверяется чтением `locale.ts` и кейсом `OMP_LANG=ru`, файл пользователя не модифицировать.
- Если какой-либо срез-агент завершился с ошибкой 429 (баланс модели) — записать `cfg://task/agentModelOverrides` = `{"task":"kimi-code/kimi-for-coding"}` ещё раз и перезапустить; либо выполнить срез собственными силами по контрактам раздела «Контракты».
- Скриншоты браузерного смоука: если headless-окружение не отдаёт canvas/шрифты — зафиксировать DOM-проверки (тексты узлов) вместо пиксельных.
