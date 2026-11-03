import type { DashboardLocale } from "./locale";

/**
 * Patch the served index.html with the dashboard locale resolved at server
 * start: `<html lang>` for correctness/accessibility and a boot config script
 * the client reads before first render (the dictionaries are bundled, so no
 * extra request is needed).
 *
 * Lives apart from `server.ts` (and its `@oh-my-pi/pi-utils` imports) so the
 * injection mechanics are testable without native bindings.
 */
export async function indexHtmlResponse(read: () => Promise<string>, locale: DashboardLocale): Promise<Response> {
	const html = (await read())
		.replace("<html lang=\"en\">", `<html lang="${locale}">`)
		.replace(
			"<head>",
			`<head>\n    <script>window.__OMP_DASHBOARD_CONFIG__ = ${JSON.stringify({ locale })};</script>`,
		);
	return new Response(html, { headers: { "Content-Type": "text/html" } });
}
