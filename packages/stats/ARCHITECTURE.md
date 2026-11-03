# Architecture: omp stats dashboard

The `omp stats` dashboard (`src/client`, bundled to `dist/client` and optionally
embedded into the binary) is a React SPA on **Ant Design v6 + Recharts v3 +
lucide-react**. This note covers the parts that are not obvious from the code.

## Stack decisions

- **Ant Design v6** replaces the hand-written design system (topbar, sidebar,
  cards, tables, drawers, controls). The remaining `styles.css` carries only
  the theme token ramps (`--bg`, `--line-*`, `--ink-*`, `--accent*`,
  `--chart-*`, …), the reset, and utility/chart classes the React code
  references (`.num`, `.tone-*`, `.bar-list*`, `.chart-tooltip*`, `[data-stale]`,
  …). Icons are **lucide-react only**; `@ant-design/icons` never appears in
  `src/` (antd pulls a small internal set of its own for built-in components).
- **Recharts v3** renders every chart (areas, bars, pie, sparklines) from the
  theme tokens. The trace Gantt (`TimelineCanvas`/`Minimap`) stays a custom
  canvas — no library covers it.
- Numbers/dates format through `Intl` at the active locale
  (`intlLocale()` → `en-US`/`ru-RU`) with a single convention in
  `data/formatters.ts`; labels localize through the dictionaries below.

## i18n (en/ru)

- Locale is **fixed at page load** — no flash, no async catalog fetch. The
  server resolves it once at startup and the client reads a boot config.
- Resolution (semantics owned by the coding agent, `coding-agent/src/i18n/`):
  `--lang` flag → omp `language` setting (`~/.omp/config.yml`) → `OMP_LANG` →
  system locale → `en`. `src/locale.ts` mirrors this for standalone
  `omp-stats`; `coding-agent/src/cli/stats-cli.ts` passes its own
  `resolveLocale()` result through `StartServerOptions.locale`.
- Injection: `src/dashboard-html.ts` patches the served `index.html`
  (`<html lang>` + `window.__OMP_DASHBOARD_CONFIG__`) on both the index hit and
  the SPA fallback. Kept free of `@oh-my-pi/pi-utils` imports so the mechanics
  are unit-testable without native bindings.
- Dictionaries: `src/client/i18n/common.ts` (chrome) plus one module per route
  in `src/client/i18n/routes/`, merged in `src/client/i18n/index.ts`.
  **Explicitly imported** — `import.meta.glob` silently resolves empty under
  `Bun.build`, which once shipped a bundle with route strings missing.
  Plural entries follow CLDR shapes: `en` = `one`/`other`, `ru` =
  `one`/`few`/`many`/`other`; parity across locales is enforced by a test.
- `t()` selects the plural form by the active locale's rule and interpolates
  `{name}` params; unknown keys fall back to English and warn on the console.

## Build & embed pipeline

1. `bun run build` (`build.ts`) — `Bun.build` of `src/client/index.tsx` to
   `dist/client` (minified; CSS emitted alongside as `index.css`).
2. `bun run gen:stats` — rebuilds, then archives `dist/client` into a
   byte-stable gzip/tar base64 blob (`scripts/generate-client-bundle.ts`,
   mtimes zeroed) written to `src/embedded-client.generated.txt` for compiled
   binaries. **Convention: the blob is generated for releases and reset to the
   empty checked-in state afterwards** (`gen:stats:reset`) — the dev tree and
   fresh checkouts build the dashboard from source (`src/embedded-client.ts`
   treats blank/non-gzip content as "no archive").
3. The server serves either the embedded archive or `dist/client`, running
   `index.html` through `indexHtmlResponse` (locale injection) in both cases.

## Testing map (`test/`)

Runnable without native bindings (pure TS/React chains):

- `i18n-dictionaries.test.ts` — key parity, CLDR plural shapes, interpolation.
- `formatters-convention.test.ts` — externally visible number/duration formats.
- `dashboard-html.test.ts` — locale injection into served HTML.
- `build-archive.test.ts` — byte-stability of the embedded archive.
- `client-bundle.test.ts` — rebuilds the bundle and asserts route dictionaries,
  the boot hook, and the pruned CSS are actually shipped.
- `errors-route-range.test.tsx` — route re-fetches on range change; stubs
  `getComputedStyle`/`matchMedia` for AntD's CSS-in-JS in the minimal DOM.

Blocked in environments without the prebuilt `pi_natives` addon (no MSVC to
build it): `locale.test.ts` fails at import time
("Failed to load pi_natives native addon for win32-x64") because
`src/locale.ts` imports `@oh-my-pi/pi-utils`. Run it where the addon exists.
