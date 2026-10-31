import type { AssistantMessage, AssistantMessageEvent } from "../types";
import { AssistantMessageEventStream } from "./event-stream";

/**
 * Exact payload sizes of one inference request/response pair, in bytes.
 *
 * The values are measured at the transport fetch, not derived from tokens: the
 * request size is the serialized (or provider-compressed) body handed to
 * `fetch`, and the response size is every byte read from the response body,
 * streaming frames included. `null` means "not measured" — the transport never
 * saw a body, or the provider does not route through the transport fetch.
 * A retried request overwrites both with the final attempt's numbers.
 */
export interface PayloadMeter {
	requestBytes: number | null;
	responseBytes: number | null;
}

const PAYLOAD_METER = Symbol("omp.payloadMeter");

export function createPayloadMeter(): PayloadMeter {
	return { requestBytes: null, responseBytes: null };
}

/** Bind `meter` to a transport fetch; the fetch keeps the latest bound meter. */
export function attachPayloadMeter(fetch: object, meter: PayloadMeter): void {
	(fetch as { [PAYLOAD_METER]?: PayloadMeter })[PAYLOAD_METER] = meter;
}

/** The meter currently bound to `fetch`, if any. */
export function payloadMeterFor(fetch: object | undefined): PayloadMeter | undefined {
	return fetch ? (fetch as { [PAYLOAD_METER]?: PayloadMeter })[PAYLOAD_METER] : undefined;
}

/**
 * Byte length of a request body as it goes on the wire. Streams, FormData and
 * other one-shot bodies have no known size up front and report `null`.
 */
export function requestBodyBytes(body: unknown): number | null {
	if (body === null || body === undefined) return 0;
	if (typeof body === "string") return Buffer.byteLength(body);
	if (body instanceof Blob) return body.size;
	if (body instanceof URLSearchParams) return Buffer.byteLength(body.toString());
	if (body instanceof ArrayBuffer) return body.byteLength;
	if (ArrayBuffer.isView(body)) return body.byteLength;
	return null;
}

/**
 * Count the bytes a consumer reads from `response`, recording them on `meter`
 * as the stream drains. The body is re-wrapped so `text()`/`json()`/`body` all
 * keep working; status, headers and status text are preserved.
 */
export function tapResponseBytes(response: Response, meter: PayloadMeter): Response {
	const body = response.body;
	if (!body) {
		meter.responseBytes = 0;
		return response;
	}
	const reader = body.getReader();
	let bytes = 0;
	const counted = new ReadableStream<Uint8Array>({
		async pull(controller) {
			try {
				const { done, value } = await reader.read();
				if (done) {
					meter.responseBytes = bytes;
					controller.close();
					return;
				}
				bytes += value.byteLength;
				controller.enqueue(value);
			} catch (error) {
				controller.error(error);
			}
		},
		cancel(reason) {
			meter.responseBytes = bytes;
			return reader.cancel(reason);
		},
	});
	const wrapped = new Response(counted, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
	// Providers read these identity fields (error envelopes, request URLs); the
	// Response constructor cannot carry them over.
	for (const key of ["url", "redirected", "type"] as const) {
		try {
			Object.defineProperty(wrapped, key, { value: response[key], configurable: true });
		} catch {
			// Non-configurable in this runtime: status/headers/body still match.
		}
	}
	return wrapped;
}

/** Stamp a final assistant message with the meter's measured sizes, where known. */
export function applyPayloadMeter(message: AssistantMessage, meter: PayloadMeter): void {
	if (meter.requestBytes !== null) message.requestBytes = meter.requestBytes;
	if (meter.responseBytes !== null) message.responseBytes = meter.responseBytes;
}

/**
 * Forward `inner`, stamping its terminal message with the payload sizes the
 * meter recorded for this turn. Sizes are attached at the terminal event, which
 * providers push only after the response body has been fully consumed.
 */
export function withPayloadMeter(inner: AssistantMessageEventStream, meter: PayloadMeter): AssistantMessageEventStream {
	const outer = new AssistantMessageEventStream();
	void (async () => {
		try {
			for await (const event of inner) {
				const message = terminalMessage(event);
				if (message) applyPayloadMeter(message, meter);
				outer.push(event);
				if (outer.done) return;
			}
			if (!outer.done) outer.end(await inner.result());
		} catch (error) {
			outer.fail(error);
		}
	})();
	return outer;
}

function terminalMessage(event: AssistantMessageEvent): AssistantMessage | undefined {
	if (event.type === "done") return event.message;
	if (event.type === "error") return event.error;
	return undefined;
}
