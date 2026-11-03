import { describe, expect, it } from "bun:test";
import { indexHtmlResponse } from "../src/dashboard-html";

// Contract: every HTML the dashboard server answers with (index hit or SPA
// fallback) boots the client in the locale resolved at server start. A broken
// injection means the UI renders in English for everyone, or reads its config
// after first paint (locale flash).

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>omp stats</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

describe("indexHtmlResponse", () => {
	it("rewrites <html lang> for the resolved locale", async () => {
		const response = await indexHtmlResponse(async () => INDEX_HTML, "ru");
		const html = await response.text();
		expect(html).toContain('<html lang="ru">');
		expect(html).not.toContain('<html lang="en">');
	});

	it("leaves the lang attribute alone for English", async () => {
		const response = await indexHtmlResponse(async () => INDEX_HTML, "en");
		expect(await response.text()).toContain('<html lang="en">');
	});

	it("injects the boot config script as the first element of <head>", async () => {
		const response = await indexHtmlResponse(async () => INDEX_HTML, "ru");
		const html = await response.text();
		expect(html).toContain('<head>\n    <script>window.__OMP_DASHBOARD_CONFIG__ = {"locale":"ru"};</script>');
		// The script must precede the theme snippet so the locale is readable
		// before first paint.
		expect(html.indexOf("__OMP_DASHBOARD_CONFIG__")).toBeLessThan(html.indexOf('charset="UTF-8"'));
	});

	it("serves text/html and reads the source exactly once", async () => {
		let reads = 0;
		const response = await indexHtmlResponse(async () => {
			reads++;
			return INDEX_HTML;
		}, "en");
		expect(response.headers.get("Content-Type")).toBe("text/html");
		await response.text();
		expect(reads).toBe(1);
	});
});
