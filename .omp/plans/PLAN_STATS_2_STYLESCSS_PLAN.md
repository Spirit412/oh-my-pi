# Plan: stats — этап 2: чистка styles.css, доводка локализации, написание тестов (без прогона), коммит

## Context

Продолжение утверждённого рерайта дашборда omp-stats на AntD + Recharts + i18n (en/ru). Этап 1 выполнен и закоммичен: все срезы (charts/ui/app/traces/12 роутов) на месте, `tsgo` (client+server+coding-agent) и oxlint чисты, коммиты `f1a158f` (Tep one) + `d5b8406` (последний срез). Этот этап — `PLAN-02` из staged-планов (`D:\Obsidian\oh-my-pi\stats\PLAN-02-styles-cleanup.md`): сжать `src/client/styles.css` (1836 строк) до пережившего набора, убрать остаточную английскую локализацию (`toolCallSource`, `(root)`), написать тесты (НЕ запуская их) и сделать коммит. Тесты запрещены на этом этапе пользователем; рантайм-прогон — этап PLAN-05.

## Состояние (проверено grep'ами этой сессии)

- Живые className-классы в tsx: `num`(25), `dim`(10), `chart-tooltip-{value,row,label,total,title}`(29), `stack`(7), `muted`(7), `row`(6), `mono`(6), `section-label`(4), `truncate`(3), `page`(3), `swatch`, `legend-item`, `legend-value`, `legend`, `grid`, `grid-2`, `grid-main-side`, `bar-list-*`, `share-bar*`, `sparkline`, `tone-bad` + динамические `tone-${errorRateTone(...)}` (ModelsRoute:544 → `tone-neutral/ok/warn/bad/accent`), `rise`(ModelsRoute:525), `micro`, `check`(ProjectsRoute:189), `cell-primary`, `chart`, `chart-empty`, `chart-tooltip`. Динамические: ProvidersRoute `num dim`/`num`/`muted`; Card в `ui/Card.tsx` принимает `className?`, но никто не передаёт (оставить проп, не трогать).
- Keyframes: `.rise` (ModelsRoute) — единственный живой класс анимации из styles.css; LiveChip/Badge инжектят собственные (`omp-chip-*`, `ui-dot-pulse`) — не зависят от styles.css.
- Chart.tsx (Recharts) читает CSS-VARS `--chart-grid`/`--chart-axis` (пропы stroke/fill) — vars остаются; классы `.chart-grid/.chart-axis/.chart-cursor/.chart-bar[data-hover]/.chart[data-hovering]` в tsx не используются → удалить.
- Атрибутные правила в styles.css: `[data-stale="true"]` (1463), `[data-stale="false"]` (1468), `.legend-item[data-off="true"]` (1754) — живые (data-stale на всех роутах); `.topbar[data-scrolled]`, `.topbar-progress-fill[data-indeterminate]`, `.nav-row[data-active]`, `.sidebar[data-open]`, `.segmented-option[data-active]`, `.tab[data-active]`, `.chart[data-hovering]` — мертвы, удалить вместе с секциями.
- Секции styles.css: vars (1–133), Reset&base (134–243, в т.ч. `kbd` base на 219), Type utilities (244–303), Motion (304–390, reduced-motion 381–388), Shell topbar/sidebar (391–661, `.page` на 665 — вне секции Shell, в блоке Page header), Page header (662–739), Card (740–813), Stat (814–905), Controls (906–1166), Badge&dot (1167–1257), Table (1258–1406), States (1407–1471, `[data-stale]` внутри), Drawer (1472–1588), Live chip (1589–1617), Charts (1618–1836).
- `data/view-models.ts:408-413`: `toolCallSource(call)` возвращает строки «MCP · unknown server»/«Skill · unnamed»/«Script · inline»/«Built-in». Call-site'ы ровно два: `routes/ToolsRoute.tsx:320-321` (sort + render) и `ui/RequestDrawer.tsx:299` (render). Файл — клиентский (сервером не импортируется).
- Словари `i18n/routes/*.ts` импортируют только `import type { MessageDict }` → цепочка `client/i18n` не тянет pi-utils → тесты словарей/форматтеров рантайм-независимы от pi-natives (в отличие от `test/locale.test.ts`, который импортирует `src/locale.ts` → pi-utils).
- `data/formatters.ts` `formatFolder` возвращает `"(root)"` для пустой папки.

## Approach

### Шаг 1. Переписать `src/client/styles.css` целиком (write, ~250 строк)
Keep-list (переписать компактно, значения брать из текущего файла):
1. Все CSS-переменные обеих рамп (`:root` и `[data-theme]`, секция 1–133 целиком) + font-стеки + радиусы/тени/easing/размеры (внутри той же секции).
2. Reset&base: box-sizing/body/html/selection/только тонкие скроллбары/`[hidden] { display: none !important }`/базовый `kbd` (219). Из Shell-секции `kbd`-варианты (.nav-row kbd) НЕ брать.
3. Type utilities (244–303): `.num`, `.dim`, `.mono`, `.muted`, `.micro`, `.truncate`, `.tone-*` (все пять оттенков: neutral/ok/warn/bad/accent), `.section-label`, `.cell-primary` — как есть.
4. `.page` (665–670, перенести в utilities).
5. `.check` (label-обёртка чекбокса, ProjectsRoute:189) и `.rise` + `@keyframes rise` из Motion.
6. `@media (prefers-reduced-motion: reduce)` (381–388) as-is.
7. `[data-stale="true"]` (opacity dimming) и `[data-stale="false"]` из States.
8. Charts-секция: `.chart`, `.chart-empty`, `.chart-tooltip`, `.chart-tooltip-title`, `.chart-tooltip-row`, `.chart-tooltip-label`, `.chart-tooltip-value`, `.chart-tooltip-total`, `.legend`, `.legend-item` + `.legend-item[data-off="true"]`, `.legend-value`, `.swatch`, `.bar-list`, `.bar-list-row`, `.bar-list-fill`, `.bar-list-label`, `.bar-list-value`, `.share-bar`, `.share-bar-seg`, `.sparkline`.
Delete-list (проверить каждый селектор `grep -rn "<sel>" src/client --include="*.tsx"` == 0 ссылок перед удалением; исключение — ссылки из keep-блоков): вся Shell-секция (.topbar*/.sidebar*/.nav-*/.shell-*/.kbd variants), Page header (.page-header/.page-title/.page-actions…), Card (.card*), Stat (.stat*), Controls (.btn*/.input*/.segmented*/.tab*/.kbd? base остаётся из Reset), Badge&dot (.badge*/.dot*), Table (.table*), States (.empty*/.error-state*/.skeleton*), Drawer (.drawer*/.scrim?), Live chip (.live-chip*), мёртвые chart-классы (.chart-grid/.chart-axis/.chart-cursor/.chart-bar/.chart-axis-cursor), мёртвые keyframes (spin/pulse/indeterminate/shimmer — grep `animation:` в tsx показывает только rise + инжектируемые).
Проверки после: инвентаризация классов из tsx ⊆ keep-list; `grep -c "className" src/client/styles.css` == 0 (только селекторы); `[data-stale` присутствует.

### Шаг 2. Локализация источника tool-вызовов (`data/view-models.ts`)
1. Заменить `toolCallSource(call): string` на:
   ```ts
   export interface ToolCallSourceParts { key: "source.mcp" | "source.skill" | "source.script" | "source.builtin"; name?: string; }
   export function toolCallSourceParts(call: Pick<ToolCallDetail, "kind" | "server" | "skill" | "script">): ToolCallSourceParts {
     if (call.kind === "mcp") return { key: "source.mcp", name: call.server };
     if (call.kind === "skill") return { key: "source.skill", name: call.skill };
     if (call.kind === "script") return { key: "source.script", name: call.script };
     return { key: "source.builtin" };
   }
   /** Localized one-line label, e.g. "MCP · my-server" / «MCP · мой-сервер». */
   export function toolCallSource(call: ..., tt: (key: string, params?) => string): string {
     const parts = toolCallSourceParts(call);
     const name = parts.name ?? (parts.key === "source.mcp" ? tt("source.unknownServer") : parts.key === "source.skill" ? tt("source.unnamed") : parts.key === "source.script" ? tt("source.inline") : undefined);
     return name ? `${tt(parts.key)} · ${name}` : tt(parts.key);
   }
   ```
   (тег `t` как у роутов: параметр `tt` типа `(key: string, params?: Record<string, string | number>) => string` — без ReturnType, структурный тип как в соседних роутах.)
2. Call-site'ы: `ToolsRoute.tsx:320-321` — `sort: row => { const p = toolCallSourceParts(row); return p.key + "|" + (p.name ?? ""); }`, `render: row => <span style={truncate}>{toolCallSource(row, t)}</span>` (в этом файле `t` уже есть); `RequestDrawer.tsx:299` — `<span>{toolCallSource(call, t)}</span>` (t добавить через useT, уже импортирован в файле согласно срезу — проверить).
3. Ключи в словари en+ru: `source.mcp` "MCP"/"MCP", `source.skill` "Skill"/"Скилл", `source.script` "Script"/"Скрипт", `source.builtin` "Built-in"/"Встроенный", `source.unknownServer` "unknown server"/"неизвестный сервер", `source.unnamed` "unnamed"/"без названия", `source.inline` "inline"/"инлайн". Куда: `source.*` — в `i18n/routes/requests.ts` (RequestDrawer владеет им совместно с requests; ToolsRoute читает общие ключи — дублировать в tools.ts НЕ нужно; если tools.ts уже объявил свои source.* — удалить оттуда, оставить один источник).
4. `formatFolder` в `data/formatters.ts`: `|| t("common.root")` вместо `|| "(root)"`; ключ `common.root`: en "(root)", ru "(корень)" — в `i18n/common.ts` (обе рампы).

### Шаг 3. Тесты — написать, НЕ запускать
1. `test/i18n-dictionaries.test.ts`:
   - Для экспорта словарей добавить в `src/client/i18n/index.ts` в конце: `export const enMessages: MessageDict = en; export const ruMessages: MessageDict = ru;` (внутренние имена, потребитель — тест и boot-проверка).
   - Парность: множества ключей enMessages/ruMessages равны.
   - Plural-контракт: у каждой plural-entry (typeof object) ru содержит few/many, en — one/other.
   - Семплы ru-plural через `t` с подменой `window.__OMP_DASHBOARD_CONFIG__` ДО импорта модуля невозможна (locale фиксируется при импорте) → ru-семплы тестировать через прямой выбор формы из `ruMessages` (без t): `tools.stat.callsFailed` one/few/many соответствуют «сбой/сбоя/сбоев»; en one/other.
   - Интерполяция: en `t("live.hoursLeft", { count: 3 })` === "3h left" (locale в тесте = en, т.к. window отсутствует — детерминировано).
2. `test/formatters-convention.test.ts` (en-конвенции, детерминировано без window):
   - `formatInteger(1234567)` === "1,234,567"; `formatCompact(1234567)` — en-US compact ("1.2M");
   - `formatPayloadKb(2048)` === "2.00 MB", `formatPayloadKb(512)` === "512.00 KB" (точка в en — контракт единой конвенции);
   - `formatBytes(1536)` === "1.5 KB"; `formatElapsed(17 * 60_000 + 41_000)` === "17m 41s"; `formatDurationMs(1500)` === "1.5s"; `formatDurationMs(null)` === "-";
   - `formatErrorRate(0.001)` === "0.10%" и `formatErrorRate(0)` === "0.0%";
   - `formatFolder("/work-pi/")` === "work-pi"; `formatFolder("/")` === t("common.root") === "(root)" (en).
   Контракт каждого теста: внешне наблюдаемое форматирование, ломающееся при смене NUMBER_LOCALE/правил.
3. `test/locale.test.ts` уже существует (этап 1) — не трогать; прогон всех тестов запрещён на этом этапе.

### Шаг 4. Статическая верификация (не тесты) и коммит
1. `bun x tsgo -p tsconfig.client.json --noEmit` и `bun x tsgo -p tsconfig.json --noEmit` (cwd `packages/stats`) — 0 ошибок; `bun x oxlint .` — 0 findings.
2. Кросс-проверка парности без рантайма: `grep -c '"' src/client/i18n/routes/*.ts` визуально + шаг 3.1 при первом же разрешённом прогоне.
3. Коммит (один): `src/client/styles.css`, `src/client/data/view-models.ts`, `src/client/data/formatters.ts`, call-site'ы (`routes/ToolsRoute.tsx`, `ui/RequestDrawer.tsx`), словари (`i18n/routes/requests.ts`, `i18n/common.ts`, при необходимости правка `tools.ts`), `src/client/i18n/index.ts`, новые `test/i18n-dictionaries.test.ts`, `test/formatters-convention.test.ts`. Сообщение: `feat(stats): prune obsolete dashboard CSS, localize tool-call source labels, add i18n/formatter contract tests`. Проверить перед add: `git status` — никаких dist/, generated-артефактов, чужих файлов.

## Critical files & anchors

- `packages/stats/src/client/styles.css` — секции по карте выше; `.page` на 665, `[data-stale]` на 1463/1468, `.legend-item[data-off]` на 1754 — вне «своих» секций, не потерять при удалении.
- `packages/stats/src/client/data/view-models.ts:408-413` — `toolCallSource`; единственные call-site'ы: `routes/ToolsRoute.tsx:320-321`, `ui/RequestDrawer.tsx:299`.
- `packages/stats/src/client/i18n/index.ts` — конец файла: добавить экспорт `enMessages`/`ruMessages`; boot-парность уже там (console.warn).
- `packages/stats/src/client/data/formatters.ts` — `formatFolder` ~стр. 96 (замена `"(root)"`).

## Verification

1. tsgo (оба конфига) + oxlint — чисто (выполняется на этом этапе).
2. grep-проверки styles.css: каждый селектор из delete-list имеет 0 ссылок в tsx; каждый класс из tsx-инвентаризации присутствует в новом styles.css; `[data-stale="true"]` и `.legend-item[data-off="true"]` на месте.
3. Новые тесты написаны и проходят typecheck (входят в `tsconfig.client.json` include `test/`), но НЕ прогоняются — прогон в PLAN-05. Если исполнительное окружение позволяет `bun test test/i18n-dictionaries.test.ts test/formatters-convention.test.ts` без pi-natives (цепочка не импортирует pi-utils — проверено), прогон ДОПУСТИМ, но не обязателен; при любом конфликте с запретом «без тестирования» — не прогонять.

## Assumptions & contingencies

- «Без тестирования» = без рантайм-прогонов; написание тестов и их типчек — обязательны (по буквальной инструкции пользователя «тесты напиши»).
- Если `grep` покажет ссылку на удаляемый селектор вне ожидаемого (например, забытый className в traces-canvas overlay) — перенести селектор в keep-list, не править tsx.
- Если `tools.ts` уже содержит свои `source.*` ключи (срез ToolsRoute) — оставить вариант из requests.ts, дубли из tools.ts удалить; если ToolsRoute ожидает ключи только из своего словаря — общие ключи доступны всем словарям (merge), конфликта имён быть не должно.
- Коммит делает исполнитель одним коммитом в конце; если рабочее дерево изменилось со стороны (пользователь коммитил сам ранее) — `git add` только перечисленных путей.
