import { describe, expect, it } from "bun:test";
import { stream } from "@oh-my-pi/pi-ai";
import type { Context, FetchImpl, Model } from "@oh-my-pi/pi-ai/types";
import { getBundledModel } from "@oh-my-pi/pi-catalog/models";

const model = {
	...(getBundledModel("openai", "gpt-4o-mini") as Model<"openai-completions">),
	api: "openai-completions",
} satisfies Model<"openai-completions">;

function baseContext(): Context {
	return { messages: [{ role: "user", content: "Say hello", timestamp: Date.now() }] };
}

function chunk(extra: Record<string, unknown>): Record<string, unknown> {
	return { id: "gen-1", object: "chat.completion.chunk", created: 0, model: model.id, ...extra };
}

function ssePayload(): string {
	return `${[
		chunk({ choices: [{ index: 0, delta: { content: "Hi" } }] }),
		chunk({
			choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
			usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
		}),
	]
		.map(event => `data: ${JSON.stringify(event)}`)
		.join("\n\n")}\n\ndata: [DONE]\n\n`;
}

function sseResponse(): Response {
	return new Response(ssePayload(), { status: 200, headers: { "content-type": "text/event-stream" } });
}

describe("payload metering", () => {
	// Contract: the stats dashboard reports payload volume, so every inference
	// turn must carry the exact bytes the transport put on the wire — the
	// serialized request body and every response byte read back.
	it("records the exact request and response body sizes on the final message", async () => {
		let requestBody: string | undefined;
		const fetchMock: FetchImpl = async (_input, init) => {
			requestBody = typeof init?.body === "string" ? init.body : undefined;
			return sseResponse();
		};

		const message = await stream(model, baseContext(), { apiKey: "test-key", fetch: fetchMock }).result();

		expect(requestBody).toBeDefined();
		expect(message.requestBytes).toBe(Buffer.byteLength(requestBody!));
		expect(message.responseBytes).toBe(Buffer.byteLength(ssePayload()));
		// The wiring must not disturb the turn itself.
		expect(message.stopReason).toBe("stop");
		expect(message.content).toEqual([{ type: "text", text: "Hi" }]);
	});

	it("keeps only the final attempt's sizes when the transport retries", async () => {
		const payload = ssePayload();
		let attempts = 0;
		const fetchMock: FetchImpl = async () => {
			attempts++;
			if (attempts === 1) {
				return new Response("rate limited", { status: 429, headers: { "retry-after": "0" } });
			}
			return new Response(payload, { status: 200, headers: { "content-type": "text/event-stream" } });
		};

		const message = await stream(model, baseContext(), { apiKey: "test-key", fetch: fetchMock }).result();

		expect(attempts).toBeGreaterThan(1);
		expect(message.responseBytes).toBe(Buffer.byteLength(payload));
	});
});
